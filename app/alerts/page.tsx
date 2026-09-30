'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePHC } from '@/components/phc-context';
import { VoiceAlertBroadcaster } from '@/components/voice-alert-broadcaster';
import { AlertTriangle, Package, Activity, Info, Clock, ArrowRight } from 'lucide-react';

export default function AlertsPage() {
  const { alerts } = usePHC();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filtered = alerts.filter((a) => filterSeverity === 'ALL' || a.severity === filterSeverity);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Healthcare Capability Alerts</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Early warnings for service outages and projected medicine stock-outs
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Filter:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="py-1.5 px-3 bg-white border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="ALL">All Alerts ({alerts.length})</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>
        </div>
      </div>

      {/* Multilingual Voice Broadcast Bar */}
      <VoiceAlertBroadcaster
        alertTextEnglish="National Health Mission Emergency Capability Dispatch Feed"
        facilityName="District Health Network"
        district="Sitapur"
      />

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const isCrit = alert.severity === 'CRITICAL';
          const isHigh = alert.severity === 'HIGH';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                isCrit
                  ? 'bg-rose-50/70 border-rose-200'
                  : isHigh
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        isCrit
                          ? 'bg-rose-200 text-rose-900'
                          : isHigh
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{alert.reason}</p>
                  <p className="text-[11px] text-slate-500">
                    Location: <strong>{alert.phcName}</strong> &bull; {alert.district}, {alert.state}
                  </p>
                </div>

                <Link
                  href={`/phcs/${alert.phcId}`}
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <span>Resolve &rarr;</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
