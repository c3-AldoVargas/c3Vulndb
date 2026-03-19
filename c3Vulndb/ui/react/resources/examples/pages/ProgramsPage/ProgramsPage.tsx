/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { projects, programs, owners, checklists, uploadedBy } from '@/data/sampleData';
import { Program } from '@/Interfaces';
import { fetchPrograms, ProgramFilters } from '@/shared/api';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Grid, GridColumn, GridDetailRowProps } from '@progress/kendo-react-grid';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { Input } from '@progress/kendo-react-inputs';
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartValueAxis,
  ChartValueAxisItem,
  ChartLegend,
  ChartTooltip,
} from '@progress/kendo-react-charts';
import { ExpansionPanel, ExpansionPanelContent } from '@progress/kendo-react-layout';
import { Reveal } from '@progress/kendo-react-animation';
import { chevronUpIcon, chevronDownIcon } from '@progress/kendo-svg-icons';
import TopNav from '@/components/TopNav/TopNav';

// Sample data for charts
const chartData = [
  { category: 'Jan', value: 100, forecast: 105 },
  { category: 'Feb', value: 120, forecast: 125 },
  { category: 'Mar', value: 95, forecast: 100 },
  { category: 'Apr', value: 110, forecast: 115 },
  { category: 'May', value: 130, forecast: 135 },
  { category: 'Jun', value: 125, forecast: 130 },
];

const pieData = [
  { category: 'Passed', value: 45, color: '#28a745' },
  { category: 'Failed', value: 25, color: '#dc3545' },
  { category: 'Pending', value: 30, color: '#ffc107' },
];

const barData = [
  { category: 'Q1', value: 150 },
  { category: 'Q2', value: 180 },
  { category: 'Q3', value: 165 },
  { category: 'Q4', value: 200 },
];

export default function ProgramsPage() {
  // Programs state
  const [programsData, setProgramsData] = useState<Program[]>([]);
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
  const [appliedSearchText, setAppliedSearchText] = useState<string>('');

  const [expanded, setExpanded] = useState<string[]>(['documentDetails', 'uploadDetails']);

  useTheme();

  // Fetch programs with pagination and filters
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build filters object from applied filters
        const filters: ProgramFilters = {};
        if (appliedSearchText) filters.program = appliedSearchText;

        const result = await fetchPrograms(pageSize, skip, Object.keys(filters).length > 0 ? filters : undefined);
        setProgramsData(result.objs);
        setTotalCount(result.count);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load programs';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [pageSize, skip, appliedSearchText]);

  const handleSectionToggle = (sectionId: string) => {
    setExpanded((prev) => (prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]));
  };

  // Handle pagination change
  const handlePageChange = (event: { page: { skip: number; take: number } }) => {
    setSkip(event.page.skip);
    setPageSize(event.page.take);
  };

  // Apply the search filter
  const handleApplyFilter = () => {
    setAppliedSearchText(searchText);
    // Reset to first page when applying filters
    setSkip(0);
  };

  // Clear all filters
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
    setAppliedSearchText('');

    // Reset to first page
    setSkip(0);
  };

  // Memoize charts to prevent re-rendering on every keystroke
  const lineChart = useMemo(
    () => (
      <Chart style={{ height: '100%', width: '100%' }}>
        <ChartSeries>
          <ChartSeriesItem type="line" data={chartData} field="value" categoryField="category" color="#007bff" />
        </ChartSeries>
        <ChartCategoryAxis>
          <ChartCategoryAxisItem visible={false} />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem visible={false} />
        </ChartValueAxis>
        <ChartTooltip visible={false} />
      </Chart>
    ),
    []
  );

  const pieChart = useMemo(
    () => (
      <Chart style={{ height: '100%', width: '100%' }}>
        <ChartSeries>
          <ChartSeriesItem type="pie" data={pieData} field="value" categoryField="category" colorField="color" />
        </ChartSeries>
        <ChartLegend visible={false} />
        <ChartTooltip visible={false} />
      </Chart>
    ),
    []
  );

  const barChart = useMemo(
    () => (
      <Chart style={{ height: '100%', width: '100%' }}>
        <ChartSeries>
          <ChartSeriesItem type="column" data={barData} field="value" categoryField="category" color="#dc3545" />
        </ChartSeries>
        <ChartCategoryAxis>
          <ChartCategoryAxisItem visible={false} />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem visible={false} />
        </ChartValueAxis>
        <ChartTooltip visible={false} />
      </Chart>
    ),
    []
  );

  const areaChart = useMemo(
    () => (
      <Chart style={{ height: '100%', width: '100%' }}>
        <ChartSeries>
          <ChartSeriesItem type="area" data={chartData} field="value" categoryField="category" color="#6c757d" />
        </ChartSeries>
        <ChartCategoryAxis>
          <ChartCategoryAxisItem visible={false} />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem visible={false} />
        </ChartValueAxis>
        <ChartTooltip visible={false} />
      </Chart>
    ),
    []
  );

  const DetailComponent = (props: GridDetailRowProps) => {
    const dataItem = props.dataItem as {
      program: string;
      documents: Array<{ documentName: string; owner: string; status: string; uploadedAt: string }>;
    };
    return (
      <div className="c3-card">
        <h4 className="font-medium mb-3 text-lg">Documents in {dataItem.program}</h4>
        <div className="border border-gray-200 rounded overflow-x-auto">
          <Grid data={dataItem.documents} style={{ width: '100%' }} resizable={true}>
            <GridColumn field="documentName" title="Document Name" />
            <GridColumn field="owner" title="Owner" />
            <GridColumn field="status" title="Status" />
            <GridColumn field="uploadedAt" title="Uploaded At" />
          </Grid>
        </div>
      </div>
    );
  };

  return (
    <>
      <TopNav title="C3 Doc Management" />
      <div className="p-4">
        {/* Metric Tiles with Charts */}
        <div className="c3-card">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-weak w-full">
            {/* Total Documents - Line Chart */}
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
              <div className="h-20 sm:h-24 md:h-30 relative z-10 overflow-visible">{lineChart}</div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
            </div>

            {/* Documents Passed - Pie Chart */}
            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">DOCUMENTS PASSED</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl">95</span>
              </div>
              <div className="flex items-center text-sm text-success mb-2">
                <span>5 (.5%)</span>
              </div>
              <div className="h-20 sm:h-24 md:h-30 relative z-10 overflow-visible">{pieChart}</div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
            </div>

            {/* Documents Failed - Bar Chart */}
            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">DOCUMENTS FAILED</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl">25</span>
              </div>
              <div className="flex items-center text-sm text-danger mb-2">
                <span>5 (.5%)</span>
              </div>
              <div className="h-20 sm:h-24 md:h-30 relative z-10 overflow-visible">{barChart}</div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
            </div>

            {/* AI Recommended Fail - Area Chart */}
            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">NO. OF AI RECOMMENDED-FAIL</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl">12</span>
              </div>
              <div className="flex items-center text-sm text-tertiary mb-2">
                <span>5 (.5%)</span>
              </div>
              <div className="h-20 sm:h-24 md:h-30 relative z-10 overflow-visible">{areaChart}</div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex-1 flex flex-col lg:flex-row gap-4">
          {/* Filter Panel */}
          <div className="c3-card w-full lg:w-80 xl:w-96 flex-shrink-0 sm:ml-0 ml-4">
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

          {/* Nested Documents Table */}
          <div className="c3-card w-full min-w-0">
            <div>
              <div>
                <h2 className="text-lg font-medium">Program Documents Overview</h2>
                <p className="text-sm text-secondary">Expand rows to view individual documents</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 sm:flex-none">
                    <Input
                      value={searchText}
                      onChange={(e) => setSearchText(e.value)}
                      placeholder="Search programs..."
                      className="pl-10 w-full sm:w-80 md:w-96"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="py-2 px-6 text-base bg-accent text-inverse focus:outline-none hover:bg-accent-hover transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center">
                    <span>Add Program</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 w-full overflow-x-auto min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-secondary">Loading programs...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-danger">{error}</p>
                </div>
              ) : (
                <Grid
                  data={programsData}
                  dataItemKey="id"
                  detail={DetailComponent}
                  skip={skip}
                  take={pageSize}
                  total={totalCount}
                  pageable={{
                    pageSizes: [5, 10, 20],
                    buttonCount: 5,
                  }}
                  onPageChange={handlePageChange}
                  style={{ width: '100%' }}
                >
                  <GridColumn field="program" title="Program" />
                  <GridColumn field="totalDocuments" title="Total Documents" />
                  <GridColumn field="passed" title="Passed" />
                  <GridColumn field="failed" title="Failed" />
                  <GridColumn field="pending" title="Pending" />
                </Grid>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
