'use client';

import React from 'react';
import { usePHC } from './phc-context';
import { X, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Sparkles, FileCheck2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const GuidedDemoModal: React.FC = () => {
  const router = useRouter();
  const {
    isGuidedDemoRunning,
    guidedDemoStep,
    setGuidedDemoStep,
    stopGuidedDemo,
    isTechnicianOutageSimulated,
    toggleTechnicianOutage,
    setSelectedPHCId,
    phcs,
  } = usePHC();

  if (!isGuidedDemoRunning) return null;

  const phcRampur = phcs.find((p) => p.id === 'phc-rampur');
  const diagStatus = phcRampur?.capabilities?.diagnostics.status || 'AVAILABLE';

  const steps = [
    {
      step: 1,
      title: '1. Baseline Facility Status',
      description:
        'PHC Rampur has diagnostic equipment, test reagents, electricity, and 1 on-duty lab technician. Diagnostic Service = AVAILABLE (GREEN).',
      actionLabel: 'Next: Simulate Staff Absence',
      onAction: () => {
        setSelectedPHCId('phc-rampur');
        setGuidedDemoStep(2);
      },
    },
    {
      step: 2,
      title: '2. Technician Takes Sudden Leave',
      description:
        'The lab technician is absent. A normal hospital dashboard says "Equipment Available: YES", but PHC-Twin correctly flags Diagnostic Service = UNAVAILABLE (RED).',
      actionLabel: 'Trigger Absence & Recalculate',
      onAction: () => {
        if (!isTechnicianOutageSimulated) {
          toggleTechnicianOutage();
        }
        setGuidedDemoStep(3);
      },
    },
    {
      step: 3,
      title: '3. Why is Diagnostics Down?',
      description:
        'PHC-Twin identifies the single failed prerequisite: Technician = 0. It automatically searches nearby facilities and finds PHC Sitapur Urban (5.2 km away) with 3 active technicians.',
      actionLabel: 'Inspect Facility & AI Recommendation',
      onAction: () => {
        router.push('/phcs/phc-rampur');
        setGuidedDemoStep(4);
      },
    },
    {
      step: 4,
      title: '4. Gemini AI Intervention & Impact',
      description:
        'Gemini formulates a 2-hour rotational staff dispatch from PHC Sitapur Urban. Once approved, district diagnostic coverage jumps from 52% to 81%, protecting 28 daily patients.',
      actionLabel: 'View Interventions & Complete Demo',
      onAction: () => {
        router.push('/interventions');
        setGuidedDemoStep(5);
      },
    },
    {
      step: 5,
      title: '5. Demo Complete',
      description:
        'PHC-Twin turned a hidden healthcare delivery failure into an actionable, rapid operational recovery.',
      actionLabel: 'Finish & Explore Platform',
      onAction: () => {
        stopGuidedDemo();
      },
    },
  ];

  const currentStep = steps[guidedDemoStep - 1] || steps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Demo Walkthrough: Step {guidedDemoStep} of {steps.length}
            </h3>
          </div>

          <button
            onClick={stopGuidedDemo}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <h4 className="text-base font-bold text-slate-900">{currentStep.title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed">{currentStep.description}</p>

          {guidedDemoStep === 2 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              Diagnostic Service Delivery will change to: <strong>UNAVAILABLE (RED)</strong>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (guidedDemoStep > 1) setGuidedDemoStep(guidedDemoStep - 1);
            }}
            disabled={guidedDemoStep === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30"
          >
            Previous
          </button>

          <button
            onClick={currentStep.onAction}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>{currentStep.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
