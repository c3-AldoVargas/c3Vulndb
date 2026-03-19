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
import { TabStrip, TabStripTab, ExpansionPanel, ExpansionPanelContent } from '@progress/kendo-react-layout';
import { Reveal } from '@progress/kendo-react-animation';
import { chevronUpIcon, chevronDownIcon } from '@progress/kendo-svg-icons';
import { NetworkGraph } from '@/components';
import DocumentGenerationModal from './DocumentGenerationModal/DocumentGenerationModal';
import TopNav from '@/components/TopNav/TopNav';

export default function OverviewPage() {
  useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [expanded, setExpanded] = useState<string[]>(['basicDetails', 'plan', 'memberDependents', 'deductible']);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleGenerateDocument = () => {
    // Here you would typically call an API to generate the document
    // For now, we'll just close the modal
    setIsModalOpen(false);
  };

  const handleSectionToggle = (sectionId: string) => {
    setExpanded((prev) => (prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]));
  };

  return (
    <>
      <TopNav title="C3 Doc Management" />
      {/* Main Content from tab-panel.html */}
      <div>
        <div className="flex flex-col lg:flex-row gap-4 items-start px-4 pt-4 bg-primary">
          {/* Left Panel */}
          <div className="pb-4 w-full lg:max-w-sm flex-shrink-0">
            <h1 className="text-xl font-medium text-primary">Checklist Name</h1>
            <p className="text-secondary text-sm mb-4">
              Checklist fo validating business-related receipts and expenses
            </p>
            <div>
              <div className="font-medium text-base text-secondary">CREATED BY</div>
              <div className="text-base mb-4">System</div>
              <div className="font-medium text-base text-secondary">CREATED AT</div>
              <div className="text-base mb-4">12/05/2025 10:00AM</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleOpenModal}
                className="py-1 px-4 text-base bg-accent text-inverse focus:outline-none hover:bg-accent-hover transition-colors w-full sm:w-auto"
              >
                Open Modal
              </button>
              <button className="py-1 px-4 text-base border border-accent text-accent hover:bg-accent hover:text-inverse transition-colors w-full sm:w-auto">
                Action 2
              </button>
            </div>
          </div>
          {/* Right Panel: Metric Tiles */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-weak w-full">
            {/* Tile 1: Green, no forecast */}
            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">
                  METRIC NAME{' '}
                  <span className="text-xs cursor-pointer" title="More info">
                    ⓘ
                  </span>
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl">100,000</span>
                <span className="text-success ml-2 text-lg">✓</span>
              </div>
              <div className="flex items-center text-sm text-success mb-2">
                <span className="mr-1">▲</span> 5 (.5%)
              </div>
              <div className="h-20 sm:h-24 lg:h-28 bg-success-weak relative overflow-hidden mb-2"></div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-success-weak rounded-full"></span> Item 1
                </span>
              </div>
            </div>
            {/* Tile 2: Red, no forecast */}
            <div className="p-4 flex flex-col w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">
                  METRIC NAME{' '}
                  <span className="text-xs cursor-pointer" title="More info">
                    ⓘ
                  </span>
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl">100,000</span>
                <span className="text-danger ml-2 text-lg">⚠</span>
              </div>
              <div className="flex items-center text-sm text-danger mb-2">
                <span className="mr-1">▼</span> 5 (.5%)
              </div>
              <div className="h-20 sm:h-24 md:h-30 bg-danger-weak relative overflow-hidden mb-2"></div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-danger-strong rounded-full"></span> Item 1
                </span>
              </div>
            </div>
            {/* Tile 3: Red, with forecast */}
            <div className="p-4 flex flex-col w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">
                  METRIC NAME{' '}
                  <span className="text-xs cursor-pointer" title="More info">
                    ⓘ
                  </span>
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl">100,000</span>
                <span className="text-danger ml-2 text-lg">⚠</span>
              </div>
              <div className="flex items-center text-sm text-danger mb-2">
                <span className="mr-1">▼</span> 5 (.5%)
              </div>
              <div className="h-20 sm:h-24 md:h-30 bg-danger-weak relative overflow-hidden mb-2"></div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-danger-strong rounded-full"></span> Item 1
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-tertiary rounded-full"></span> Plan
                </span>
              </div>
            </div>
            {/* Tile 4: Blue, with forecast */}
            <div className="p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary font-medium">
                  METRIC NAME{' '}
                  <span className="text-xs cursor-pointer" title="More info">
                    ⓘ
                  </span>
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl">100,000</span>
                <span className="text-success ml-2 text-lg">✓</span>
              </div>
              <div className="flex items-center text-sm text-success mb-2">
                <span className="mr-1">▲</span> 5 (.5%)
              </div>
              <div className="h-20 sm:h-24 md:h-30 bg-accent-weak relative overflow-hidden mb-2"></div>
              <div className="text-xs text-secondary mt-2">Last 30 days</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-1">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-accent-strong rounded-full"></span> Item 1
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-tertiary rounded-full"></span> Plan
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Kendo TabStrip */}
        <TabStrip className="bg-primary" selected={selectedTab} onSelect={(e) => setSelectedTab(e.selected)}>
          <TabStripTab title="Details">
            <div className="c3-card mt-2">
              {/* Basic Details Section */}
              <ExpansionPanel
                title="Basic Details"
                expanded={expanded.includes('basicDetails')}
                onAction={() => handleSectionToggle('basicDetails')}
                expandSVGIcon={chevronUpIcon}
                collapseSVGIcon={chevronDownIcon}
              >
                <Reveal>
                  {expanded.includes('basicDetails') && (
                    <ExpansionPanelContent>
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <div className="block text-sm font-medium text-secondary uppercase tracking-wide">
                                MEMBER STATUS
                              </div>
                              <div className="mt-1 text-base text-primary">Active</div>
                            </div>
                            <div>
                              <div className="block text-sm font-medium text-secondary uppercase tracking-wide">
                                EFFECTIVE DATE
                              </div>
                              <div className="mt-1 text-base text-primary">May 16, 2022</div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <div className="block text-sm font-medium text-secondary uppercase tracking-wide">
                                REGISTERED FOR PORTAL
                              </div>
                              <div className="mt-1 text-base text-primary">Yes</div>
                            </div>
                            <div>
                              <div className="block text-sm font-medium text-secondary uppercase tracking-wide">
                                TERMINATION DATE
                              </div>
                              <div className="mt-1 text-base text-primary">May 16, 2028</div>
                            </div>
                          </div>
                        </div>
                      </>
                    </ExpansionPanelContent>
                  )}
                </Reveal>
              </ExpansionPanel>

              {/* Plan Section */}
              <ExpansionPanel
                title="Plan"
                expanded={expanded.includes('plan')}
                onAction={() => handleSectionToggle('plan')}
                expandSVGIcon={chevronUpIcon}
                collapseSVGIcon={chevronDownIcon}
              >
                <Reveal>
                  {expanded.includes('plan') && (
                    <ExpansionPanelContent>
                      <>
                        <div className="space-y-4">
                          <div>
                            <div className="block text-sm font-medium text-secondary uppercase tracking-wide">
                              PLAN NAME
                            </div>
                            <div className="mt-1 text-base text-primary">Silver Care Prescription Plan</div>
                          </div>
                          <div>
                            <div className="block text-sm font-medium text-secondary uppercase tracking-wide">
                              PLAN DETAILS
                            </div>
                            <div className="mt-1 text-base text-primary">Label</div>
                          </div>
                        </div>
                      </>
                    </ExpansionPanelContent>
                  )}
                </Reveal>
              </ExpansionPanel>

              {/* Member Dependents Section */}
              <ExpansionPanel
                title="Member Dependents"
                expanded={expanded.includes('memberDependents')}
                onAction={() => handleSectionToggle('memberDependents')}
                expandSVGIcon={chevronUpIcon}
                collapseSVGIcon={chevronDownIcon}
              >
                <Reveal>
                  {expanded.includes('memberDependents') && (
                    <ExpansionPanelContent>
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <div className="block text-sm font-medium text-secondary uppercase tracking-wide">
                                DEPENDENT NAME
                              </div>
                              <div className="mt-1 text-base text-primary">Tom Doe</div>
                            </div>
                            <div>
                              <div className="block text-sm font-medium text-secondary uppercase tracking-wide">
                                DEPENDENT STATUS
                              </div>
                              <div className="mt-1 text-base text-primary">Active</div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <div className="block text-sm font-medium text-secondary uppercase tracking-wide">
                                DEPENDENT NAME
                              </div>
                              <div className="mt-1 text-base text-primary">Jane Doe</div>
                            </div>
                            <div>
                              <div className="block text-sm font-medium text-secondary uppercase tracking-wide">
                                DEPENDENT STATUS
                              </div>
                              <div className="mt-1 text-base text-primary">Active</div>
                            </div>
                          </div>
                        </div>
                      </>
                    </ExpansionPanelContent>
                  )}
                </Reveal>
              </ExpansionPanel>

              {/* Deductible Section */}
              <ExpansionPanel
                title="Deductible"
                expanded={expanded.includes('deductible')}
                onAction={() => handleSectionToggle('deductible')}
                expandSVGIcon={chevronUpIcon}
                collapseSVGIcon={chevronDownIcon}
              >
                <Reveal>
                  {expanded.includes('deductible') && (
                    <ExpansionPanelContent>
                      <>
                        <div className="space-y-4">
                          <div>
                            <div className="block text-sm font-medium text-secondary uppercase tracking-wide">
                              LOGIC
                            </div>
                            <div className="mt-1 text-base text-primary"></div>
                          </div>
                        </div>
                      </>
                    </ExpansionPanelContent>
                  )}
                </Reveal>
              </ExpansionPanel>
            </div>
          </TabStripTab>
          <TabStripTab title="Network">
            <div className="pt-2">
              <NetworkGraph />
            </div>
          </TabStripTab>
          <TabStripTab title="Call History">
            <div className="space-y-4 mt-2">
              {/* Call Sentiment Section */}
              <div className="c3-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-medium text-secondary">Call Sentiment</h3>
                  <span className="text-gray-500 text-sm">ⓘ</span>
                </div>
                <p className="text-gray-600 mb-4">Overwhelmingly Positive</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Negative</span>
                    <span className="text-gray-600">Neutral</span>
                    <span className="text-gray-600">Positive</span>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex">
                    <div className="bg-danger-weak w-24"></div>
                    <div className="bg-warning-weak w-48"></div>
                    <div className="bg-success-weak w-48"></div>
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="c3-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-medium text-secondary">Timeline</h3>
                  <span className="text-gray-500 text-sm">ⓘ</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 text-xs">⋯</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-secondary font-medium">Form complete</p>
                      <p className="text-gray-600 text-sm">
                        82% percent of the form was filled in based on the transcript
                      </p>
                      <p className="text-blue-600 text-xs mt-1">just now</p>
                    </div>
                    <span className="text-gray-500 text-sm">⋮</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 text-xs">⋯</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-secondary font-medium">Transcription finished</p>
                      <p className="text-gray-600 text-sm">13m to transcribe the call</p>
                      <p className="text-blue-600 text-xs mt-1">1hr ago</p>
                    </div>
                    <span className="text-gray-500 text-sm">⋮</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 text-xs">⋯</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-secondary font-medium">Call received</p>
                      <p className="text-gray-600 text-sm">3m 13s call ended</p>
                      <p className="text-blue-600 text-xs mt-1">Nov 12, 2024</p>
                    </div>
                    <span className="text-gray-500 text-sm">⋮</span>
                  </div>
                </div>
              </div>

              {/* Recent Calls Section */}
              <div className="c3-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-medium text-secondary">Recent Calls</h3>
                  <span className="text-gray-500 text-sm">ⓘ</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <a className="font-medium mb-2" href="#a">
                      July 12, 2024
                    </a>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                      nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                  </div>

                  <div>
                    <a className="font-medium mb-2" href="#a">
                      June 24, 2024
                    </a>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                      nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button className="text-blue-600 text-sm font-medium hover:underline bg-transparent border-none cursor-pointer p-0">
                      View All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabStripTab>
        </TabStrip>
      </div>

      {/* Document Generation Modal */}
      <DocumentGenerationModal isOpen={isModalOpen} onClose={handleCloseModal} onGenerate={handleGenerateDocument} />
    </>
  );
}
