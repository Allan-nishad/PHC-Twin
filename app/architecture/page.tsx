'use client';

import React from 'react';
import {
  Globe2,
  Server,
  Cpu,
  Layers,
  Shield,
  ArrowDown,
  Cloud,
  CheckCircle2,
  Info,
  Network,
  Share2,
  Lock,
} from 'lucide-react';

export default function ArchitecturePage() {
  const nodes = [
    { country: 'India Node', system: 'AB-HWC & IHIP PHC Network', facilities: '150,000+ Health Centres', color: 'border-orange-300 bg-orange-50/50 text-orange-950' },
    { country: 'Brazil Node', system: 'SUS Estratégia Saúde da Família', facilities: '43,000+ Unidades Básicas', color: 'border-emerald-300 bg-emerald-50/50 text-emerald-950' },
    { country: 'South Africa Node', system: 'National Health Insurance (NHI) Clinics', facilities: '3,800+ Primary Clinics', color: 'border-amber-300 bg-amber-50/50 text-amber-950' },
    { country: 'Other BRICS Nodes', system: 'Decentralized Community Health Nodes', facilities: 'Partner Health Systems', color: 'border-blue-300 bg-blue-50/50 text-blue-950' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <Globe2 className="w-3.5 h-3.5" />
          BRICS Resilience Track Theme
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Scale Architecture & Federated AI Blueprint
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Designing for India-scale deployment across 150,000+ PHCs and cross-border federated learning across BRICS health systems.
        </p>

        <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Architectural Transparency: </strong>
            <span>
              The current MVP implements deterministic capability evaluation and Google Gemini decision intelligence. The federated learning layer illustrated below represents our production architecture blueprint for multi-national health supply resilience without sharing raw patient or facility telemetry across sovereign borders.
            </span>
          </div>
        </div>
      </div>

      {/* Federated Learning Architecture Diagram */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Future Federated Learning Architecture (Privacy-Preserving)
            </h3>
            <p className="text-xs text-slate-500">
              Federated model weights exchange without centralizing sensitive sovereign health data
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-slate-100 text-slate-700">
            FedAvg + Differential Privacy
          </span>
        </div>

        {/* Nodes Grid */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Layer 1: Sovereign Edge Computing Nodes (National PHC Networks)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {nodes.map((node) => (
              <div
                key={node.country}
                className={`p-4 rounded-xl border ${node.color} space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{node.country}</span>
                  <Lock className="w-3.5 h-3.5 opacity-60" />
                </div>
                <div className="text-xs font-medium opacity-90">{node.system}</div>
                <div className="text-[11px] font-mono opacity-75">{node.facilities}</div>
                <div className="pt-2 border-t border-current/10 text-[10px] uppercase font-mono">
                  Local Model Weights Only &bull; Zero Raw Data Export
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Downward Arrow */}
        <div className="flex justify-center my-2">
          <div className="p-2 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>

        {/* Layer 2: Aggregator */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-bold">
                Layer 2: BRICS Federated Model Aggregator (Secure Enclave)
              </h4>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
              Confidential Space on GCP
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Aggregates supply demand gradients, epidemic velocity vectors, and resource degradation weights from sovereign nodes using cryptographically verified Federated Averaging (FedAvg).
          </p>
        </div>

        {/* Downward Arrow */}
        <div className="flex justify-center my-2">
          <div className="p-2 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>

        {/* Layer 3: Improved Global Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Layer 3: Global Capability & Resilience Model</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Synthesized global predictive model capable of anticipating supply chain bottlenecks 14-21 days in advance with high cross-climate robustness.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Layer 4: Continuous Edge Deployment</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Updated weights dispatched back to national health cloud runtimes for local offline decision support.
            </p>
          </div>
        </div>
      </div>

      {/* Google Cloud Enterprise Tech Stack */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Google Cloud Enterprise Architecture Blueprint
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-blue-600" />
              Google Cloud Run
            </div>
            <p className="text-slate-600">
              Serverless auto-scaling microservices serving Next.js App Router and API endpoints with zero cold start latency.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-600" />
              Vertex AI & Gemini 1.5
            </div>
            <p className="text-slate-600">
              Operational reasoning, multi-facility trade-off evaluation, and structured JSON capability synthesis.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              Google BigQuery
            </div>
            <p className="text-slate-600">
              Petabyte-scale analytics warehouse for nationwide longitudinal stock-out forecasting and epidemiologic correlations.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-emerald-600" />
              Google Maps Platform
            </div>
            <p className="text-slate-600">
              Distance Matrix API and Route Optimization for inter-facility staff and medicine courier dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
