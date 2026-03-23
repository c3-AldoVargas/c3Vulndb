/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Grid,
  GridColumn,
  type GridCustomCellProps,
  type GridPageChangeEvent,
  type GridSortChangeEvent,
} from '@progress/kendo-react-grid';
import { orderBy, type SortDescriptor } from '@progress/kendo-data-query';
import { Input, type InputChangeEvent } from '@progress/kendo-react-inputs';
import { Button } from '@progress/kendo-react-buttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark, faDownload } from '@fortawesome/free-solid-svg-icons';
import type { ValidationMatchResult, ValidationNonMatchResult } from '@/Interfaces';
import VulnDetailViewer, { type DetailField } from '@/components/VulnDetail/VulnDetailViewer';

interface ResultsStepProps {
  matched: ValidationMatchResult[];
  nonMatched: ValidationNonMatchResult[];
}

/** Severity badge color helper. */
function severityColor(severity: string): string {
  const s = severity?.toLowerCase() || '';
  if (s === 'critical') return 'bg-red-100 text-red-800';
  if (s === 'high') return 'bg-orange-100 text-orange-800';
  if (s === 'medium') return 'bg-yellow-100 text-yellow-800';
  if (s === 'low') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
}

/** Container Match pill cell. */
const ContainerMatchCell = (props: GridCustomCellProps) => {
  const dataItem = props.dataItem as ValidationMatchResult;
  return (
    <td {...props.tdProps}>
      {dataItem.containerMatch ? (
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          <FontAwesomeIcon icon={faCircleCheck} className="mr-1" />
          Match
        </span>
      ) : (
        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
          <FontAwesomeIcon icon={faCircleXmark} className="mr-1" />
          No Match
        </span>
      )}
    </td>
  );
};

/** C3 Severity badge cell. */
const C3SeverityCell = (props: GridCustomCellProps) => {
  const dataItem = props.dataItem as ValidationMatchResult;
  const rating = dataItem.c3AiSeverityRating || 'N/A';
  return (
    <td {...props.tdProps}>
      <span className={`px-2 py-1 rounded text-xs font-medium ${severityColor(rating)}`}>{rating}</span>
    </td>
  );
};

/** Customer severity badge cell. */
const CustomerSeverityCell = (props: GridCustomCellProps) => {
  const dataItem = props.dataItem as ValidationMatchResult | ValidationNonMatchResult;
  const sev = dataItem.customerSeverity || 'N/A';
  return (
    <td {...props.tdProps}>
      <span className={`px-2 py-1 rounded text-xs font-medium ${severityColor(sev)}`}>{sev}</span>
    </td>
  );
};

/** Releases cell — join as comma-separated string. */
const ReleasesCell = (props: GridCustomCellProps) => {
  const dataItem = props.dataItem as ValidationMatchResult;
  const releases = dataItem.releases || [];
  return (
    <td {...props.tdProps}>
      <span className="text-xs">{releases.join(', ') || '—'}</span>
    </td>
  );
};

export default function ResultsStep({ matched, nonMatched }: ResultsStepProps) {
  const [activeTab, setActiveTab] = useState<'matched' | 'nonMatched'>('matched');

  // Detail viewer state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailFields, setDetailFields] = useState<DetailField[]>([]);

  // Matched grid state
  const [matchedSearch, setMatchedSearch] = useState('');
  const [matchedSkip, setMatchedSkip] = useState(0);
  const [matchedPageSize, setMatchedPageSize] = useState(10);
  const [matchedSort, setMatchedSort] = useState<SortDescriptor[]>([]);

  // Non-matched grid state
  const [nonMatchedSearch, setNonMatchedSearch] = useState('');
  const [nonMatchedSkip, setNonMatchedSkip] = useState(0);
  const [nonMatchedPageSize, setNonMatchedPageSize] = useState(10);
  const [nonMatchedSort, setNonMatchedSort] = useState<SortDescriptor[]>([]);

  const totalCount = matched.length + nonMatched.length;
  const coveragePct = totalCount > 0 ? Math.round((matched.length / totalCount) * 100) : 0;

  // --- Matched grid data pipeline ---
  const filteredMatched = useMemo(() => {
    if (!matchedSearch.trim()) return matched;
    const term = matchedSearch.toLowerCase();
    return matched.filter(
      (r) =>
        r.vulnId?.toLowerCase().includes(term) ||
        r.c3AiSeverityRating?.toLowerCase().includes(term) ||
        r.c3AiResponse?.toLowerCase().includes(term) ||
        r.customerSeverity?.toLowerCase().includes(term) ||
        r.releases?.some((rel) => rel.toLowerCase().includes(term))
    );
  }, [matched, matchedSearch]);

  const paginatedMatched = useMemo(() => {
    const sorted = matchedSort.length > 0 ? orderBy(filteredMatched, matchedSort) : filteredMatched;
    return sorted.slice(matchedSkip, matchedSkip + matchedPageSize);
  }, [filteredMatched, matchedSort, matchedSkip, matchedPageSize]);

  // --- Non-matched grid data pipeline ---
  const filteredNonMatched = useMemo(() => {
    if (!nonMatchedSearch.trim()) return nonMatched;
    const term = nonMatchedSearch.toLowerCase();
    return nonMatched.filter(
      (r) =>
        r.vulnId?.toLowerCase().includes(term) ||
        r.customerSeverity?.toLowerCase().includes(term) ||
        r.customerImage?.toLowerCase().includes(term) ||
        r.customerTag?.toLowerCase().includes(term) ||
        r.customerRepository?.toLowerCase().includes(term)
    );
  }, [nonMatched, nonMatchedSearch]);

  const paginatedNonMatched = useMemo(() => {
    const sorted = nonMatchedSort.length > 0 ? orderBy(filteredNonMatched, nonMatchedSort) : filteredNonMatched;
    return sorted.slice(nonMatchedSkip, nonMatchedSkip + nonMatchedPageSize);
  }, [filteredNonMatched, nonMatchedSort, nonMatchedSkip, nonMatchedPageSize]);

  /** Open the detail viewer for a matched row. */
  const openMatchedDetail = useCallback((row: ValidationMatchResult) => {
    const fields: DetailField[] = Object.entries(row.kbRecord).map(([label, value]) => ({
      label,
      value: value || '',
    }));
    // Append validation-specific context
    fields.push({ label: 'Container Match', value: row.containerMatch ? 'Yes' : 'No' });
    fields.push({ label: 'Releases', value: (row.releases || []).join(', ') || '—' });
    fields.push({ label: 'Cust. Severity', value: row.customerSeverity || '' });
    setDetailTitle(row.vulnId);
    setDetailFields(fields);
    setDetailOpen(true);
  }, []);

  /** Open the detail viewer for a non-matched row. */
  const openNonMatchedDetail = useCallback((row: ValidationNonMatchResult) => {
    const fields: DetailField[] = Object.entries(row.kbRecord).map(([label, value]) => ({
      label,
      value: value || '',
    }));
    fields.push({ label: 'Cust. Severity', value: row.customerSeverity || '' });
    setDetailTitle(row.vulnId);
    setDetailFields(fields);
    setDetailOpen(true);
  }, []);

  /** Clickable Vuln ID cell for the matched grid. */
  const MatchedVulnIdCell = useCallback(
    (props: GridCustomCellProps) => {
      const dataItem = props.dataItem as ValidationMatchResult;
      return (
        <td {...props.tdProps}>
          <button
            className="text-accent hover:underline font-medium text-left"
            onClick={() => openMatchedDetail(dataItem)}
          >
            {dataItem.vulnId}
          </button>
        </td>
      );
    },
    [openMatchedDetail]
  );

  /** Clickable Vuln ID cell for the non-matched grid. */
  const NonMatchedVulnIdCell = useCallback(
    (props: GridCustomCellProps) => {
      const dataItem = props.dataItem as ValidationNonMatchResult;
      return (
        <td {...props.tdProps}>
          <button
            className="text-accent hover:underline font-medium text-left"
            onClick={() => openNonMatchedDetail(dataItem)}
          >
            {dataItem.vulnId}
          </button>
        </td>
      );
    },
    [openNonMatchedDetail]
  );

  // --- Actions ---
  /** Download a JSON array as a file. */
  const downloadJson = useCallback((data: Record<string, string>[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleExportMatched = useCallback(() => {
    const kbRecords = matched.map((m) => m.kbRecord);
    downloadJson(kbRecords, `matched_vulnerabilities_${new Date().toISOString().slice(0, 10)}.json`);
  }, [matched, downloadJson]);

  const handleExportNonMatched = useCallback(() => {
    const kbRecords = nonMatched.map((m) => m.kbRecord);
    downloadJson(kbRecords, `non_matched_vulnerabilities_${new Date().toISOString().slice(0, 10)}.json`);
  }, [nonMatched, downloadJson]);

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-green-50 text-center">
          <p className="text-sm text-green-700 font-medium">Matched</p>
          <p className="text-3xl font-bold text-green-700">{matched.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-orange-50 text-center">
          <p className="text-sm text-orange-700 font-medium">Non-Matched</p>
          <p className="text-3xl font-bold text-orange-700">{nonMatched.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-blue-50 text-center">
          <p className="text-sm text-blue-700 font-medium">Coverage</p>
          <p className="text-3xl font-bold text-blue-700">{coveragePct}%</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-4">
        {matched.length > 0 && (
          <Button themeColor="primary" fillMode="outline" onClick={handleExportMatched}>
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Export Matched
          </Button>
        )}
        {nonMatched.length > 0 && (
          <Button themeColor="primary" fillMode="outline" onClick={handleExportNonMatched}>
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Export Non-Matched
          </Button>
        )}
      </div>

      {/* Tab Buttons */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'matched'
              ? 'border-accent text-accent'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
          onClick={() => setActiveTab('matched')}
        >
          Matched ({matched.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'nonMatched'
              ? 'border-accent text-accent'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
          onClick={() => setActiveTab('nonMatched')}
        >
          Non-Matched ({nonMatched.length})
        </button>
      </div>

      {/* Matched Grid */}
      {activeTab === 'matched' && (
        <div>
          <div className="mb-3">
            <Input
              value={matchedSearch}
              onChange={(e: InputChangeEvent) => {
                setMatchedSearch(e.value);
                setMatchedSkip(0);
              }}
              placeholder="Search matched CVEs..."
              className="w-full sm:w-80"
            />
          </div>
          <div className="w-full overflow-x-auto">
            <Grid
              data={paginatedMatched}
              skip={matchedSkip}
              take={matchedPageSize}
              total={filteredMatched.length}
              pageable={{ pageSizes: [10, 25, 50], buttonCount: 5 }}
              onPageChange={(e: GridPageChangeEvent) => {
                setMatchedSkip(e.page.skip);
                setMatchedPageSize(e.page.take);
              }}
              sortable={{ allowUnsort: true, mode: 'multiple' }}
              sort={matchedSort}
              onSortChange={(e: GridSortChangeEvent) => {
                setMatchedSort(e.sort);
                setMatchedSkip(0);
              }}
              style={{ width: '100%' }}
              resizable={true}
            >
              <GridColumn field="vulnId" title="CVE ID" cells={{ data: MatchedVulnIdCell }} minResizableWidth={160} />
              <GridColumn
                field="customerSeverity"
                title="Cust. Severity"
                cells={{ data: CustomerSeverityCell }}
                minResizableWidth={130}
              />
              <GridColumn
                field="c3AiSeverityRating"
                title="C3 AI Severity"
                cells={{ data: C3SeverityCell }}
                minResizableWidth={130}
              />
              <GridColumn field="c3AiResponse" title="C3 AI Response" minResizableWidth={150} />
              <GridColumn
                field="containerMatch"
                title="Container Match"
                cells={{ data: ContainerMatchCell }}
                minResizableWidth={140}
              />
              <GridColumn
                field="releases"
                title="Releases"
                cells={{ data: ReleasesCell }}
                minResizableWidth={150}
              />
            </Grid>
          </div>
        </div>
      )}

      {/* Non-Matched Grid */}
      {activeTab === 'nonMatched' && (
        <div>
          <div className="mb-3">
            <Input
              value={nonMatchedSearch}
              onChange={(e: InputChangeEvent) => {
                setNonMatchedSearch(e.value);
                setNonMatchedSkip(0);
              }}
              placeholder="Search non-matched CVEs..."
              className="w-full sm:w-80"
            />
          </div>
          <div className="w-full overflow-x-auto">
            <Grid
              data={paginatedNonMatched}
              skip={nonMatchedSkip}
              take={nonMatchedPageSize}
              total={filteredNonMatched.length}
              pageable={{ pageSizes: [10, 25, 50], buttonCount: 5 }}
              onPageChange={(e: GridPageChangeEvent) => {
                setNonMatchedSkip(e.page.skip);
                setNonMatchedPageSize(e.page.take);
              }}
              sortable={{ allowUnsort: true, mode: 'multiple' }}
              sort={nonMatchedSort}
              onSortChange={(e: GridSortChangeEvent) => {
                setNonMatchedSort(e.sort);
                setNonMatchedSkip(0);
              }}
              style={{ width: '100%' }}
              resizable={true}
            >
              <GridColumn field="vulnId" title="CVE ID" cells={{ data: NonMatchedVulnIdCell }} minResizableWidth={160} />
              <GridColumn
                field="customerSeverity"
                title="Cust. Severity"
                cells={{ data: CustomerSeverityCell }}
                minResizableWidth={130}
              />
              <GridColumn field="customerImage" title="Image" minResizableWidth={250} />
              <GridColumn field="customerTag" title="Tag" minResizableWidth={100} />
              <GridColumn field="customerRepository" title="Repository" minResizableWidth={180} />
            </Grid>
          </div>
        </div>
      )}

      {/* Vulnerability Detail Viewer */}
      <VulnDetailViewer
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailTitle}
        fields={detailFields}
      />
    </div>
  );
}
