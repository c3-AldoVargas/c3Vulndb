/*
 * Copyright 2009-2025 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import {
  User,
  UserGroup,
  VulnScanFile,
  Vulnerability,
  SeveritySummary,
  NewCveResult,
  CustomerScanRow,
  ValidationResult,
  ValidationNonMatchResult,
  CustomerScanResult,
} from '../Interfaces';
import { c3Action } from '../c3Action';

export const fetchUsers = async (): Promise<User[]> => {
  const response = await c3Action('User', 'fetch', [{ limit: -1 }]);
  return response.objs;
};

export const fetchUserGroups = async (): Promise<UserGroup[]> => {
  const response = await c3Action('UserGroup', 'fetch', [{ limit: -1 }]);
  return response.objs;
};

/**
 * Fetch all available scan files, ordered by scanDate descending.
 */
export const fetchAvailableFiles = async (): Promise<VulnScanFile[]> => {
  const result = await c3Action('VulnScanFile', 'getAvailableFiles', []);
  return result || [];
};

/**
 * Fetch all vulnerabilities for a given scan file ID.
 */
export const fetchVulnsForFile = async (scanFileId: string): Promise<Vulnerability[]> => {
  const result = await c3Action('Vulnerability', 'getVulnsForFile', [scanFileId]);
  return result || [];
};

/**
 * Fetch severity summary (counts by C3 AI Severity Rating) for a scan file.
 */
export const fetchSeveritySummary = async (scanFileId: string): Promise<SeveritySummary> => {
  const result = await c3Action('Vulnerability', 'getSeveritySummary', [scanFileId]);
  return result || { Critical: 0, High: 0, Medium: 0, Low: 0, total: 0 };
};

/**
 * Fetch new CVE count by comparing two scan files.
 */
export const fetchNewCveCount = async (
  currentFileId: string,
  previousFileId: string
): Promise<NewCveResult> => {
  const result = await c3Action('Vulnerability', 'getNewCveCount', [currentFileId, previousFileId]);
  return result || { newCount: 0, newCveIds: [] };
};

/**
 * Sanitise a single JSON entry by truncating very long string values
 * and stripping control characters that can break HTTP serialization.
 */
const MAX_FIELD_LENGTH = 4000;

function sanitiseEntry(entry: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(entry)) {
    if (typeof val === 'string') {
      // eslint-disable-next-line no-control-regex
      const stripped = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      clean[key] = stripped.length > MAX_FIELD_LENGTH ? stripped.substring(0, MAX_FIELD_LENGTH) : stripped;
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * Upload a JSON vulnerability knowledgebase file using chunked batches.
 * 1. Sanitises all entries and tags each with a global row index (_rowIdx).
 * 2. Creates/updates the VulnScanFile record (small payload).
 * 3. Sends entries in batches of BATCH_SIZE; retries one-by-one on failure.
 * 4. Returns the final VulnScanFile record.
 *
 * NOTE: No deduplication — each row is a unique CVE + container combination.
 */
const UPLOAD_BATCH_SIZE = 50;

export const uploadVulnFile = async (
  fileName: string,
  jsonData: Record<string, unknown>[],
  onProgress?: (loaded: number, total: number) => void
): Promise<VulnScanFile> => {
  // Step 1 — Sanitise and tag every entry with its original row index
  const entries: Record<string, unknown>[] = [];
  for (let idx = 0; idx < jsonData.length; idx++) {
    const entry = jsonData[idx];
    const vid = (entry['Vuln ID'] as string) || (entry['vulnId'] as string) || '';
    if (!vid) continue; // skip rows without a CVE identifier
    const clean = sanitiseEntry(entry);
    clean['_rowIdx'] = idx; // backend uses this for unique ID generation
    entries.push(clean);
  }

  if (entries.length === 0) {
    throw new Error(
      `No entries with a "Vuln ID" or "vulnId" key found. ` +
        `First entry keys: ${jsonData.length > 0 ? Object.keys(jsonData[0]).join(', ') : '(empty)'}`
    );
  }

  // Step 2 — Initialise the scan file record (lightweight call)
  let scanFile: VulnScanFile;
  try {
    scanFile = await c3Action('VulnScanFile', 'initScanFile', [fileName, entries.length]);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`initScanFile failed: ${detail}`);
  }

  // Step 3 — Send entries in batches; retry one-by-one on failure
  let loaded = 0;
  const skippedIds: string[] = [];

  for (let i = 0; i < entries.length; i += UPLOAD_BATCH_SIZE) {
    const chunk = entries.slice(i, i + UPLOAD_BATCH_SIZE);
    try {
      await c3Action('VulnScanFile', 'loadVulnBatch', [scanFile.id, chunk]);
    } catch {
      // Batch failed — retry entries one-by-one to isolate the bad ones
      for (const entry of chunk) {
        try {
          await c3Action('VulnScanFile', 'loadVulnBatch', [scanFile.id, [entry]]);
        } catch {
          const vid = (entry['Vuln ID'] as string) || (entry['vulnId'] as string) || '(unknown)';
          skippedIds.push(vid);
        }
      }
    }
    loaded += chunk.length;
    if (onProgress) {
      onProgress(loaded, entries.length);
    }
  }

  // If some entries were skipped, include that in the result but don't fail
  if (skippedIds.length > 0) {
    scanFile.name = `${skippedIds.length} entries skipped: ${skippedIds.join(', ')}`;
  }

  return scanFile;
};

/**
 * Delete a scan file and all its associated vulnerability records.
 */
export const deleteScanFile = async (scanFileId: string): Promise<boolean> => {
  const result = await c3Action('VulnScanFile', 'deleteScanFile', [scanFileId]);
  return result;
};

// --- Customer Scan Validation ---

/**
 * Validate customer scan rows against the entire vulnerability knowledgebase.
 * Returns matched and non-matched arrays.
 */
export const validateCustomerScan = async (rows: CustomerScanRow[]): Promise<ValidationResult> => {
  const result = await c3Action('Vulnerability', 'validateCustomerScan', [rows]);
  return result || { matched: [], nonMatched: [] };
};

/**
 * Save non-matched CVEs from a customer scan for internal triage.
 */
export const saveUnmatchedResults = async (
  rows: ValidationNonMatchResult[]
): Promise<CustomerScanResult[]> => {
  const result = await c3Action('CustomerScanResult', 'saveUnmatched', [rows]);
  return result || [];
};
