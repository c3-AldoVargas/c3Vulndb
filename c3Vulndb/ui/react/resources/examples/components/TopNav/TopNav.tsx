/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React from 'react';
interface TopNavProps {
  title?: string;
}

export default function TopNav({ title }: TopNavProps) {
  return (
    <div className="sticky top-0 z-30 bg-primary flex w-full" style={{ minHeight: '32px' }}>
      <div className="flex flex-1 items-center pl-8 md:pl-4 border-b border-weak">
        <h2 className="text-xl">{title}</h2>
      </div>
    </div>
  );
}
