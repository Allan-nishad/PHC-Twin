'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePHC } from '@/components/phc-context';
import { StatusBadge } from '@/components/status-badge';
import { SERVICES_CONFIG } from '@/lib/data';
import { ServiceId } from '@/lib/types';
import {
  Stethoscope,
  HeartPulse,
  Microscope,
  Ambulance,
  BedDouble,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function ServicesPage() {
  const { phcs } = usePHC();
  const [activeTab, setActiveTab] = useState<ServiceId>('diagnostics');

  const serviceIcons: Record<ServiceId, any> = {
    opd: Stethoscope,
    maternal: HeartPulse,
    diagnostics: Microscope,
    emergency: Ambulance,
    inpatient: BedDouble,
  };

  const selectedConfig = SERVICES_CONFIG[activeTab];

  // Calculate stats for current active tab service across all 15 PHCs
  const serviceStats = React.useMemo(() => {
    let availableCount = 0;
    let limitedCount = 0;
    let unavailCount = 0;
    let totalPatients = 0;

    phcs.forEach((p) => {
      const cap = p.capabilities?.[activeTab];
      if (cap?.status === 'AVAILABLE') availableCount++;
      else if (cap?.status === 'LIMITED') limitedCount++;
      else if (cap?.status === 'UNAVAILABLE') unavailCount++;
      totalPatients += cap?.effectiveCapacityPatients || 0;
    });

    const total = phcs.length;
    const coveragePercentage = Math.round((availableCount / total) * 100);

    return {
      availableCount,
      limitedCount,
      unavailCount,
      totalPatients,
      coveragePercentage,
    };
  }, [phcs, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            Healthcare Capability Matrix
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Clinical Service Delivery Streams
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluate dependency resilience and operational readiness across all 5 core primary healthcare streams.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-slate-200">
        {(Object.keys(SERVICES_CONFIG) as ServiceId[]).map((sid) => {
          const cfg = SERVICES_CONFIG[sid];
          const Icon = serviceIcons[sid];
          const isActive = activeTab === sid;

          return (
            <button
              key={sid}
              onClick={() => setActiveTab(sid)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cfg.name.split('(')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Active Service Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              {React.createElement(serviceIcons[activeTab], { className: 'w-6 h-6' })}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedConfig.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{selectedConfig.description}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500">Service Coverage Index</span>
            <div className="text-2xl font-extrabold font-mono text-slate-900">
              {serviceStats.coveragePercentage}%
            </div>
          </div>
        </div>

        {/* 4 Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <div className="text-xs text-emerald-800 font-semibold">Fully Available</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-800 mt-1">
              {serviceStats.availableCount} PHCs
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
            <div className="text-xs text-amber-800 font-semibold">Limited / Constrained</div>
            <div className="text-2xl font-extrabold font-mono text-amber-800 mt-1">
              {serviceStats.limitedCount} PHCs
            </div>
          </div>

          <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200">
            <div className="text-xs text-rose-800 font-semibold">Critical / Offline</div>
            <div className="text-2xl font-extrabold font-mono text-rose-800 mt-1">
              {serviceStats.unavailCount} PHCs
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-600 font-semibold">Est. Daily Delivery</div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
              ~{serviceStats.totalPatients}
              <span className="text-xs font-normal text-slate-500 ml-1">pts</span>
            </div>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="pt-2 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Facility Capability Breakdown for {selectedConfig.name}
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">PHC Facility</th>
                  <th className="py-2.5 px-4">District / State</th>
                  <th className="py-2.5 px-4">Capability Score</th>
                  <th className="py-2.5 px-4">Est. Daily Capacity</th>
                  <th className="py-2.5 px-4">Bottleneck / Constraint</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {phcs.map((phc) => {
                  const cap = phc.capabilities?.[activeTab];
                  return (
                    <tr key={phc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {phc.name}
                      </td>
                      <td className="py-3 px-4">
                        {phc.district}, {phc.state}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {cap?.score || 0}/100
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        ~{cap?.effectiveCapacityPatients || 0} pts/day
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {cap?.bottleneck || 'None (Fully Satisfied)'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={cap?.status || 'AVAILABLE'} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/phcs/${phc.id}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
