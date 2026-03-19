/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { projects, programs, owners, checklists, uploadedBy } from '@/data/sampleData';
import { Document } from '@/Interfaces';
import { fetchDocuments, DocumentFilters } from '@/shared/api';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Grid, GridColumn, GridCustomCellProps } from '@progress/kendo-react-grid';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { Input } from '@progress/kendo-react-inputs';
import { ExpansionPanel, ExpansionPanelContent } from '@progress/kendo-react-layout';
import { Reveal } from '@progress/kendo-react-animation';
import { chevronUpIcon, chevronDownIcon } from '@progress/kendo-svg-icons';
import TopNav from '@/components/TopNav/TopNav';

interface DocumentRow {
  documentName: string;
  program: string;
  owner: string;
  checklistApplied: string;
  attachments: number;
  uploadedBy: string;
  uploadedAt: string;
}

export default function DashboardPage() {
  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [skip, setSkip] = useState<number>(0);

  // Temporary filter selections (not yet applied)
  const [selectedProject, setSelectedProject] = useState<{ text: string; value: string } | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<{ text: string; value: string } | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<{ text: string; value: string } | null>(null);
  const [selectedChecklist, setSelectedChecklist] = useState<{ text: string; value: string } | null>(null);
  const [selectedUploadedBy, setSelectedUploadedBy] = useState<{ text: string; value: string } | null>(null);
  const [uploadDate, setUploadDate] = useState<Date | null>(null);
  const [searchText, setSearchText] = useState<string>('');

  // Applied filters (used for actual filtering)
  const [appliedProgram, setAppliedProgram] = useState<{ text: string; value: string } | null>(null);
  const [appliedOwner, setAppliedOwner] = useState<{ text: string; value: string } | null>(null);
  const [appliedChecklist, setAppliedChecklist] = useState<{ text: string; value: string } | null>(null);
  const [appliedUploadedBy, setAppliedUploadedBy] = useState<{ text: string; value: string } | null>(null);
  const [appliedSearchText, setAppliedSearchText] = useState<string>('');

  const [expanded, setExpanded] = useState<string[]>(['documentDetails', 'uploadDetails']);

  useTheme();

  // Fetch documents with pagination and filters
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build filters object from applied filters
        const filters: DocumentFilters = {};
        if (appliedProgram) filters.program = appliedProgram.text;
        if (appliedOwner) filters.owner = appliedOwner.text;
        if (appliedChecklist) filters.checklistApplied = appliedChecklist.text;
        if (appliedUploadedBy) filters.uploadedBy = appliedUploadedBy.text;
        if (appliedSearchText) filters.documentName = appliedSearchText;

        const result = await fetchDocuments(pageSize, skip, Object.keys(filters).length > 0 ? filters : undefined);
        setDocuments(result.objs);
        setTotalCount(result.count);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load documents';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [pageSize, skip, appliedProgram, appliedOwner, appliedChecklist, appliedUploadedBy, appliedSearchText]);

  const handleSectionToggle = (sectionId: string) => {
    setExpanded((prev) => (prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]));
  };

  // Handle pagination change
  const handlePageChange = (event: { page: { skip: number; take: number } }) => {
    setSkip(event.page.skip);
    setPageSize(event.page.take);
  };

  // Apply the selected filters
  const handleApplyFilter = () => {
    setAppliedProgram(selectedProgram);
    setAppliedOwner(selectedOwner);
    setAppliedChecklist(selectedChecklist);
    setAppliedUploadedBy(selectedUploadedBy);
    setAppliedSearchText(searchText);
    // Reset to first page when applying filters
    setSkip(0);
  };

  // Clear all filters (both selected and applied)
  const handleClearAll = () => {
    // Clear selections
    setSelectedProject(null);
    setSelectedProgram(null);
    setSelectedOwner(null);
    setSelectedChecklist(null);
    setSelectedUploadedBy(null);
    setUploadDate(null);
    setSearchText('');

    // Clear applied filters
    setAppliedProgram(null);
    setAppliedOwner(null);
    setAppliedChecklist(null);
    setAppliedUploadedBy(null);
    setAppliedSearchText('');

    // Reset to first page
    setSkip(0);
  };

  // Custom Grid cells using the `cells` API
  const ChecklistBadgeCell = (props: GridCustomCellProps<DocumentRow>) => {
    const { checklistApplied } = props.dataItem;
    return (
      <td {...props.tdProps}>
        <span className="px-2 py-1 rounded text-md bg-accent-weak text-accent font-medium">{checklistApplied}</span>
      </td>
    );
  };

  const AttachmentsBadgeCell = (props: GridCustomCellProps<DocumentRow>) => {
    const { attachments } = props.dataItem;
    const cls =
      attachments > 3
        ? 'bg-success-weak text-success'
        : attachments > 1
          ? 'bg-warning-weak text-warning'
          : 'bg-gray-weak text-gray';

    return (
      <td {...props.tdProps}>
        <span className={`px-2 py-1 rounded text-md font-medium ${cls}`}>{attachments}</span>
      </td>
    );
  };

  return (
    <>
      <TopNav
        title="C3 Doc Management"
        tabs={[
          {
            title: 'Dashboard',
            path: '/',
          },
        ]}
      />
      <div className="p-4">
        <div className="c3-card">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-weak w-full">
            {/* Total Documents */}
            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">TOTAL # OF DOCUMENTS UPLOADED</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl">211</span>
              </div>
              <div className="flex items-center text-sm text-accent mb-2">
                <span>5 (.5%)</span>
              </div>
              <div className="h-20 bg-accent-weak relative overflow-hidden mb-2"></div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-accent-weak rounded-full"></span> Item 1
                </span>
              </div>
            </div>

            {/* Documents Passed */}
            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">DOCUMENTS PASSED</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl">#</span>
              </div>
              <div className="flex items-center text-sm text-success mb-2">
                <span>5 (.5%)</span>
              </div>
              <div className="h-20 bg-success-weak relative overflow-hidden mb-2"></div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-success-weak rounded-full"></span> Item 1
                </span>
              </div>
            </div>

            {/* Documents Failed */}
            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">DOCUMENTS FAILED</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl">#</span>
              </div>
              <div className="flex items-center text-sm text-danger mb-2">
                <span>5 (.5%)</span>
              </div>
              <div className="h-20 bg-danger-weak relative overflow-hidden mb-2"></div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-danger-strong rounded-full"></span> Item 1
                </span>
              </div>
            </div>

            {/* AI Recommended Fail */}
            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">NO. OF AI RECOMMENDED-FAIL</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl">#</span>
              </div>
              <div className="flex items-center text-sm text-tertiary mb-2">
                <span>5 (.5%)</span>
              </div>
              <div className="h-20 bg-tertiary-weak relative overflow-hidden mb-2"></div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-tertiary rounded-full"></span> Item 1
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex-1 flex flex-col lg:flex-row gap-4">
          <div className="c3-card w-full lg:w-80 xl:w-96 flex-shrink-0 relative z-0">
            {/* Header */}
            <div>
              <h3 className="text-lg font-medium">Filter panel</h3>
              <p className="text-sm text-secondary">Filter documents by various criteria</p>
            </div>

            {/* Document Details Section */}
            <ExpansionPanel
              title="Document Details"
              expanded={expanded.includes('documentDetails')}
              onAction={() => handleSectionToggle('documentDetails')}
              expandSVGIcon={chevronUpIcon}
              collapseSVGIcon={chevronDownIcon}
            >
              <Reveal>
                {expanded.includes('documentDetails') && (
                  <ExpansionPanelContent className="no-padding">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="project-dropdown" className="block text-sm font-medium mb-1">
                          Project
                        </label>
                        <DropDownList
                          id="project-dropdown"
                          data={projects}
                          value={selectedProject}
                          onChange={(e) => setSelectedProject(e.value)}
                          textField="text"
                          dataItemKey="value"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="program-dropdown" className="block text-sm font-medium mb-1">
                          Program
                        </label>
                        <DropDownList
                          id="program-dropdown"
                          data={programs}
                          value={selectedProgram}
                          onChange={(e) => setSelectedProgram(e.value)}
                          textField="text"
                          dataItemKey="value"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="owner-dropdown" className="block text-sm font-medium mb-1">
                          Owner Name
                        </label>
                        <DropDownList
                          id="owner-dropdown"
                          data={owners}
                          value={selectedOwner}
                          onChange={(e) => setSelectedOwner(e.value)}
                          textField="text"
                          dataItemKey="value"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="checklist-dropdown" className="block text-sm font-medium mb-1">
                          Checklist Applied
                        </label>
                        <DropDownList
                          id="checklist-dropdown"
                          data={checklists}
                          value={selectedChecklist}
                          onChange={(e) => setSelectedChecklist(e.value)}
                          textField="text"
                          dataItemKey="value"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </ExpansionPanelContent>
                )}
              </Reveal>
            </ExpansionPanel>

            {/* Upload Details Section */}
            <ExpansionPanel
              title="Upload Details"
              expanded={expanded.includes('uploadDetails')}
              onAction={() => handleSectionToggle('uploadDetails')}
              expandSVGIcon={chevronUpIcon}
              collapseSVGIcon={chevronDownIcon}
            >
              <Reveal>
                {expanded.includes('uploadDetails') && (
                  <ExpansionPanelContent className="no-padding">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="uploadedby-dropdown" className="block text-sm font-medium mb-1">
                          Uploaded By
                        </label>
                        <DropDownList
                          id="uploadedby-dropdown"
                          data={uploadedBy}
                          value={selectedUploadedBy}
                          onChange={(e) => setSelectedUploadedBy(e.value)}
                          textField="text"
                          dataItemKey="value"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="uploaddate-picker" className="block text-sm font-medium mb-1">
                          Upload Date
                        </label>
                        <DatePicker
                          id="uploaddate-picker"
                          value={uploadDate}
                          onChange={(e) => setUploadDate(e.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </ExpansionPanelContent>
                )}
              </Reveal>
            </ExpansionPanel>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between mt-6 gap-2">
              <button
                className="py-2 px-6 text-base bg-accent text-inverse focus:outline-none hover:bg-accent-hover transition-colors w-full sm:w-auto"
                onClick={handleApplyFilter}
              >
                Filter
              </button>
              <button
                className="py-2 px-6 text-base border border-accent text-accent hover:bg-accent hover:text-inverse transition-colors w-full sm:w-auto"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Documents Table */}
          <div className="c3-card w-full min-w-0">
            <div>
              <div>
                <h2 className="text-lg font-medium">Uploaded Documents</h2>
                <p className="text-sm text-secondary">Subtitle</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 sm:flex-none">
                    <Input
                      value={searchText}
                      onChange={(e) => setSearchText(e.value)}
                      placeholder="Search documents..."
                      className="pl-10 w-full sm:w-80 md:w-96"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="py-2 px-6 text-base bg-accent text-inverse focus:outline-none hover:bg-accent-hover transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center">
                    <span>Upload New</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 w-full overflow-x-auto min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-secondary">Loading documents...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-danger">{error}</p>
                </div>
              ) : (
                <Grid
                  data={documents}
                  skip={skip}
                  take={pageSize}
                  total={totalCount}
                  pageable={{
                    pageSizes: [10, 25, 50],
                    buttonCount: 5,
                  }}
                  onPageChange={handlePageChange}
                  style={{ width: '100%' }}
                  resizable={true}
                >
                  <GridColumn field="documentName" title="Document Name" minResizableWidth={150} />
                  <GridColumn field="program" title="Program" />
                  <GridColumn field="owner" title="Owner" />
                  <GridColumn field="checklistApplied" title="Checklist Applied" cells={{ data: ChecklistBadgeCell }} />
                  <GridColumn
                    field="attachments"
                    title="No. Attachments"
                    minResizableWidth={100}
                    cells={{ data: AttachmentsBadgeCell }}
                  />
                  <GridColumn field="uploadedBy" title="Uploaded by" />
                  <GridColumn field="uploadedAt" title="Uploaded at" />
                </Grid>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
