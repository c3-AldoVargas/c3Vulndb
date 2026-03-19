/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React from 'react';
import { Skeleton } from '@progress/kendo-react-indicators';

interface ISkeletonLoaderGroupProps {
  numberOfLoaders?: number;
  groupHeight?: number;
  variant?: 'single' | 'mixed' | 'ascending' | 'descending' | 'title-value';
  className?: string;
}

function renderLoaderStyle(style: string, height: number, key: number) {
  const overrideLoaderStyle = { margin: '0 0 8px 0' };

  const smallLoader = <Skeleton shape={'rectangle'} style={{ ...overrideLoaderStyle, width: '60%', height: 12 }} />;
  const mediumLoader = <Skeleton shape={'rectangle'} style={{ ...overrideLoaderStyle, width: '80%', height: 16 }} />;
  const largeLoader = <Skeleton shape={'rectangle'} style={{ ...overrideLoaderStyle, width: '100%', height: 20 }} />;

  switch (style) {
    case 'ascending':
      return (
        <div className="flex" key={`loader-${key}`}>
          {smallLoader}
          {mediumLoader}
          {largeLoader}
        </div>
      );
    case 'descending':
      return (
        <div className="flex flex-col" key={`loader-${key}`}>
          {largeLoader}
          {mediumLoader}
          {smallLoader}
        </div>
      );
    case 'title-value':
      return (
        <div className="flex flex-col" key={`loader-${key}`}>
          {smallLoader}
          {mediumLoader}
        </div>
      );
    case 'mixed':
      return (
        <div className="flex flex-col" key={`loader-${key}`}>
          {smallLoader}
          {largeLoader}
          {mediumLoader}
        </div>
      );
    case 'single':
    default:
      return (
        <div className="flex flex-col" key={`loader-${key}`}>
          {largeLoader}
        </div>
      );
  }
}

export default function SkeletonLoaderGroup({
  numberOfLoaders = 1,
  groupHeight = 5,
  variant = 'mixed',
  className = '',
}: ISkeletonLoaderGroupProps) {
  return (
    <div className={className + ' flex flex-col gap-2'}>
      {[...Array(numberOfLoaders)]?.map((_, index) => renderLoaderStyle(variant, groupHeight, index))}
    </div>
  );
}
