/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import TopNav from '@/components/TopNav/TopNav';

interface ChecklistItem {
  id: number;
  title: string;
  count: string;
  description: string;
  action: string;
}

export default function ChecklistPage() {
  useTheme();
  const navigate = useNavigate();

  const handleViewChecklist = (checklist: ChecklistItem) => {
    navigate('/checklist/detail', {
      state: {
        checklistData: {
          ...checklist,
          count: '15', // Override count for detail view
        },
      },
    });
  };

  const checklistData = [
    {
      id: 1,
      title: 'Receipt Checklist',
      count: '120 Checks',
      description: 'Proof of payment for goods or services, typically used to validate expenses.',
      action: 'View Checklist',
    },
    {
      id: 2,
      title: 'Contract Checklist',
      count: '120 Checks',
      description: 'A signed legal agreement between parties, often needed for compliance.',
      action: 'View Checklist',
    },
    {
      id: 3,
      title: 'Invoice Checklist',
      count: '120 Checks',
      description: 'A billing document from a vendor showing the cost of goods or services purchased.',
      action: 'View Checklist',
    },
    {
      id: 4,
      title: 'Proof of Insurance Checklist',
      count: '120 Checks',
      description: 'Proof of payment for goods or services, typically used to validate expenses.',
      action: 'View Checklist',
    },
    {
      id: 5,
      title: 'Tax Document Checklist',
      count: '120 Checks',
      description: 'Displays transactions and balances to verify fund usage or eligibility.',
      action: 'View Checklist',
    },
    {
      id: 6,
      title: 'Purchase Order Checklist',
      count: '120 Checks',
      description: 'A document sent to a vendor specifying items to be purchased, quantity, and price.',
      action: 'View Checklist',
    },
    {
      id: 7,
      title: 'Utility Bill Checklist',
      count: '120 Checks',
      description: 'Proof of address or ongoing operational costs for a facility (e.g., water, electricity).',
      action: 'View Checklist',
    },
    {
      id: 8,
      title: 'Project Proposal Checklist',
      count: '120 Checks',
      description: 'A document outlining the purpose, goals, timeline, and budget of a proposed initiative.',
      action: 'View Checklist',
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

  return (
    <>
      <TopNav title="C3 Doc Management" tabs={tabs} />
      <div className="p-4">
        {/* Page Title */}
        <div className="mb-4">
          <h2 className="text-lg font-medium">System Checklist</h2>
          <p className="text-sm text-secondary">These are checklists provided by C3 AI.</p>
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {checklistData.map((checklist) => (
            <div key={checklist.id} className="bg-primary border border-weak rounded-sm p-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-primary">{checklist.title}</h3>
                <p className="text-sm text-secondary mb-3">{checklist.count}</p>
                <p className="text-sm leading-relaxed">{checklist.description}</p>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => handleViewChecklist(checklist)}
                  className="py-2 text-sm text-accent hover:underline focus:outline-none"
                >
                  {checklist.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
