'use client';

import React from 'react';
import { usePHC } from './phc-context';
import { Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const RecoveryToast: React.FC = () => {
  const { activeRecoveryToast, dismissRecoveryToast, selectedPHCId } = usePHC();

  if (!activeRecoveryToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-emerald-500/50 shadow-2xl flex items-start gap-3 backdrop-blur-xl ring-2 ring-emerald-500/20">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
              Operational Recovery Complete
            </span>
            <button
              onClick={dismissRecoveryToast}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-snug">{activeRecoveryToast}</p>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href="/phcs"
              onClick={dismissRecoveryToast}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300"
            >
              <span>View Updated Network Map</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <button
              onClick={dismissRecoveryToast}
              className="text-[10px] text-slate-400 hover:text-slate-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
