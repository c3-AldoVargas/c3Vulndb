/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useLocation, useNavigate } from 'react-router-dom';
import { Grid, GridColumn, GridCustomCellProps } from '@progress/kendo-react-grid';
import { Input } from '@progress/kendo-react-inputs';
import TopNav from '@/components/TopNav/TopNav';

interface CheckRow {
  id: number;
  title: string;
  description: string;
  critical: boolean;
}

export default function ChecklistDetailPage() {
  useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Get checklist data from location state or use default
  const checklistData = location.state?.checklistData || {
    id: 1,
    title: 'Receipt Checklist',
    count: '15',
    description: 'Checklist for validating business-related receipts and expenses.',
  };

  const [searchText, setSearchText] = useState<string>('');

  // Sample checks data
  const checksData = [
    {
      id: 1,
      title: 'Date of Receipt Included',
      description: 'Ensure that the receipt included within the document has a legible date of receipt included.',
      critical: true,
    },
    {
      id: 2,
      title: 'Billing Address included',
      description: 'Ensure that the receipt included within the document has the billing address.',
      critical: true,
    },
    {
      id: 3,
      title: 'Company Seal Included',
      description: 'Ensure that the receipt included has our company seal.',
      critical: true,
    },
    {
      id: 4,
      title: 'Total Amount adds up',
      description: 'Ensure that for the receipt provided the total amount sums up to the line items included',
      critical: true,
    },
    {
      id: 5,
      title: 'Duplicate Receipt',
      description: 'Ensure that we are not double counting duplicate receipts attached to the same document.',
      critical: false,
    },
    {
      id: 6,
      title: 'Line Items Provided',
      description: 'Ensure that the receipt provided has line items',
      critical: false,
    },
    {
      id: 7,
      title: 'Payment Processed',
      description: 'Verify that the payment is completed successfully',
      critical: false,
    },
    {
      id: 8,
      title: 'Invoice Number',
      description: 'Make sure the invoice number is unique and traceable',
      critical: false,
    },
    {
      id: 9,
      title: 'Customer Details',
      description: 'Ensure customer information is accurate and up-to-date',
      critical: false,
    },
    {
      id: 10,
      title: 'Delivery Status',
      description: 'Confirm the status of the delivery and tracking information',
      critical: false,
    },
  ];

  const tabs = [
    {
      title: 'System Checklists',
      path: '/checklist',
    },
    {
      title: 'Custom Checklists',
      path: '/checklist/custom',
    },
  ];

  // Custom pill cell for the "critical" column (typed, no `any`)
  const CriticalPillCell = (props: GridCustomCellProps<CheckRow>) => {
    const { critical } = props.dataItem;
    const cls = critical ? 'bg-danger-weak text-danger' : 'bg-gray-weak text-gray';
    return (
      <td {...props.tdProps}>
        <span className={`px-2 py-1 rounded text-md ${cls}`}>{critical ? 'Yes' : 'No'}</span>
      </td>
    );
  };

  return (
    <>
      <TopNav title="C3 Doc Management" tabs={tabs} />
      <div>
        {/* Breadcrumbs */}
        <div className="px-4 py-2 bg-primary border-b border-weak">
          <nav className="text-sm">
            <button onClick={() => navigate('/checklist')} className="text-primary hover:underline focus:outline-none">
              System Checklists
            </button>
            <span className="mx-2 text-secondary">&gt;</span>
            <span className="text-primary font-medium">Checklist Detail</span>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row p-4 gap-4">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            {/* Checklist Overview */}
            <div className="c3-card mb-4">
              <div className="flex gap-8">
                <div className="flex-1">
                  <h1 className="text-lg font-medium text-primary mb-2">{checklistData.description}</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <div>
                      <div className="text-sm text-secondary font-medium">NO. OF CHECKS</div>
                      <div className="text-lg font-medium text-primary">{checklistData.count}</div>
                    </div>
                    <div>
                      <div className="text-sm text-secondary font-medium">CREATED BY</div>
                      <div className="text-lg font-medium text-primary">System</div>
                    </div>
                    <div>
                      <div className="text-sm text-secondary font-medium">CREATED AT</div>
                      <div className="text-lg font-medium text-primary">12/05/2025 10:00AM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="c3-card mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-weak">
                <div className="p-4 flex flex-col">
                  <div className="text-sm text-secondary font-medium mb-2">NO. OF DOCUMENTS APPLIED TO</div>
                  <div className="text-2xl font-medium text-primary mb-2">290</div>
                  <div className="h-16 sm:h-20 md:h-24 bg-accent-weak relative overflow-hidden mb-2"></div>
                  <div className="text-xs text-secondary">Last 30 days</div>
                </div>
                <div className="p-4 flex flex-col">
                  <div className="text-sm text-secondary font-medium mb-2">NO. OF CHECKS PASSED</div>
                  <div className="text-2xl font-medium text-primary mb-2">2,890</div>
                  <div className="h-16 sm:h-20 md:h-24 bg-success-weak relative overflow-hidden mb-2"></div>
                  <div className="text-xs text-secondary">Last 30 days</div>
                </div>
                <div className="p-4 flex flex-col">
                  <div className="text-sm text-secondary font-medium mb-2">NO. OF CHECKS FAILED</div>
                  <div className="text-2xl font-medium text-primary mb-2">1,460</div>
                  <div className="h-16 sm:h-20 md:h-24 bg-danger-weak relative overflow-hidden mb-2"></div>
                  <div className="text-xs text-secondary">Last 30 days</div>
                </div>
                <div className="p-4 flex flex-col">
                  <div className="text-sm text-secondary font-medium mb-2">NO. OF CHECKS ACCEPTED</div>
                  <div className="text-2xl font-medium text-primary mb-2">3,670</div>
                  <div className="h-16 sm:h-20 md:h-24 bg-accent-weak relative overflow-hidden mb-2"></div>
                  <div className="text-xs text-secondary">Last 30 days</div>
                </div>
                <div className="p-4 flex flex-col">
                  <div className="text-sm text-secondary font-medium mb-2">NO. OF CHECKS OVERRIDDEN</div>
                  <div className="text-2xl font-medium text-primary mb-2">680</div>
                  <div className="h-16 sm:h-20 md:h-24 bg-tertiary-weak relative overflow-hidden mb-2"></div>
                  <div className="text-xs text-secondary">Last 30 days</div>
                </div>
              </div>
            </div>

            {/* Checks List */}
            <div className="c3-card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-lg font-medium">Checks</h2>
                <div className="w-full sm:w-80 md:w-96">
                  <Input
                    value={searchText}
                    onChange={(e) => setSearchText(e.value)}
                    placeholder="Q Search"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <Grid
                  data={checksData}
                  pageable={{
                    pageSizes: [10, 20, 50],
                    buttonCount: 5,
                  }}
                  style={{ width: '100%' }}
                  resizable={true}
                >
                  <GridColumn field="title" title="Title" minResizableWidth={150} />
                  <GridColumn field="description" title="Description" />
                  <GridColumn field="critical" title="Critical" cells={{ data: CriticalPillCell }} />
                </Grid>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 space-y-4 flex-shrink-0">
            <div className="c3-card">
              <h3 className="text-lg font-medium mb-4">Basic Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-secondary font-medium">NO. OF PASSED</div>
                  <div className="text-lg font-medium text-primary">200</div>
                </div>
                <div>
                  <div className="text-sm text-secondary font-medium">NO. OF FAILED</div>
                  <div className="text-lg font-medium text-primary">90</div>
                </div>
                <div>
                  <div className="text-sm text-secondary font-medium">NO. OF ACCEPTED</div>
                  <div className="text-lg font-medium text-primary">260</div>
                </div>
                <div>
                  <div className="text-sm text-secondary font-medium">NO. OF OVERRIDDEN</div>
                  <div className="text-lg font-medium text-primary">30</div>
                </div>
              </div>
            </div>

            <div className="c3-card">
              <h3 className="text-lg font-medium mb-4">Top Override Reasoning</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-secondary font-medium">REASONING 1</div>
                  <div className="text-base text-primary">Value Exists</div>
                </div>
                <div>
                  <div className="text-sm text-secondary font-medium">REASONING 2</div>
                  <div className="text-base text-primary">Value does not exists</div>
                </div>
                <div>
                  <div className="text-sm text-secondary font-medium">REASONING 3</div>
                  <div className="text-base text-primary">--</div>
                </div>
              </div>
            </div>

            <div className="c3-card">
              <h3 className="text-lg font-medium mb-4">Recent Documents Applied To</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary font-medium">DOCUMENT NAME</div>
                    <div className="text-base text-primary">Document 54457</div>
                  </div>
                  <a
                    href="https://www.google.com"
                    target="_blank"
                    className="p-1 hover:bg-accent-weak rounded transition-colors"
                    title="Open in new window"
                    aria-label="Open Document 54457 in new window"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary font-medium">DOCUMENT NAME</div>
                    <div className="text-base text-primary">Document 56248</div>
                  </div>
                  <a
                    href="https://www.google.com"
                    target="_blank"
                    className="p-1 hover:bg-accent-weak rounded transition-colors"
                    title="Open in new window"
                    aria-label="Open Document 54457 in new window"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
