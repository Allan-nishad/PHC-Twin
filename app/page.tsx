'use client';

import React from 'react';
import Link from 'next/link';
import { usePHC } from '@/components/phc-context';
import { ConceptVisual } from '@/components/concept-visual';
import { StatusBadge } from '@/components/status-badge';
import {
  Building2,
  Activity,
  AlertTriangle,
  BellRing,
  Play,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function OverviewPage() {
  const { phcs, networkMetrics, alerts, interventions, startGuidedDemo } = usePHC();

  const topIntervention = interventions[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 font-sans">
      {/* 1. ONE Clean Hero Section */}
      <section className="space-y-4">
        <div className="space-y-2">
          <div className="text-xs font-bold font-mono uppercase tracking-wider text-blue-600">
            PHC-Twin &bull; Healthcare Capability Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Know what healthcare each PHC can actually deliver.
          </h1>
          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
            PHC-Twin connects resources, dependencies, and services to identify hidden capability gaps and recommend high-impact interventions.
          </p>
        </div>

        {/* TWO Clear Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/phcs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <span>Explore PHC Network</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={startGuidedDemo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors"
          >
            <Play className="w-4 h-4 fill-current text-slate-700" />
            <span>Run Demo Scenario (60s)</span>
          </button>
        </div>
      </section>

      {/* 2. Four High-Level Indicators */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">PHCs Monitored</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {networkMetrics.totalPHCs}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">8 Indian States</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Average Service Coverage</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {networkMetrics.avgCoverage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">All 5 Service Streams</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Facilities with Outages</div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1">
            {networkMetrics.criticalCount}
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5">Critical Bottlenecks</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Active Alerts</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {alerts.length}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Staff & Stock Early Warnings</div>
        </div>
      </section>

      {/* 3. The Core Concept Visual */}
      <section>
        <ConceptVisual />
      </section>

      {/* 4. Active Recommendation (If any facility is down) */}
      {topIntervention && (
        <section className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-blue-800 uppercase font-mono tracking-wider">
              Priority Operational Intervention
            </span>
            <Link
              href="/interventions"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              Review all interventions &rarr;
            </Link>
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">{topIntervention.title}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{topIntervention.reason}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 pt-1">
            <span>
              Target: <strong>{topIntervention.targetPHCName}</strong>
            </span>
            <span>
              Transit Distance: <strong>{topIntervention.distanceKm} km</strong>
            </span>
            <span>
              Patients Protected: <strong>+{topIntervention.affectedPatientsProtected}/day</strong>
            </span>
            <span>
              Est. Recovery: <strong>~{topIntervention.recoveryTimeHours} hrs</strong>
            </span>
          </div>
        </section>
      )}

      {/* 5. PHC Capability Overview Table */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Facility Capability Status</h3>
            <p className="text-xs text-slate-500">
              Live service availability across India&apos;s Primary Health Centres
            </p>
          </div>
          <Link
            href="/phcs"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            <span>View all 15 facilities</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">PHC Facility</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Service Coverage</th>
                <th className="py-2.5 px-3">Diagnostics</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {phcs.slice(0, 6).map((phc) => (
                <tr key={phc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    <Link href={`/phcs/${phc.id}`} className="hover:text-blue-600">
                      {phc.name}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {phc.district}, {phc.state}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {phc.overallCoveragePercentage}%
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge
                      status={phc.capabilities?.diagnostics.status || 'AVAILABLE'}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={phc.statusSummary || 'AVAILABLE'} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/phcs/${phc.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs inline-flex items-center gap-0.5"
                    >
                      Inspect &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
