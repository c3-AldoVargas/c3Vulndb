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
import { faUsers, faChartLine, faCog } from '@fortawesome/free-solid-svg-icons';
import TopNav from '@/components/TopNav/TopNav';
import { Map } from '@/components';
import type { Turbine } from '@/components';

// Sample wind turbine locations around the Bay Area
const WIND_TURBINES: Turbine[] = [
  {
    id: 1,
    name: 'Turbine Alpha',
    latitude: 37.5309,
    longitude: -122.1941,
    status: 'operational',
    powerOutput: 2.3,
    efficiency: 94.2,
    type: 'turbine',
  },
  {
    id: 2,
    name: 'Turbine Beta',
    latitude: 37.5109,
    longitude: -122.2141,
    status: 'maintenance',
    powerOutput: 0,
    efficiency: 0,
    type: 'turbine',
  },
  {
    id: 3,
    name: 'Turbine Gamma',
    latitude: 37.5409,
    longitude: -122.1841,
    status: 'operational',
    powerOutput: 2.1,
    efficiency: 91.8,
    type: 'turbine',
  },
  {
    id: 4,
    name: 'Turbine Delta',
    latitude: 37.5009,
    longitude: -122.2241,
    status: 'operational',
    powerOutput: 2.4,
    efficiency: 96.1,
    type: 'turbine',
  },
];

export default function AnalyticsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'maintenance':
        return 'text-yellow-600';
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-secondary0';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return '🟢';
      case 'maintenance':
        return '🟡';
      case 'offline':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <>
      <TopNav title="C3 Doc Management" />
      <div className="p-4">
        {/* Header */}
        <div className="c3-card mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Wind Turbine Analytics</h2>
              <p className="text-sm text-secondary">
                Real-time monitoring and analysis of wind turbine performance across the Bay Area
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-secondary">Total Power Output</div>
                <div className="text-2xl font-medium text-accent">6.8 MW</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-secondary">Active Turbines</div>
                <div className="text-2xl font-medium text-success">3/4</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map Section */}
          <div className="lg:col-span-2 c3-card">
            <div className="mb-4">
              <h2 className="text-lg font-medium">Turbine Locations</h2>
              <p className="text-sm text-secondary">Interactive map showing wind turbine locations and status</p>
            </div>
            <Map turbines={WIND_TURBINES} height="500px" showHeadquarters={true} />
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-4">
            {/* Performance Metrics and Turbine Status Row */}
            <div className="grid grid-cols-3 gap-4">
              {/* Performance Metrics */}
              <div className="c3-card">
                <div>
                  <h2 className="font-medium text-lg mb-4">Performance Metrics</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faChartLine} className="text-accent" />
                      <span className="text-sm">Average Efficiency</span>
                    </div>
                    <span className="font-medium text-secondary">94.0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCog} className="text-success" />
                      <span className="text-sm">Operational Rate</span>
                    </div>
                    <span className="font-medium text-secondary">75%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faUsers} className="text-warning" />
                      <span className="text-sm">Maintenance Due</span>
                    </div>
                    <span className="font-medium text-secondary">1</span>
                  </div>
                </div>
              </div>

              {/* Turbine Status List */}
              <div className="c3-card">
                <div>
                  <h2 className="font-medium text-lg mb-4">Turbine Status</h2>
                </div>
                <div className="space-y-4">
                  {WIND_TURBINES.map((turbine) => (
                    <div key={turbine.id} className="flex items-center justify-between rounded-lg hover:bg-gray-10">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getStatusIcon(turbine.status)}</span>
                        <div>
                          <div className="text-sm font-medium">{turbine.name}</div>
                          <div className="text-xs text-secondary">{turbine.powerOutput} MW</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-medium ${getStatusColor(turbine.status)}`}>
                          {turbine.status.charAt(0).toUpperCase() + turbine.status.slice(1)}
                        </div>
                        <div className="text-xs text-secondary">{turbine.efficiency}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="c3-card">
                <div>
                  <h2 className="font-medium text-lg mb-4">Quick Actions</h2>
                </div>
                <div className="space-y-4">
                  <button className="w-full py-2 px-3 text-sm bg-accent text-inverse hover:bg-accent-hover transition-colors">
                    Generate Report
                  </button>
                  <button className="w-full py-2 px-3 text-sm border border-accent text-accent hover:bg-accent hover:text-inverse transition-colors">
                    Schedule Maintenance
                  </button>
                  <button className="w-full py-2 px-3 text-sm border border-primary text-primary hover:bg-gray-10 transition-colors">
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
