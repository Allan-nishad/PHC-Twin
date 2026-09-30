import React from 'react';
import { ServiceCapabilityResult, ServiceDependency } from '@/lib/types';
import { CheckCircle2, XCircle, AlertCircle, Cpu, Users, Pill, Zap, Droplet } from 'lucide-react';

interface DependencyGraphProps {
  capability: ServiceCapabilityResult;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({ capability }) => {
  const getCategoryIcon = (category: ServiceDependency['category']) => {
    switch (category) {
      case 'EQUIPMENT':
        return <Cpu className="w-4 h-4" />;
      case 'STAFF':
        return <Users className="w-4 h-4" />;
      case 'SUPPLY':
        return <Pill className="w-4 h-4" />;
      case 'INFRASTRUCTURE':
        return <Zap className="w-4 h-4" />;
      default:
        return <Cpu className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Clinical Dependency Evaluation</h4>
          <p className="text-xs text-slate-500">
            {capability.dependencies.length} prerequisite systems evaluated deterministically
          </p>
        </div>
        <div className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-700">
          Capability Score: <span className="font-bold">{capability.score}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {capability.dependencies.map((dep) => {
          const isOk = dep.isAvailable;
          const isCrit = dep.isCritical;

          let cardBorder = 'border-slate-200 bg-white';
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;

          if (!isOk && isCrit) {
            cardBorder = 'border-rose-300 bg-rose-50/70 shadow-sm ring-1 ring-rose-300';
            icon = <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 animate-pulse" />;
          } else if (!isOk && !isCrit) {
            cardBorder = 'border-amber-300 bg-amber-50/60 shadow-sm';
            icon = <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
          }

          return (
            <div
              key={dep.id}
              className={`p-3.5 rounded-lg border text-left transition-all ${cardBorder}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-slate-100 text-slate-600">
                    {getCategoryIcon(dep.category)}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {dep.name}
                  </span>
                </div>
                {icon}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Current:</span>
                  <span
                    className={`font-mono font-medium ${
                      isOk ? 'text-slate-800' : isCrit ? 'text-rose-700 font-bold' : 'text-amber-700 font-bold'
                    }`}
                  >
                    {dep.currentValueDescription}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Required:</span>
                  <span className="text-slate-600 italic">{dep.requiredValueDescription}</span>
                </div>

                {!isOk && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-rose-800 bg-rose-100/50 p-1.5 rounded">
                    <strong>Impact:</strong> {dep.impactIfMissing}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {capability.status !== 'AVAILABLE' && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Root Cause Analysis: </strong>
            <span>{capability.rootCause}</span>
          </div>
        </div>
      )}
    </div>
  );
};
