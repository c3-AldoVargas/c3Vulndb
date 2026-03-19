/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileText, faClock } from '@fortawesome/free-solid-svg-icons';
import { DocumentTemplate } from '@/Interfaces';

interface DocumentTemplateCardProps {
  template: DocumentTemplate;
  className?: string;
}

export default function DocumentTemplateCard({ template, className = '' }: DocumentTemplateCardProps) {
  return (
    <div
      className={`c3-card p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-20 hover:border-accent h-full flex flex-col ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-weak rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faFileText} className="text-accent" />
          </div>
          <div>
            <h3 className="font-medium mb-1">{template.name}</h3>
            {template.estimatedTime && (
              <div className="flex items-center gap-1 text-sm text-secondary">
                <FontAwesomeIcon icon={faClock} className="text-xs" />
                {template.estimatedTime}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-secondary mb-4 leading-relaxed flex-1">{template.description}</p>
    </div>
  );
}
