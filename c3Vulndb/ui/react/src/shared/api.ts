/*
 * Copyright 2009-2025 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import { User, UserGroup, VulnScanFile, Vulnerability, SeveritySummary, NewCveResult } from '../Interfaces';
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
 * Upload a JSON vulnerability knowledgebase file.
 * Sends the file name and parsed JSON content to the backend for processing.
 */
export const uploadVulnFile = async (
  fileName: string,
  jsonData: Record<string, unknown>[]
): Promise<VulnScanFile> => {
  const result = await c3Action('VulnScanFile', 'loadJsonData', [fileName, jsonData]);
  return result;
};

/**
 * Delete a scan file and all its associated vulnerability records.
 */
export const deleteScanFile = async (scanFileId: string): Promise<boolean> => {
  const result = await c3Action('VulnScanFile', 'deleteScanFile', [scanFileId]);
  return result;
};
