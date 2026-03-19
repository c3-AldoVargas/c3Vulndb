/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { useCallback } from 'react';
import { DropDownList, type DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import type { ColumnMapping } from '@/Interfaces';

/** The target fields the user can map source columns to (matches Vulnerability schema). */
export const TARGET_FIELDS = [
  { value: null, label: '— Unmapped —' },
  { value: 'vulnId', label: 'vulnId — CVE Identifier' },
  { value: 'image', label: 'image — Container Image' },
  { value: 'tag', label: 'tag — Image Tag / Version' },
  { value: 'repository', label: 'repository — Image Repository' },
  { value: 'messageSeverity', label: 'messageSeverity — External Severity' },
  { value: 'path', label: 'path — Affected Path' },
  { value: 'classifications', label: 'classifications — Vuln Category' },
  { value: 'hasFix', label: 'hasFix — Fix Available' },
  { value: 'externalCvssVector', label: 'externalCvssVector — CVSS Vector' },
  { value: 'message', label: 'message — Description' },
] as const;

type TargetFieldOption = (typeof TARGET_FIELDS)[number];

interface MappingStepProps {
  headers: string[];
  mappings: ColumnMapping[];
  onMappingsChange: (mappings: ColumnMapping[]) => void;
}

export default function MappingStep({ headers, mappings, onMappingsChange }: MappingStepProps) {
  const vulnIdMapped = mappings.some((m) => m.targetField === 'vulnId');

  /**
   * Find which target field options are already taken (except by the current row).
   */
  const getAvailableOptions = useCallback(
    (currentSourceColumn: string): TargetFieldOption[] => {
      const takenTargets = new Set<string | null>();
      mappings.forEach((m) => {
        if (m.sourceColumn !== currentSourceColumn && m.targetField) {
          takenTargets.add(m.targetField);
        }
      });
      return TARGET_FIELDS.filter((opt) => opt.value === null || !takenTargets.has(opt.value));
    },
    [mappings]
  );

  const handleMappingChange = useCallback(
    (sourceColumn: string, event: DropDownListChangeEvent) => {
      const selected = event.value as TargetFieldOption;
      const updatedMappings = mappings.map((m) => {
        if (m.sourceColumn === sourceColumn) {
          return { ...m, targetField: selected.value };
        }
        return m;
      });
      onMappingsChange(updatedMappings);
    },
    [mappings, onMappingsChange]
  );

  const getCurrentValue = useCallback(
    (sourceColumn: string): TargetFieldOption => {
      const mapping = mappings.find((m) => m.sourceColumn === sourceColumn);
      const target = mapping?.targetField || null;
      return TARGET_FIELDS.find((opt) => opt.value === target) || TARGET_FIELDS[0];
    },
    [mappings]
  );

  return (
    <div>
      <p className="text-sm text-secondary mb-4">
        Map each source column from the customer report to our internal fields. Only{' '}
        <strong>Vuln ID (CVE)</strong> is required.
      </p>

      {!vulnIdMapped && (
        <div className="mb-4 p-3 rounded flex items-start gap-2 bg-orange-50 text-orange-800">
          <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 flex-shrink-0" />
          <span className="text-sm">
            <strong>Vuln ID (CVE)</strong> must be mapped to proceed. Select which column contains the CVE identifier.
          </span>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center px-4 py-3 bg-gray-50 border-b font-medium text-sm text-secondary">
          <span>Source Column (from file)</span>
          <span />
          <span>Maps To (our field)</span>
        </div>

        {/* Rows */}
        {headers.map((header) => {
          const currentValue = getCurrentValue(header);
          const availableOptions = getAvailableOptions(header);
          const isMapped = currentValue.value !== null;

          return (
            <div
              key={header}
              className={`grid grid-cols-[1fr_auto_1fr] gap-4 items-center px-4 py-3 border-b last:border-b-0 ${
                isMapped ? 'bg-green-50' : ''
              }`}
            >
              <span className="text-sm font-mono truncate" title={header}>
                {header}
              </span>
              <FontAwesomeIcon
                icon={faArrowRight}
                className={`text-sm ${isMapped ? 'text-green-600' : 'text-gray-300'}`}
              />
              <DropDownList
                data={availableOptions}
                value={currentValue}
                onChange={(e) => handleMappingChange(header, e)}
                textField="label"
                dataItemKey="value"
                className="w-full"
              />
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-secondary">
        {mappings.filter((m) => m.targetField !== null).length} of {headers.length} columns mapped
      </div>
    </div>
  );
}
