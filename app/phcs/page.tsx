'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePHC } from '@/components/phc-context';
import { StatusBadge } from '@/components/status-badge';
import { MapWrapper } from '@/components/map-wrapper';
import { Search, Filter, ArrowLeft, ChevronRight, Map, List } from 'lucide-react';
import { CapabilityStatus, ServiceId } from '@/lib/types';

export default function PHCNetworkPage() {
  const { phcs } = usePHC();
  const [viewMode, setViewMode] = useState<'MAP' | 'TABLE'>('MAP');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');

  const states = useMemo(() => {
    const set = new Set(phcs.map((p) => p.state));
    return Array.from(set).sort();
  }, [phcs]);

  const filteredPHCs = useMemo(() => {
    return phcs.filter((phc) => {
      const matchesSearch =
        phc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phc.state.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesState = selectedState === 'ALL' || phc.state === selectedState;
      return matchesSearch && matchesState;
    });
  }, [phcs, searchQuery, selectedState]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 font-sans">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Primary Health Centre Network</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            15 monitored healthcare centres across India &bull; Click any facility or road to inspect capability & transit
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setViewMode('MAP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'MAP'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>District Roadmap</span>
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'TABLE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Facility Registry</span>
          </button>
        </div>
      </div>

      {/* Render Map View */}
      {viewMode === 'MAP' && (
        <div className="space-y-4">
          <MapWrapper />
        </div>
      )}

      {/* Simple Search & State Filter (Shown always or with Table) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search facility by name, district, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All States ({states.length})</option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clean, Simple 5-Column Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">PHC Facility</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Service Coverage</th>
                <th className="py-3 px-4">Critical Services</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPHCs.map((phc) => {
                // Determine critical service note
                const diagDown = phc.capabilities?.diagnostics.status === 'UNAVAILABLE';
                const emgDown = phc.capabilities?.emergency.status === 'UNAVAILABLE';
                const matDown = phc.capabilities?.maternal.status === 'UNAVAILABLE';

                let criticalServiceText = 'All Services Active';
                if (diagDown && emgDown) criticalServiceText = 'Diagnostics & Emergency Offline';
                else if (diagDown) criticalServiceText = 'Diagnostics Offline';
                else if (emgDown) criticalServiceText = 'Emergency Offline';
                else if (matDown) criticalServiceText = 'Maternal Care Limited';

                return (
                  <tr
                    key={phc.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      phc.id === 'phc-rampur' ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <Link href={`/phcs/${phc.id}`} className="hover:text-blue-600">
                        {phc.name}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono">{phc.code}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{phc.district}</div>
                      <div className="text-[11px] text-slate-500">{phc.state}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {phc.overallCoveragePercentage}%
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs ${
                          diagDown || emgDown
                            ? 'text-rose-700 font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        {criticalServiceText}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={phc.statusSummary || 'AVAILABLE'} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/phcs/${phc.id}`}
                        className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-semibold text-xs"
                      >
                        Inspect &rarr;
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
  );
}
