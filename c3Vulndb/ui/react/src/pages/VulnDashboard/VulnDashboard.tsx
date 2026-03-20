/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Grid,
  GridColumn,
  type GridCustomCellProps,
  type GridPageChangeEvent,
  type GridSortChangeEvent,
} from '@progress/kendo-react-grid';
import { orderBy, type SortDescriptor } from '@progress/kendo-data-query';
import { DropDownList, type DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { Input, type InputChangeEvent } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faCircleExclamation,
  faTriangleExclamation,
  faBug,
  faPlus,
  faUpload,
  faFileArrowUp,
  faCheck,
  faXmark,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import TopNav from '@/components/TopNav/TopNav';
import { useTheme } from '@/hooks/useTheme';
import type { VulnScanFile, Vulnerability, SeveritySummary, NewCveResult } from '@/Interfaces';
import {
  fetchAvailableFiles,
  fetchVulnsForFile,
  fetchSeveritySummary,
  fetchNewCveCount,
  uploadVulnFile,
  deleteScanFile,
} from '@/shared/api';

/**
 * Severity rank map — lower number = higher severity.
 * Used to sort severity columns by actual severity order instead of alphabetically.
 */
const C3_SEVERITY_RANK: Record<string, number> = { Critical: 1, High: 2, Medium: 3, Low: 4 };
const MSG_SEVERITY_RANK: Record<string, number> = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
const DEFAULT_SEVERITY_RANK = 5;

function c3SeverityRank(value: string | undefined): number {
  return (value && C3_SEVERITY_RANK[value]) || DEFAULT_SEVERITY_RANK;
}

function msgSeverityRank(value: string | undefined): number {
  return (value && MSG_SEVERITY_RANK[value]) || DEFAULT_SEVERITY_RANK;
}

/** Grid row with computed severity rank fields for correct sort order. */
interface VulnGridRow extends Vulnerability {
  c3AiSeverityRank: number;
  msgSeverityRank: number;
}

/**
 * Maps a C3 AI Severity Rating string to a Tailwind color class.
 */
function severityColor(severity: string): string {
  switch (severity) {
    case 'Critical':
      return 'bg-red-100 text-red-800';
    case 'High':
      return 'bg-orange-100 text-orange-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Maps an external Message Severity string to a Tailwind color class.
 */
function messageSeverityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'LOW':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Custom cell renderer for C3 AI Severity Rating badge.
 */
const C3SeverityCell = (props: GridCustomCellProps) => {
  const dataItem = props.dataItem as VulnGridRow;
  const rating = dataItem.c3AiSeverityRating || 'N/A';
  return (
    <td {...props.tdProps}>
      <span className={`px-2 py-1 rounded text-xs font-medium ${severityColor(rating)}`}>{rating}</span>
    </td>
  );
};

/**
 * Custom cell renderer for Message Severity badge.
 */
const MessageSeverityCell = (props: GridCustomCellProps) => {
  const dataItem = props.dataItem as VulnGridRow;
  const severity = dataItem.messageSeverity || 'N/A';
  return (
    <td {...props.tdProps}>
      <span className={`px-2 py-1 rounded text-xs font-medium ${messageSeverityColor(severity)}`}>
        {severity}
      </span>
    </td>
  );
};

/**
 * Custom cell renderer that truncates long message text.
 */
const MessageCell = (props: GridCustomCellProps) => {
  const dataItem = props.dataItem as VulnGridRow;
  const msg = dataItem.message || '';
  const truncated = msg.length > 120 ? msg.substring(0, 120) + '...' : msg;
  return (
    <td {...props.tdProps} title={msg}>
      <span className="text-xs">{truncated}</span>
    </td>
  );
};

/**
 * Custom cell for Has Fix column.
 */
const HasFixCell = (props: GridCustomCellProps) => {
  const dataItem = props.dataItem as VulnGridRow;
  const fix = dataItem.hasFix;
  return (
    <td {...props.tdProps}>
      {fix ? (
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">{fix}</span>
      ) : (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-500">None</span>
      )}
    </td>
  );
};

export default function VulnDashboard() {
  useTheme();

  // Data state
  const [scanFiles, setScanFiles] = useState<VulnScanFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<VulnScanFile | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [severitySummary, setSeveritySummary] = useState<SeveritySummary>({
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    total: 0,
  });
  const [newCveResult, setNewCveResult] = useState<NewCveResult>({ newCount: 0, newCveIds: [] });

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [skip, setSkip] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sort, setSort] = useState<SortDescriptor[]>([]);

  // Upload state
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  /**
   * Load available scan files.
   */
  const loadScanFiles = useCallback(async (selectFileId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const files = await fetchAvailableFiles();
      setScanFiles(files);
      if (selectFileId) {
        const target = files.find((f) => f.id === selectFileId);
        if (target) {
          setSelectedFile(target);
          return;
        }
      }
      if (files.length > 0 && !selectedFile) {
        setSelectedFile(files[0]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load scan files';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedFile]);

  useEffect(() => {
    loadScanFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load vulnerability data when selected file changes.
   */
  const loadDashboardData = useCallback(async (file: VulnScanFile, allFiles: VulnScanFile[]) => {
    try {
      setDataLoading(true);
      setError(null);
      setSkip(0);
      setSearchText('');
      setSort([]);

      const [vulns, summary] = await Promise.all([
        fetchVulnsForFile(file.id),
        fetchSeveritySummary(file.id),
      ]);

      setVulnerabilities(vulns);
      setSeveritySummary(summary);

      const currentIndex = allFiles.findIndex((f) => f.id === file.id);
      if (currentIndex >= 0 && currentIndex < allFiles.length - 1) {
        const previousFile = allFiles[currentIndex + 1];
        const cveResult = await fetchNewCveCount(file.id, previousFile.id);
        setNewCveResult(cveResult);
      } else {
        setNewCveResult({ newCount: vulns.length, newCveIds: vulns.map((v) => v.vulnId) });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load vulnerability data';
      setError(msg);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFile && scanFiles.length > 0) {
      loadDashboardData(selectedFile, scanFiles);
    }
  }, [selectedFile, scanFiles, loadDashboardData]);

  /**
   * Handle scan file selection change.
   */
  const handleFileChange = (e: DropDownListChangeEvent) => {
    setSelectedFile(e.value as VulnScanFile);
  };

  /**
   * Handle grid pagination.
   */
  const handlePageChange = (event: GridPageChangeEvent) => {
    setSkip(event.page.skip);
    setPageSize(event.page.take);
  };

  /**
   * Handle grid column sorting.
   */
  const handleSortChange = (event: GridSortChangeEvent) => {
    setSort(event.sort);
    setSkip(0);
  };

  /**
   * Handle file input change — validate it's a JSON file.
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.name.endsWith('.json')) {
      setUploadResult({ success: false, message: 'Only .json files are accepted.' });
      setUploadFile(null);
      return;
    }
    setUploadFile(file);
    setUploadResult(null);
  };

  /**
   * Open the upload modal.
   */
  const openUploadModal = () => {
    setUploadFile(null);
    setUploadResult(null);
    setUploadModalOpen(true);
  };

  /**
   * Close the upload modal.
   */
  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setUploadFile(null);
    setUploadResult(null);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Perform the file upload — read JSON, send to backend in chunked batches.
   */
  const handleUpload = useCallback(async () => {
    if (!uploadFile) return;

    setUploading(true);
    setUploadResult(null);
    setUploadProgress(null);

    try {
      const text = await uploadFile.text();
      let jsonData: Record<string, unknown>[];

      try {
        jsonData = JSON.parse(text);
      } catch {
        setUploadResult({ success: false, message: 'Invalid JSON format. Please check the file contents.' });
        setUploading(false);
        return;
      }

      if (!Array.isArray(jsonData)) {
        setUploadResult({ success: false, message: 'JSON file must contain an array of vulnerability entries.' });
        setUploading(false);
        return;
      }

      const result = await uploadVulnFile(uploadFile.name, jsonData, (loaded, total) => {
        setUploadProgress({ loaded, total });
      });

      const skippedInfo = result.name && result.name.includes('skipped') ? `\n⚠️ ${result.name}` : '';
      setUploadResult({
        success: true,
        message: `Successfully loaded ${result.vulnCount} vulnerabilities from "${result.fileName}" (Release: ${result.release}).${skippedInfo}`,
      });

      // Refresh the file list and auto-select the new file
      await loadScanFiles(result.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err || 'Upload failed');
      setUploadResult({ success: false, message: msg });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [uploadFile, loadScanFiles]);

  /**
   * Delete the currently selected scan file after confirmation.
   */
  const handleDelete = useCallback(async () => {
    if (!selectedFile) return;

    setDeleting(true);
    try {
      await deleteScanFile(selectedFile.id);
      setDeleteConfirmOpen(false);

      // Refresh file list and select the first remaining file
      const files = await fetchAvailableFiles();
      setScanFiles(files);
      setSelectedFile(files.length > 0 ? files[0] : null);

      if (files.length === 0) {
        setVulnerabilities([]);
        setSeveritySummary({ Critical: 0, High: 0, Medium: 0, Low: 0, total: 0 });
        setNewCveResult({ newCount: 0, newCveIds: [] });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed. Please try again.';
      setError(msg);
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  }, [selectedFile]);

  /**
   * Filter vulnerabilities by search text across key fields,
   * then enrich each row with numeric severity ranks for correct sort order.
   */
  const filteredVulnerabilities = useMemo((): VulnGridRow[] => {
    let result = vulnerabilities;

    if (searchText.trim()) {
      const term = searchText.toLowerCase();
      result = result.filter(
        (v) =>
          (v.vulnId && v.vulnId.toLowerCase().includes(term)) ||
          (v.message && v.message.toLowerCase().includes(term)) ||
          (v.repository && v.repository.toLowerCase().includes(term)) ||
          (v.classifications && v.classifications.toLowerCase().includes(term)) ||
          (v.c3AiSeverityRating && v.c3AiSeverityRating.toLowerCase().includes(term)) ||
          (v.c3AiResponse && v.c3AiResponse.toLowerCase().includes(term)) ||
          (v.tag && v.tag.toLowerCase().includes(term))
      );
    }

    return result.map((v) => ({
      ...v,
      c3AiSeverityRank: c3SeverityRank(v.c3AiSeverityRating),
      msgSeverityRank: msgSeverityRank(v.messageSeverity),
    }));
  }, [vulnerabilities, searchText]);

  /**
   * Sorted and paginated data slice for the grid.
   */
  const paginatedData = useMemo(() => {
    const sorted = sort.length > 0 ? orderBy(filteredVulnerabilities, sort) : filteredVulnerabilities;
    return sorted.slice(skip, skip + pageSize);
  }, [filteredVulnerabilities, sort, skip, pageSize]);

  if (loading) {
    return (
      <>
        <TopNav title="C3 Vulnerability Database" />
        <div className="flex items-center justify-center h-64">
          <p className="text-secondary text-lg">Loading vulnerability database...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopNav title="C3 Vulnerability Database" />
      <div className="p-4">
        {/* Scan File Selector + Upload Button */}
        <div className="c3-card mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldHalved} className="text-accent text-lg" />
              <label htmlFor="scan-file-select" className="text-sm font-medium whitespace-nowrap">
                Scan File:
              </label>
            </div>
            <DropDownList
              id="scan-file-select"
              data={scanFiles}
              value={selectedFile}
              onChange={handleFileChange}
              textField="fileName"
              dataItemKey="id"
              className="w-full sm:w-96"
            />
            {selectedFile && (
              <div className="flex items-center gap-4 text-sm text-secondary">
                <span>
                  Release: <strong>{selectedFile.release}</strong>
                </span>
                <span>
                  Type: <strong>{selectedFile.scanType}</strong>
                </span>
              </div>
            )}
            <div className="sm:ml-auto flex-shrink-0 flex items-center gap-2">
              <Button themeColor="primary" onClick={openUploadModal}>
                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                Upload JSON
              </Button>
              {selectedFile && (
                <Button
                  themeColor="error"
                  fillMode="outline"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="c3-card mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-weak w-full">
            {/* Critical */}
            <div className="p-4 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faCircleExclamation} className="text-red-600" />
                <span className="text-sm text-secondary font-medium">CRITICAL</span>
              </div>
              <span className="text-3xl font-bold text-red-600">
                {dataLoading ? '...' : severitySummary.Critical}
              </span>
            </div>

            {/* High */}
            <div className="p-4 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faTriangleExclamation} className="text-orange-500" />
                <span className="text-sm text-secondary font-medium">HIGH</span>
              </div>
              <span className="text-3xl font-bold text-orange-500">
                {dataLoading ? '...' : severitySummary.High}
              </span>
            </div>

            {/* Medium */}
            <div className="p-4 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faBug} className="text-yellow-500" />
                <span className="text-sm text-secondary font-medium">MEDIUM</span>
              </div>
              <span className="text-3xl font-bold text-yellow-500">
                {dataLoading ? '...' : severitySummary.Medium}
              </span>
            </div>

            {/* Low */}
            <div className="p-4 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faShieldHalved} className="text-green-600" />
                <span className="text-sm text-secondary font-medium">LOW</span>
              </div>
              <span className="text-3xl font-bold text-green-600">
                {dataLoading ? '...' : severitySummary.Low}
              </span>
            </div>

            {/* New CVEs */}
            <div className="p-4 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faPlus} className="text-accent" />
                <span className="text-sm text-secondary font-medium">NEW CVEs</span>
              </div>
              <span className="text-3xl font-bold text-accent">
                {dataLoading ? '...' : `+${newCveResult.newCount}`}
              </span>
              <span className="text-xs text-secondary mt-1">vs. previous scan</span>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="c3-card mb-4 border-danger">
            <p className="text-danger">{error}</p>
          </div>
        )}

        {/* Vulnerability Data Grid */}
        <div className="c3-card">
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium">Vulnerabilities</h2>
                <p className="text-sm text-secondary">
                  {filteredVulnerabilities.length} of {vulnerabilities.length} entries
                  {searchText && ' (filtered)'}
                </p>
              </div>
              <div className="relative flex-shrink-0">
                <Input
                  value={searchText}
                  onChange={(e: InputChangeEvent) => {
                    setSearchText(e.value);
                    setSkip(0);
                  }}
                  placeholder="Search by CVE, message, repo, classification..."
                  className="w-full sm:w-96"
                />
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            {dataLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-secondary">Loading vulnerabilities...</p>
              </div>
            ) : (
              <Grid
                data={paginatedData}
                skip={skip}
                take={pageSize}
                total={filteredVulnerabilities.length}
                pageable={{ pageSizes: [10, 25, 50], buttonCount: 5 }}
                onPageChange={handlePageChange}
                sortable={{ allowUnsort: true, mode: 'multiple' }}
                sort={sort}
                onSortChange={handleSortChange}
                style={{ width: '100%' }}
                resizable={true}
              >
                <GridColumn field="vulnId" title="Vuln ID" minResizableWidth={140} />
                <GridColumn
                  field="c3AiSeverityRank"
                  title="C3 AI Severity"
                  cells={{ data: C3SeverityCell }}
                  minResizableWidth={130}
                />
                <GridColumn
                  field="msgSeverityRank"
                  title="Ext. Severity"
                  cells={{ data: MessageSeverityCell }}
                  minResizableWidth={130}
                />
                <GridColumn field="repository" title="Repository" minResizableWidth={180} />
                <GridColumn field="tag" title="Tag" minResizableWidth={100} />
                <GridColumn field="c3AiResponse" title="C3 AI Response" minResizableWidth={140} />
                <GridColumn field="classifications" title="Classification" minResizableWidth={150} />
                <GridColumn
                  field="hasFix"
                  title="Has Fix"
                  cells={{ data: HasFixCell }}
                  minResizableWidth={100}
                />
                <GridColumn
                  field="message"
                  title="Message"
                  cells={{ data: MessageCell }}
                  minResizableWidth={250}
                />
              </Grid>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <Dialog onClose={closeUploadModal} title="Upload Vulnerability JSON" width="550px">
          <div className="p-4">
            <p className="text-sm text-secondary mb-4">
              Upload a CVE knowledgebase JSON file. The file name should follow the naming convention
              (e.g., <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">new_8.9.1_66_cve_knowledgebase.json</code>).
              The release and scan type will be parsed automatically from the file name.
            </p>

            {/* Drop zone / file input */}
            <div
              role="button"
              tabIndex={0}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.name.endsWith('.json')) {
                  setUploadFile(file);
                  setUploadResult(null);
                } else {
                  setUploadResult({ success: false, message: 'Only .json files are accepted.' });
                }
              }}
            >
              <FontAwesomeIcon
                icon={faFileArrowUp}
                className={`text-4xl mb-3 ${uploadFile ? 'text-accent' : 'text-gray-400'}`}
              />
              {uploadFile ? (
                <div>
                  <p className="font-medium">{uploadFile.name}</p>
                  <p className="text-sm text-secondary mt-1">
                    {(uploadFile.size / 1024).toFixed(1)} KB — Click or drop to replace
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Click to select or drag & drop a JSON file</p>
                  <p className="text-sm text-secondary mt-1">Only .json files are accepted</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>

            {/* Upload progress bar */}
            {uploading && uploadProgress && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-secondary mb-1">
                  <span>
                    Uploading batch {Math.ceil(uploadProgress.loaded / 200)} of{' '}
                    {Math.ceil(uploadProgress.total / 200)}
                  </span>
                  <span>
                    {uploadProgress.loaded} / {uploadProgress.total} entries
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ width: `${(uploadProgress.loaded / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload result message */}
            {uploadResult && (
              <div
                className={`mt-4 p-3 rounded flex items-start gap-2 ${
                  uploadResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                <FontAwesomeIcon
                  icon={uploadResult.success ? faCheck : faXmark}
                  className="mt-0.5 flex-shrink-0"
                />
                <span className="text-sm">{uploadResult.message}</span>
              </div>
            )}
          </div>

          <DialogActionsBar layout="stretched">
            <div className="flex justify-end gap-2">
              <Button onClick={closeUploadModal} fillMode="outline" themeColor="base">
                {uploadResult?.success ? 'Close' : 'Cancel'}
              </Button>
              {!uploadResult?.success && (
                <Button
                  onClick={handleUpload}
                  themeColor="primary"
                  disabled={!uploadFile || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload & Process'}
                </Button>
              )}
            </div>
          </DialogActionsBar>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && selectedFile && (
        <Dialog onClose={() => setDeleteConfirmOpen(false)} title="Confirm Deletion" width="450px">
          <div className="p-4">
            <p className="text-sm mb-2">
              Are you sure you want to delete this scan file and all its associated vulnerabilities?
            </p>
            <div className="bg-red-50 p-3 rounded mt-3">
              <p className="text-sm font-medium text-red-800">
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                {selectedFile.fileName}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {selectedFile.vulnCount} vulnerability records will be permanently removed.
              </p>
            </div>
          </div>
          <DialogActionsBar layout="stretched">
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setDeleteConfirmOpen(false)}
                fillMode="outline"
                themeColor="base"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button onClick={handleDelete} themeColor="error" disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
}
