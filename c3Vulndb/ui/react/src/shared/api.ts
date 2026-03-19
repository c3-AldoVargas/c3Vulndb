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
 * Upload a JSON vulnerability knowledgebase file using chunked batches.
 * 1. Creates/updates the VulnScanFile record (small payload).
 * 2. Sends vulnerability entries in batches of BATCH_SIZE to avoid payload limits.
 * 3. Returns the final VulnScanFile record.
 */
const UPLOAD_BATCH_SIZE = 200;

export const uploadVulnFile = async (
  fileName: string,
  jsonData: Record<string, unknown>[],
  onProgress?: (loaded: number, total: number) => void
): Promise<VulnScanFile> => {
  // Step 1 — Deduplicate on the frontend before sending
  const seen = new Set<string>();
  const unique: Record<string, unknown>[] = [];
  for (const entry of jsonData) {
    const vid = (entry['Vuln ID'] as string) || (entry['vulnId'] as string) || '';
    if (vid && !seen.has(vid)) {
      seen.add(vid);
      unique.push(entry);
    }
  }

  // Step 2 — Initialise the scan file record (lightweight call)
  const scanFile: VulnScanFile = await c3Action('VulnScanFile', 'initScanFile', [
    fileName,
    unique.length,
  ]);

  // Step 3 — Send entries in batches
  let loaded = 0;
  for (let i = 0; i < unique.length; i += UPLOAD_BATCH_SIZE) {
    const chunk = unique.slice(i, i + UPLOAD_BATCH_SIZE);
    await c3Action('VulnScanFile', 'loadVulnBatch', [scanFile.id, chunk]);
    loaded += chunk.length;
    if (onProgress) {
      onProgress(loaded, unique.length);
    }
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
