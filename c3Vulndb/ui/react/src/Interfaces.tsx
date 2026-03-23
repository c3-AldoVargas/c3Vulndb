/*
 * Copyright 2009-2025 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import { ReactElement } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  lastName: string;
  firstName: string;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
}

export interface SnackbarMessage {
  message: ReactElement;
  key: number;
  severity?: 'success' | 'info' | 'warning' | 'error';
  error?: boolean;
}

export interface VulnScanFile {
  id: string;
  name: string;
  fileName: string;
  release: string;
  scanType: string;
  scanDate: string;
  vulnCount: number;
}

export interface Vulnerability {
  id: string;
  vulnId: string;
  path: string;
  trigger: string;
  message: string;
  repository: string;
  tag: string;
  image: string;
  messageSeverity: string;
  hasFix: string;
  externalCvssVector: string;
  classifications: string;
  c3AiCvss4Vector: string;
  c3AiSeverityRating: string;
  c3AiResponse: string;
  vulnComments: string;
  scanFile: VulnScanFile;
}

export interface SeveritySummary {
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
  total: number;
}

export interface NewCveResult {
  newCount: number;
  newCveIds: string[];
}

// --- Customer Scan Validation ---

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string | null;
}

export interface CustomerScanRow {
  vulnId: string;
  image: string;
  tag: string;
  repository: string;
  messageSeverity: string;
  path: string;
  classifications: string;
  hasFix: string;
  externalCvssVector: string;
  message: string;
}

export interface ValidationMatchResult {
  vulnId: string;
  customerSeverity: string;
  customerImage: string;
  customerTag: string;
  customerRepository: string;
  c3AiSeverityRating: string;
  c3AiResponse: string;
  messageSeverity: string;
  containerMatch: boolean;
  releases: string[];
  kbRecord: Record<string, string>;
}

export interface ValidationNonMatchResult {
  vulnId: string;
  customerSeverity: string;
  customerImage: string;
  customerTag: string;
  customerRepository: string;
  kbRecord: Record<string, string>;
}

export interface ValidationResult {
  matched: ValidationMatchResult[];
  nonMatched: ValidationNonMatchResult[];
}

export interface CustomerScanResult {
  id: string;
  vulnId: string;
  image: string;
  tag: string;
  repository: string;
  messageSeverity: string;
  scanDate: string;
  status: string;
}
