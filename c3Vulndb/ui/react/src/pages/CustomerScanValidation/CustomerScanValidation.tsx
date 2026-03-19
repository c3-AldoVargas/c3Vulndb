/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { useState, useCallback } from 'react';
import { Stepper, type StepperChangeEvent } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faMagnifyingGlass, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import TopNav from '@/components/TopNav/TopNav';
import { useTheme } from '@/hooks/useTheme';
import type { ColumnMapping, CustomerScanRow, ValidationResult } from '@/Interfaces';
import { validateCustomerScan } from '@/shared/api';
import UploadStep, { type ParsedFileData } from './UploadStep';
import MappingStep from './MappingStep';
import ResultsStep from './ResultsStep';

const STEPS = [
  { label: 'Upload Report', className: 'text-sm' },
  { label: 'Map Columns', className: 'text-sm' },
  { label: 'Validation Results', className: 'text-sm' },
];

export default function CustomerScanValidation() {
  useTheme();

  const [currentStep, setCurrentStep] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedFileData | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Called when the user uploads and parses a file in Step 1.
   */
  const handleDataParsed = useCallback((data: ParsedFileData) => {
    setParsedData(data);
    // Initialize all columns as unmapped
    setMappings(data.headers.map((h) => ({ sourceColumn: h, targetField: null })));
    // Reset downstream state
    setValidationResult(null);
    setError(null);
  }, []);

  /**
   * Is the current step valid enough to proceed?
   */
  const isStepValid = useCallback((): boolean => {
    if (currentStep === 0) {
      return parsedData !== null && parsedData.rows.length > 0;
    }
    if (currentStep === 1) {
      return mappings.some((m) => m.targetField === 'vulnId');
    }
    return true;
  }, [currentStep, parsedData, mappings]);

  /**
   * Navigate forward.
   */
  const handleNext = useCallback(async () => {
    if (currentStep === 0 && isStepValid()) {
      setCurrentStep(1);
    } else if (currentStep === 1 && isStepValid()) {
      // Run validation
      setValidating(true);
      setError(null);
      try {
        // Build normalized rows from parsed data + mappings
        const normalizedRows: CustomerScanRow[] = parsedData!.rows.map((row) => {
          const normalized: CustomerScanRow = {
            vulnId: '',
            image: '',
            tag: '',
            repository: '',
            messageSeverity: '',
            path: '',
            classifications: '',
            hasFix: '',
            externalCvssVector: '',
            message: '',
          };
          mappings.forEach((m) => {
            if (m.targetField && row[m.sourceColumn] !== undefined) {
              normalized[m.targetField as keyof CustomerScanRow] = row[m.sourceColumn];
            }
          });
          return normalized;
        });

        // Filter out rows without a vulnId
        const validRows = normalizedRows.filter((r) => r.vulnId.trim() !== '');

        const result = await validateCustomerScan(validRows);
        setValidationResult(result);
        setCurrentStep(2);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Validation failed. Please try again.';
        setError(msg);
      } finally {
        setValidating(false);
      }
    }
  }, [currentStep, isStepValid, parsedData, mappings]);

  /**
   * Navigate backward.
   */
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  /**
   * Reset the entire wizard.
   */
  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setParsedData(null);
    setMappings([]);
    setValidationResult(null);
    setError(null);
  }, []);

  /**
   * Allow clicking on the stepper to navigate (only to visited/valid steps).
   */
  const handleStepClick = useCallback(
    (event: StepperChangeEvent) => {
      const target = event.value;
      // Allow going back freely; forward only if current step is valid
      if (target < currentStep) {
        setCurrentStep(target);
      } else if (target === currentStep + 1 && isStepValid()) {
        // Only allow step-by-step forward via Next button (not skipping)
        // For step 1→2 we need to run validation, so don't allow direct click
        if (currentStep === 0) {
          setCurrentStep(1);
        }
      }
    },
    [currentStep, isStepValid]
  );

  return (
    <>
      <TopNav title="Customer Scan Validation" />
      <div className="p-4">
        {/* Stepper */}
        <div className="c3-card mb-4">
          <Stepper value={currentStep} onChange={handleStepClick} items={STEPS} />
        </div>

        {/* Error */}
        {error && (
          <div className="c3-card mb-4 border-danger">
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="c3-card mb-4">
          {currentStep === 0 && <UploadStep parsedData={parsedData} onDataParsed={handleDataParsed} />}

          {currentStep === 1 && parsedData && (
            <MappingStep headers={parsedData.headers} mappings={mappings} onMappingsChange={setMappings} />
          )}

          {currentStep === 2 && validationResult && (
            <ResultsStep matched={validationResult.matched} nonMatched={validationResult.nonMatched} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 0 && currentStep < 2 && (
              <Button fillMode="outline" themeColor="base" onClick={handleBack}>
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentStep === 2 && (
              <Button fillMode="outline" themeColor="base" onClick={handleReset}>
                <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
                New Validation
              </Button>
            )}
            {currentStep < 2 && (
              <Button themeColor="primary" onClick={handleNext} disabled={!isStepValid() || validating}>
                {currentStep === 1 ? (
                  <>
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
                    {validating ? 'Validating...' : 'Validate'}
                  </>
                ) : (
                  <>
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
