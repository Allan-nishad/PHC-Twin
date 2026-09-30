'use client';

import React from 'react';
import { usePHC } from './phc-context';
import { CheckCircle2, XCircle, ArrowRight, ArrowDown } from 'lucide-react';

export const ConceptVisual: React.FC = () => {
  const { isTechnicianOutageSimulated, toggleTechnicianOutage } = usePHC();

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs font-mono text-slate-500">
          The Core Idea: Resource Availability ≠ Healthcare Capability
        </h3>
        <button
          onClick={toggleTechnicianOutage}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline text-left sm:text-right"
        >
          {isTechnicianOutageSimulated ? 'Reset Example' : 'Simulate Technician Absence in this example'}
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Traditional Dashboard */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase">
            Traditional Hospital Dashboard
          </div>
          <div className="text-sm text-slate-700 font-medium">
            Reports only physical inventory:
          </div>
          <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span>Diagnostic Analyzer Machine:</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Available
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Electricity & Power:</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Available
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">
            Looks 100% fine on paper, but ignores missing human dependencies.
          </p>
        </div>

        {/* Right: PHC-Twin Capability Engine */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-blue-700 uppercase">
            PHC-Twin Capability Engine
          </div>
          <div className="text-sm text-slate-700 font-medium">
            Evaluates clinical delivery prerequisites:
          </div>

          <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span>Equipment ✓ &bull; Power ✓ &bull; Reagents ✓</span>
              <span className="text-slate-600 font-medium">Prerequisites</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span>Trained Diagnostic Technician:</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  isTechnicianOutageSimulated
                    ? 'text-rose-700 font-bold'
                    : 'text-emerald-700'
                }`}
              >
                {isTechnicianOutageSimulated ? (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> Unavailable (On Leave)
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Available
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Resulting Capability */}
          <div
            className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
              isTechnicianOutageSimulated
                ? 'bg-rose-50 text-rose-900 border border-rose-200'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            }`}
          >
            <span>Diagnostic Service Delivery:</span>
            <span className="font-bold">
              {isTechnicianOutageSimulated ? '🔴 UNAVAILABLE (0%)' : '🟢 AVAILABLE (100%)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
