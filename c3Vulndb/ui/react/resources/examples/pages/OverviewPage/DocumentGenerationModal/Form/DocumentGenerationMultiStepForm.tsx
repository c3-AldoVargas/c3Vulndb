/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { useState, useCallback } from 'react';
import { Stepper, StepperChangeEvent } from '@progress/kendo-react-layout';
import { Loader } from '@progress/kendo-react-indicators';

import { DocumentGenerationFormData } from '../DocumentGenerationModal';
import DocumentGenerationFormStep1 from './Step1/DocumentGenerationFormStep1';
import DocumentGenerationFormStep2 from './Step2/DocumentGenerationFormStep2';

interface DocumentGenerationMultiStepFormProps {
  formData: DocumentGenerationFormData;
  onFormDataChange: (formData: DocumentGenerationFormData, isValid?: boolean) => void;
  onGenerate: () => void;
  onClose: () => void;
}

export default function DocumentGenerationMultiStepForm({
  formData,
  onFormDataChange,
  onGenerate,
  onClose,
}: DocumentGenerationMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [step2IsValid, setStep2IsValid] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Wrapper to track step 2 validation state
  const handleFormDataChange = useCallback(
    (newFormData: DocumentGenerationFormData, isValid?: boolean) => {
      if (isValid !== undefined) {
        setStep2IsValid(isValid);
      }
      onFormDataChange(newFormData, isValid);
    },
    [onFormDataChange]
  );

  const handleNextStep = useCallback(() => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  }, [currentStep]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  }, [currentStep]);

  const isStepValid = useCallback(() => {
    if (currentStep === 1) {
      return formData.template?.id !== '';
    }
    if (currentStep === 2) {
      return step2IsValid;
    }
    return false;
  }, [currentStep, formData.template?.id, step2IsValid]);

  const steps = [
    {
      label: 'Select Template',
      className: 'text-sm',
    },
    {
      label: 'Document Details',
      className: 'text-sm',
    },
  ];

  const handleStepClick = useCallback(
    (event: StepperChangeEvent) => {
      const stepIndex = event.value;
      // Only allow going to previous steps or next step if current is valid
      if (stepIndex < currentStep || (stepIndex === currentStep + 1 && isStepValid())) {
        setCurrentStep((stepIndex + 1) as 1 | 2);
      }
    },
    [currentStep, isStepValid]
  );

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleGenerate = useCallback(async () => {
    if (isStepValid()) {
      setIsGenerating(true);
      try {
        await onGenerate();
      } finally {
        setIsGenerating(false);
      }
    }
  }, [onGenerate, isStepValid]);

  const renderActionButtons = useCallback(() => {
    if (currentStep === 1) {
      return (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={handleCancel}
            className="py-2 px-6 text-base border border-accent text-accent hover:bg-accent hover:text-inverse transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleNextStep}
            disabled={!isStepValid()}
            className="py-2 px-6 text-base bg-accent text-inverse focus:outline-none hover:bg-accent-hover transition-colors w-full sm:w-auto"
          >
            Use Template
          </button>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={handlePreviousStep}
            className="py-2 px-6 text-base border border-accent text-accent hover:bg-accent hover:text-inverse transition-colors w-full sm:w-auto"
            disabled={isGenerating}
          >
            Previous
          </button>
          <button
            onClick={handleCancel}
            className="py-2 px-6 text-base border border-accent text-accent hover:bg-accent hover:text-inverse transition-colors w-full sm:w-auto"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!isStepValid() || isGenerating}
            className={`py-2 px-6 text-base focus:outline-none transition-colors w-full sm:w-auto ${
              isStepValid() && !isGenerating
                ? 'bg-accent text-inverse hover:bg-accent-hover cursor-pointer'
                : 'bg-gray-300 text-secondary cursor-not-allowed opacity-50 border border-strong'
            } flex items-center justify-center`}
          >
            {isGenerating ? <Loader type={'converging-spinner'} size="small" className="mr-2" /> : 'Generate Document'}
          </button>
        </div>
      );
    }

    return null;
  }, [currentStep, handleCancel, handleNextStep, handlePreviousStep, handleGenerate, isStepValid, isGenerating]);

  return (
    <div className="document-generation-form">
      {/* Kendo Stepper */}
      <div className="mb-4">
        <Stepper value={currentStep - 1} onChange={handleStepClick} items={steps} />
      </div>

      {/* Step Content */}
      <div className="mb-6">
        {/* Step 1: Template Selection */}
        {currentStep === 1 && (
          <DocumentGenerationFormStep1 formData={formData} onFormDataChange={handleFormDataChange} />
        )}

        {/* Step 2: Dynamic Form - placeholder for now */}
        {currentStep === 2 && (
          <DocumentGenerationFormStep2 formData={formData} onFormDataChange={handleFormDataChange} />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="modal-actions">
        <div className="flex flex-col sm:flex-row justify-end gap-3">{renderActionButtons()}</div>
      </div>
    </div>
  );
}
