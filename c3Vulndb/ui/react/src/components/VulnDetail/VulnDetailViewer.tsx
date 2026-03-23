/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React from 'react';
import { Dialog } from '@progress/kendo-react-dialogs';

/** A single field to display in the detail viewer. */
export interface DetailField {
  label: string;
  value: string;
}

interface VulnDetailViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: DetailField[];
}

/** Severity labels that should be rendered with a colored badge. */
const SEVERITY_LABELS = new Set([
  'C3 AI Severity Rating',
  'Message Severity',
  'Cust. Severity',
]);

/** Return Tailwind color classes for a severity value (case-insensitive). */
function severityBadgeColor(value: string): string {
  const v = value?.toLowerCase() || '';
  if (v === 'critical') return 'bg-red-100 text-red-800';
  if (v === 'high') return 'bg-orange-100 text-orange-800';
  if (v === 'medium') return 'bg-yellow-100 text-yellow-800';
  if (v === 'low') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
}

/** Labels whose values are typically long and should span full width. */
const WIDE_LABELS = new Set([
  'Message',
  'Vuln Comments',
  'External CVSS vectorstring',
  'C3 AI CVSS4 vectorstring',
  'Trigger',
]);

/**
 * Shared detail viewer modal used across all vulnerability grids.
 * Renders a scrollable list of label / value rows inside a Kendo Dialog.
 */
export default function VulnDetailViewer({ isOpen, onClose, title, fields }: VulnDetailViewerProps) {
  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .vuln-detail-dialog.k-window.k-dialog {
            max-height: 85vh !important;
          }
          .vuln-detail-dialog.k-window.k-dialog .k-window-content {
            max-height: calc(85vh - 50px) !important;
            overflow-y: auto !important;
          }
        `}
      </style>
      <Dialog
        onClose={onClose}
        title={title}
        width="700px"
        className="vuln-detail-dialog"
      >
        <div className="p-4 space-y-3">
          {fields.map(({ label, value }) => {
            const isSeverity = SEVERITY_LABELS.has(label);
            const isWide = WIDE_LABELS.has(label);
            const displayValue = value || '—';

            return (
              <div key={label} className={isWide ? '' : 'flex items-start gap-4'}>
                <span className="text-sm font-medium text-secondary min-w-[180px] flex-shrink-0">
                  {label}
                </span>
                {isWide ? (
                  <p className="text-sm mt-1 bg-gray-50 rounded p-2 whitespace-pre-wrap break-words">
                    {displayValue}
                  </p>
                ) : isSeverity ? (
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${severityBadgeColor(displayValue)}`}
                  >
                    {displayValue}
                  </span>
                ) : (
                  <span className="text-sm break-words">{displayValue}</span>
                )}
              </div>
            );
          })}
        </div>
      </Dialog>
    </>
  );
}
