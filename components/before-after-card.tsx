import React from 'react';
import { TrendingUp, ArrowRight, ShieldCheck, Users, Clock, Zap } from 'lucide-react';

interface BeforeAfterCardProps {
  beforeCoverage: number;
  afterCoverage: number;
  patientsProtected: number;
  recoveryHours: number;
  facilityName: string;
  serviceName: string;
}

export const BeforeAfterCard: React.FC<BeforeAfterCardProps> = ({
  beforeCoverage,
  afterCoverage,
  patientsProtected,
  recoveryHours,
  facilityName,
  serviceName,
}) => {
  const delta = afterCoverage - beforeCoverage;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold">Intervention Capability Impact Forecast</h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          +{delta}% Projected Restoration
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Before vs After Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Before */}
          <div className="p-4 rounded-lg bg-rose-50/70 border border-rose-200">
            <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1">
              BEFORE INTERVENTION
            </div>
            <div className="text-xs text-slate-600 mb-2">{serviceName} Coverage</div>
            <div className="text-3xl font-extrabold text-rose-800 font-mono">
              {beforeCoverage}%
            </div>
            <div className="text-[11px] text-rose-700 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Capability Offline / Bottlenecked
            </div>
          </div>

          {/* After */}
          <div className="p-4 rounded-lg bg-emerald-50/80 border border-emerald-200 relative overflow-hidden">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>AFTER INTERVENTION</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 font-extrabold">
                +{delta}%
              </span>
            </div>
            <div className="text-xs text-slate-600 mb-2">{serviceName} Coverage</div>
            <div className="text-3xl font-extrabold text-emerald-800 font-mono">
              {afterCoverage}%
            </div>
            <div className="text-[11px] text-emerald-700 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Active Clinical Throughput Restored
            </div>
          </div>
        </div>

        {/* Supporting Metric Badges */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-center">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Patients Protected</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {patientsProtected}
              <span className="text-xs font-normal text-slate-500 ml-1">/day</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Est. Recovery Time</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              ~{recoveryHours}
              <span className="text-xs font-normal text-slate-500 ml-1">hrs</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Facility Status</span>
            </div>
            <div className="text-sm font-bold text-emerald-700 mt-1">
              Restored
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
