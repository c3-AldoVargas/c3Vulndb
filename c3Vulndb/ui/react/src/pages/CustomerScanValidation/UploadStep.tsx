/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { useRef, useState, useCallback } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowUp, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

export interface ParsedFileData {
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
}

interface UploadStepProps {
  parsedData: ParsedFileData | null;
  onDataParsed: (data: ParsedFileData) => void;
}

/**
 * Simple CSV parser that handles quoted fields.
 */
function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    // Skip empty rows
    if (values.every((v) => !v)) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

export default function UploadStep({ parsedData, onDataParsed }: UploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      const isJson = file.name.endsWith('.json');
      const isCsv = file.name.endsWith('.csv');

      if (!isJson && !isCsv) {
        setError('Only .csv and .json files are accepted.');
        return;
      }

      try {
        const text = await file.text();

        if (isJson) {
          const parsed = JSON.parse(text);
          const arr = Array.isArray(parsed) ? parsed : [parsed];
          if (arr.length === 0) {
            setError('JSON file contains no data.');
            return;
          }
          const headers = Object.keys(arr[0]);
          const rows = arr.map((item: Record<string, unknown>) => {
            const row: Record<string, string> = {};
            headers.forEach((h) => {
              row[h] = item[h] != null ? String(item[h]) : '';
            });
            return row;
          });
          onDataParsed({ fileName: file.name, headers, rows });
        } else {
          const { headers, rows } = parseCsv(text);
          if (headers.length === 0 || rows.length === 0) {
            setError('CSV file is empty or could not be parsed.');
            return;
          }
          onDataParsed({ fileName: file.name, headers, rows });
        }
      } catch {
        setError('Failed to parse the file. Please check the format.');
      }
    },
    [onDataParsed]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const previewRows = parsedData ? parsedData.rows.slice(0, 5) : [];

  return (
    <div>
      <p className="text-sm text-secondary mb-4">
        Upload a customer security scan report in <strong>CSV</strong> or <strong>JSON</strong> format. You will map the
        columns to our schema in the next step.
      </p>

      {/* Drop zone */}
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
          if (file) processFile(file);
        }}
      >
        <FontAwesomeIcon
          icon={faFileArrowUp}
          className={`text-4xl mb-3 ${parsedData ? 'text-accent' : 'text-gray-400'}`}
        />
        {parsedData ? (
          <div>
            <p className="font-medium">{parsedData.fileName}</p>
            <p className="text-sm text-secondary mt-1">
              {parsedData.headers.length} columns &middot; {parsedData.rows.length} rows &mdash; Click or drop to
              replace
            </p>
          </div>
        ) : (
          <div>
            <p className="font-medium">Click to select or drag &amp; drop a CSV / JSON file</p>
            <p className="text-sm text-secondary mt-1">Accepted formats: .csv, .json</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded flex items-start gap-2 bg-red-50 text-red-800">
          <FontAwesomeIcon icon={faXmark} className="mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success */}
      {parsedData && !error && (
        <div className="mt-4 p-3 rounded flex items-start gap-2 bg-green-50 text-green-800">
          <FontAwesomeIcon icon={faCheck} className="mt-0.5 flex-shrink-0" />
          <span className="text-sm">
            Parsed <strong>{parsedData.rows.length}</strong> rows with{' '}
            <strong>{parsedData.headers.length}</strong> columns.
          </span>
        </div>
      )}

      {/* Preview table */}
      {parsedData && previewRows.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Preview (first 5 rows)</h3>
          <div className="w-full overflow-x-auto">
            <Grid data={previewRows} style={{ width: '100%' }} resizable={true}>
              {parsedData.headers.map((header) => (
                <GridColumn key={header} field={header} title={header} minResizableWidth={100} />
              ))}
            </Grid>
          </div>
        </div>
      )}
    </div>
  );
}
