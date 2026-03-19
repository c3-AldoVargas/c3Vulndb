/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { useEffect, useState } from 'react';
import { Input, TextArea, NumericTextBox, Checkbox } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { DocumentGenerationFormData } from '../../DocumentGenerationModal';

interface DocumentGenerationFormStep2Props {
  formData: DocumentGenerationFormData;
  onFormDataChange: (formData: DocumentGenerationFormData, isValid: boolean) => void;
}

interface FormData {
  title: string;
  description: string;
  priority: string;
  additionalInstructions: string;
  [key: string]: unknown; // Allow dynamic fields
}

// Field types for dynamic form generation
export type FieldType = 'text' | 'textarea' | 'dropdown' | 'date' | 'number' | 'checkbox';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ text: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}

// Static mapping of template fields by template ID
const TEMPLATE_FIELD_MAPPING: Record<string, FormField[]> = {
  rfp_proposal: [
    {
      name: 'application',
      label: 'Application Type',
      type: 'dropdown',
      required: true,
      options: [
        { text: 'C3 Law Enforcement', value: 'law_enforcement' },
        { text: 'C3 AI Property Appraisal', value: 'property_appraisal' },
        { text: 'C3 AI Document IQ', value: 'document_iq' },
        { text: 'C3 AI Safety IQ', value: 'safety_iq' },
      ],
    },
    {
      name: 'pointOfContact',
      label: 'Point of Contact',
      type: 'dropdown',
      required: true,
      options: [
        { text: 'John Doe', value: 'john_doe' },
        { text: 'Jane Smith', value: 'jane_smith' },
        { text: 'Srihari Parthasarathy', value: 'srihari_parthasarathy' },
        { text: 'Grant Guttschow', value: 'grant_guttschow' },
      ],
    },
    {
      name: 'numberOfCoeRequired',
      label: 'Number of CoE Required',
      type: 'number',
      required: true,
      validation: { min: 1 },
    },
  ],
  'memo-template': [
    {
      name: 'recipient',
      label: 'To (Recipient)',
      type: 'text',
      required: true,
      placeholder: 'Enter recipient name or department',
    },
    {
      name: 'sender',
      label: 'From (Sender)',
      type: 'text',
      required: true,
      placeholder: 'Enter your name or department',
    },
    {
      name: 'urgency',
      label: 'Urgency Level',
      type: 'dropdown',
      required: true,
      options: [
        { text: 'High', value: 'high' },
        { text: 'Medium', value: 'medium' },
        { text: 'Low', value: 'low' },
      ],
    },
    {
      name: 'actionRequired',
      label: 'Action Required',
      type: 'checkbox',
    },
  ],
  'proposal-template': [
    {
      name: 'clientName',
      label: 'Client Name',
      type: 'text',
      required: true,
      placeholder: 'Enter client or organization name',
    },
    {
      name: 'proposalValue',
      label: 'Proposal Value ($)',
      type: 'number',
      required: true,
      validation: { min: 0 },
    },
    {
      name: 'deliveryDate',
      label: 'Expected Delivery Date',
      type: 'date',
      required: true,
    },
    {
      name: 'scopeOfWork',
      label: 'Scope of Work Summary',
      type: 'textarea',
      required: true,
      placeholder: 'Briefly describe the scope of work...',
      validation: { minLength: 50, maxLength: 1000 },
    },
    {
      name: 'includeTimeline',
      label: 'Include Project Timeline',
      type: 'checkbox',
    },
  ],
  'letter-template': [
    {
      name: 'recipientAddress',
      label: 'Recipient Address',
      type: 'textarea',
      required: true,
      placeholder: "Enter the recipient's full address...",
    },
    {
      name: 'letterType',
      label: 'Letter Type',
      type: 'dropdown',
      required: true,
      options: [
        { text: 'Business Letter', value: 'business' },
        { text: 'Cover Letter', value: 'cover' },
        { text: 'Recommendation Letter', value: 'recommendation' },
        { text: 'Complaint Letter', value: 'complaint' },
        { text: 'Thank You Letter', value: 'thankyou' },
      ],
    },
    {
      name: 'formalTone',
      label: 'Use Formal Tone',
      type: 'checkbox',
    },
  ],
};

export default function DocumentGenerationFormStep2({ formData, onFormDataChange }: DocumentGenerationFormStep2Props) {
  // Get template-specific fields
  const getTemplateFields = (templateId?: string): FormField[] => {
    if (!templateId) return [];
    return TEMPLATE_FIELD_MAPPING[templateId] || [];
  };

  const [formValues, setFormValues] = useState<FormData>({
    title: formData.title || '',
    description: formData.description || '',
    priority: 'medium',
    additionalInstructions: formData.additionalInstructions || '',
    ...Object.fromEntries(
      // Initialize dynamic fields with empty values
      getTemplateFields(formData.template?.id).map((field) => [field.name, field.type === 'checkbox' ? false : ''])
    ),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Render dynamic form field based on field configuration
  const renderFormField = (field: FormField) => {
    const fieldError = errors[field.name];

    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-secondary mb-1">
              {field.label}
              {field.required && <span className="text-warning ml-1">*</span>}
            </label>
            <Input
              id={field.name}
              name={field.name}
              value={formValues[field.name] || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                setFormValues((prev) => ({ ...prev, [field.name]: newValue }));
                // Clear error when user starts typing
                if (errors[field.name]) {
                  setErrors((prev) => ({ ...prev, [field.name]: '' }));
                }
              }}
              placeholder={field.placeholder}
              className={`w-full ${fieldError ? 'border-warning' : ''}`}
            />
            {fieldError && <span className="text-warning text-xs mt-1">{fieldError}</span>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-secondary mb-2">
              {field.label}
              {field.required && <span className="text-warning ml-1">*</span>}
            </label>
            <TextArea
              id={field.name}
              name={field.name}
              value={formValues[field.name] || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                setFormValues((prev) => ({ ...prev, [field.name]: newValue }));
                if (errors[field.name]) {
                  setErrors((prev) => ({ ...prev, [field.name]: '' }));
                }
              }}
              placeholder={field.placeholder}
              rows={3}
              className={`w-full ${fieldError ? 'border-warning' : ''}`}
            />
            {fieldError && <span className="text-warning text-xs mt-1">{fieldError}</span>}
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-secondary mb-2">
              {field.label}
              {field.required && <span className="text-warning ml-1">*</span>}
            </label>
            <DropDownList
              id={field.name}
              name={field.name}
              data={field.options || []}
              textField="text"
              dataItemKey="value"
              value={field.options?.find((opt) => opt.value === formValues[field.name]) || null}
              onChange={(e) => {
                const newValue = e.target.value?.value || '';
                setFormValues((prev) => ({ ...prev, [field.name]: newValue }));
                if (errors[field.name]) {
                  setErrors((prev) => ({ ...prev, [field.name]: '' }));
                }
              }}
              className={`w-full ${fieldError ? 'border-warning' : ''}`}
            />
            {fieldError && <span className="text-warning text-xs mt-1">{fieldError}</span>}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-secondary mb-2">
              {field.label}
              {field.required && <span className="text-warning ml-1">*</span>}
            </label>
            <DatePicker
              id={field.name}
              name={field.name}
              value={formValues[field.name] ? new Date(formValues[field.name]) : null}
              onChange={(e) => {
                const newValue = e.target.value;
                setFormValues((prev) => ({ ...prev, [field.name]: newValue }));
                if (errors[field.name]) {
                  setErrors((prev) => ({ ...prev, [field.name]: '' }));
                }
              }}
              className={`w-full ${fieldError ? 'border-warning' : ''}`}
            />
            {fieldError && <span className="text-warning text-xs mt-1">{fieldError}</span>}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-secondary mb-2">
              {field.label}
              {field.required && <span className="text-warning ml-1">*</span>}
            </label>
            <NumericTextBox
              id={field.name}
              name={field.name}
              value={formValues[field.name] || 0}
              onChange={(e) => {
                const newValue = e.target.value;
                setFormValues((prev) => ({ ...prev, [field.name]: newValue }));
                if (errors[field.name]) {
                  setErrors((prev) => ({ ...prev, [field.name]: '' }));
                }
              }}
              min={field.validation?.min}
              max={field.validation?.max}
              className={`w-full ${fieldError ? 'border-warning' : ''}`}
            />
            {fieldError && <span className="text-warning text-xs mt-1">{fieldError}</span>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="flex items-center space-x-2">
              <Checkbox
                id={field.name}
                name={field.name}
                checked={!!formValues[field.name]}
                onChange={(e) => {
                  const newValue = e.value;
                  setFormValues((prev) => ({ ...prev, [field.name]: newValue }));
                  if (errors[field.name]) {
                    setErrors((prev) => ({ ...prev, [field.name]: '' }));
                  }
                }}
              />
              <span className="text-sm font-medium text-secondary">{field.label}</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Update parent form data when form values change
  useEffect(() => {
    const templateFields = getTemplateFields(formData.template?.id);

    // Check if all required fields are valid
    const isFormValid =
      // Basic required fields
      formValues.title?.trim() !== '' &&
      formValues.description?.trim() !== '' &&
      // Template-specific required fields
      templateFields.every((field) => {
        if (!field.required) return true;
        const value = formValues[field.name];
        return value !== undefined && value !== null && value !== '' && (field.type !== 'number' || value !== 0);
      }) &&
      // No validation errors
      Object.keys(errors).length === 0;

    onFormDataChange(
      {
        ...formData,
        title: formValues.title,
        description: formValues.description,
        additionalInstructions: formValues.additionalInstructions,
        // Include all dynamic field values
        ...Object.fromEntries(
          getTemplateFields(formData.template?.id).map((field) => [field.name, formValues[field.name]])
        ),
      },
      isFormValid
    );
  }, [formValues, formData, onFormDataChange, errors]);

  return (
    <div className="space-y-3">
      {/* Template Info */}
      <div className="flex items-center bg-accent-weak border border-accent text-accent px-2 py-2">
        <p className="text-xs text-primary">
          Selected Template: <span className="text-secondary">{formData.template?.name || 'None selected'}</span>
        </p>
      </div>

      {/* Document Details Section */}
      <>
        <div>
          <h2 className="text-xl">Document Details</h2>
          <p className="text-sm text-secondary">Fill out the details of the document</p>
        </div>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-secondary mb-1">
            Title <span className="text-warning ml-1">*</span>
          </label>
          <Input
            id="title"
            name="title"
            value={formValues.title || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              setFormValues((prev) => ({ ...prev, title: newValue }));
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: '' }));
              }
            }}
            placeholder="Enter document title..."
            className={`w-full ${errors.title ? 'border-warning' : ''}`}
          />
          {errors.title && <span className="text-warning text-xs mt-1">{errors.title}</span>}
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-secondary mb-1">
            Description <span className="text-warning ml-1">*</span>
          </label>
          <TextArea
            id="description"
            name="description"
            value={formValues.description || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              setFormValues((prev) => ({ ...prev, description: newValue }));
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: '' }));
              }
            }}
            placeholder="Enter document description..."
            rows={3}
            className="w-full"
          />
        </div>
      </>

      {/* Template-Specific Fields Section */}
      {formData.template?.id && getTemplateFields(formData.template.id).length > 0 && (
        <div>{getTemplateFields(formData.template.id).map((field) => renderFormField(field))}</div>
      )}
    </div>
  );
}
