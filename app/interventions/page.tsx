'use client';

import React from 'react';
import Link from 'next/link';
import { usePHC } from '@/components/phc-context';
import { BeforeAfterCard } from '@/components/before-after-card';
import { calculateInterventionImpact } from '@/lib/intervention-engine';
import { CheckCircle2, XCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function InterventionsPage() {
  const { phcs, interventions, approveIntervention, rejectIntervention, executeIntervention, selectedPHC } = usePHC();

  const topIntervention = interventions[0];

  const impactSummary = React.useMemo(() => {
    if (!topIntervention) {
      return {
        beforeCoverage: 52,
        afterCoverage: 81,
        patientsProtected: 28,
        recoveryHours: 1.5,
        facilityName: 'PHC Rampur',
      };
    }

    const target = phcs.find((p) => p.id === topIntervention.targetPHCId) || selectedPHC;
    const impact = calculateInterventionImpact(target, topIntervention, phcs);

    return {
      beforeCoverage: impact.network.diagCoverageBefore,
      afterCoverage: impact.network.diagCoverageAfter,
      patientsProtected: topIntervention.affectedPatientsProtected,
      recoveryHours: topIntervention.recoveryTimeHours,
      facilityName: target.name,
    };
  }, [topIntervention, phcs, selectedPHC]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recommended Interventions</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Actionable multi-facility resource sharing and rotational staffing
        </p>
      </div>

      {/* Before / After Impact Card */}
      <BeforeAfterCard
        beforeCoverage={impactSummary.beforeCoverage}
        afterCoverage={impactSummary.afterCoverage}
        patientsProtected={impactSummary.patientsProtected}
        recoveryHours={impactSummary.recoveryHours}
        facilityName={impactSummary.facilityName}
        serviceName="Diagnostic Care"
      />

      {/* Interventions Queue */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase text-slate-500 font-mono tracking-wider">
          Action Queue ({interventions.length} Interventions)
        </h2>

        {interventions.map((intv) => {
          const isApproved = intv.status === 'APPROVED';
          const isRejected = intv.status === 'REJECTED';

          return (
            <div
              key={intv.id}
              className={`bg-white rounded-2xl border p-5 space-y-3 ${
                intv.isAiRecommended
                  ? 'border-blue-300 ring-1 ring-blue-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {intv.isAiRecommended && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono">
                      AI RECOMMENDED
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-slate-900">{intv.title}</h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {intv.distanceKm} km away &bull; ~{intv.recoveryTimeHours} hrs recovery
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{intv.reason}</p>

              {/* Action Bar & Quick Links */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Protects <strong>+{intv.affectedPatientsProtected} patients/day</strong></span>
                  <span>&bull;</span>
                  <Link
                    href={`/phcs/${intv.targetPHCId}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-0.5"
                  >
                    <span>Inspect Twin</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <span>&bull;</span>
                  <Link
                    href="/phcs"
                    className="text-slate-600 hover:text-slate-900 font-medium"
                  >
                    View Map
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  {!isApproved && !isRejected && intv.status !== 'EXECUTED' ? (
                    <>
                      <button
                        onClick={() => rejectIntervention(intv.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => approveIntervention(intv.id)}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                      >
                        Approve Intervention
                      </button>
                    </>
                  ) : isApproved ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Approved
                      </span>
                      <button
                        onClick={() => executeIntervention(intv.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all animate-pulse"
                      >
                        <span>🚀 Execute & Simulate Recovery</span>
                      </button>
                    </div>
                  ) : intv.status === 'EXECUTED' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-lg border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4" /> Live Deployment Restored
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                      <XCircle className="w-4 h-4" /> Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
