/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React from 'react';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  height?: string;
  customHeight?: string;
  showActionsBar?: boolean;
  primaryAction?: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = '600px',
  height = 'auto',
  customHeight,
  showActionsBar = false,
  primaryAction,
  secondaryAction,
  className = '',
}: ModalProps) {
  if (!isOpen) return null;

  const handlePrimaryAction = () => {
    if (primaryAction?.onClick) {
      primaryAction.onClick();
    }
  };

  const handleSecondaryAction = () => {
    if (secondaryAction?.onClick) {
      secondaryAction.onClick();
    } else {
      onClose();
    }
  };

  return (
    <>
      {customHeight && (
        <style>
          {`
            .k-window.k-dialog {
              max-height: 90vh !important;
              position: relative !important;
            }
            .k-window.k-dialog .k-window-content {
              max-height: calc(90vh - 60px) !important;
              overflow: hidden !important;
              padding: 0 !important;
              position: relative !important;
            }
            .k-window.k-dialog .k-dialog-titlebar {
              flex-shrink: 0 !important;
            }
            .modal-content-wrapper {
              position: relative !important;
              height: 100% !important;
              padding-bottom: 70px !important;
            }
            .modal-scrollable-content {
              height: 100% !important;
              overflow-y: auto !important;
              padding: 24px !important;
            }
            .modal-actions {
              position: absolute !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              background: white !important;
              border-top: 1px solid #e5e7eb !important;
              padding: 16px 24px !important;
              z-index: 10 !important;
              box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1) !important;
            }
            ${
              customHeight
                ? `
              .k-window.k-dialog {
                height: ${customHeight} !important;
                max-height: ${customHeight} !important;
              }
              .k-window.k-dialog .k-window-content {
                height: calc(100% - 40px) !important;
                max-height: calc(100% - 40px) !important;
              }
            `
                : ''
            }
          `}
        </style>
      )}
      <Dialog onClose={onClose} title={title} width={width} height={height} className={className}>
        <div className="modal-content-wrapper">
          <div className="modal-scrollable-content">{children}</div>
        </div>

        {showActionsBar && (
          <DialogActionsBar layout="stretched">
            <div className="flex justify-end gap-2">
              {secondaryAction && (
                <Button onClick={handleSecondaryAction} fillMode="outline" themeColor="secondary">
                  {secondaryAction?.text || 'Cancel'}
                </Button>
              )}
              {primaryAction && (
                <Button onClick={handlePrimaryAction} themeColor="primary" disabled={primaryAction.disabled}>
                  {primaryAction.text}
                </Button>
              )}
            </div>
          </DialogActionsBar>
        )}
      </Dialog>
    </>
  );
}
