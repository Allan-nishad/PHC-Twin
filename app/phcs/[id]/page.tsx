'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePHC } from '@/components/phc-context';
import { StatusBadge } from '@/components/status-badge';
import { DependencyGraph } from '@/components/dependency-graph';
import { AIDecisionCard } from '@/components/ai-decision-card';
import { MapWrapper } from '@/components/map-wrapper';
import { VoiceAlertBroadcaster } from '@/components/voice-alert-broadcaster';
import { MultimodalRegisterScanner } from '@/components/multimodal-register-scanner';
import { findNearbyCapablePHCs } from '@/lib/calculations';
import { generateInterventionsForPHC } from '@/lib/intervention-engine';
import { ServiceId } from '@/lib/types';
import {
  Building2,
  MapPin,
  ArrowLeft,
  Stethoscope,
  HeartPulse,
  Microscope,
  Ambulance,
  BedDouble,
  ChevronDown,
  ChevronUp,
  Route,
  Camera,
  Volume2,
} from 'lucide-react';

export default function PHCDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const {
    phcs,
    toggleTechnicianOutage,
    isTechnicianOutageSimulated,
    toggleSupplyDelay,
    isSupplyDelaySimulated,
  } = usePHC();

  const phc = phcs.find((p) => p.id === id) || phcs[0];
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceId>('diagnostics');
  const [showRawResources, setShowRawResources] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [showScanner, setShowScanner] = useState<boolean>(true);

  const selectedCapability = phc.capabilities?.[selectedServiceId] || phc.capabilities?.diagnostics;
  const nearbyCapable = findNearbyCapablePHCs(phc, phcs, selectedServiceId, 60);
  const interventionsForService = generateInterventionsForPHC(phc, phcs, selectedServiceId);
  const primaryIntervention = interventionsForService[0];

  const nearbySummaries = nearbyCapable.map((n) => ({
    name: n.phc.name,
    distanceKm: n.distanceKm,
    hasTechnician: n.phc.resources.techniciansAvailable >= 1,
    techniciansAvailable: n.phc.resources.techniciansAvailable,
  }));

  const serviceIcons: Record<ServiceId, any> = {
    diagnostics: Microscope,
    emergency: Ambulance,
    maternal: HeartPulse,
    opd: Stethoscope,
    inpatient: BedDouble,
  };

  const serviceList: ServiceId[] = ['diagnostics', 'emergency', 'maternal', 'opd', 'inpatient'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 font-sans">
      {/* Back button */}
      <div>
        <Link
          href="/phcs"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to PHC Network</span>
        </Link>
      </div>

      {/* 1. FIRST: PHC Header (Name, Location, Overall Status) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{phc.name}</h1>
            <StatusBadge status={phc.statusSummary || 'AVAILABLE'} />
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {phc.district}, {phc.state} &bull; {phc.tier} ({phc.code})
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Service Coverage</div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {phc.overallCoveragePercentage}%
          </div>
        </div>
      </div>

      {/* Quick What-If Simulation Bar */}
      <div className="bg-slate-100/80 border border-slate-200/90 rounded-2xl p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>Live What-If Stress-Test:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {phc.id === 'phc-rampur' && (
            <button
              onClick={toggleTechnicianOutage}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                isTechnicianOutageSimulated
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm ring-2 ring-rose-400/30'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isTechnicianOutageSimulated ? '🔴 Outage: Tech Absent (0)' : 'Simulate Tech Absence'}
            </button>
          )}

          {phc.id === 'phc-lakshmipur' && (
            <button
              onClick={toggleSupplyDelay}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                isSupplyDelaySimulated
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isSupplyDelaySimulated ? '🟡 Delayed: 25% Stock' : 'Simulate Supply Delay'}
            </button>
          )}

          {phc.id !== 'phc-rampur' && phc.id !== 'phc-lakshmipur' && (
            <span className="text-[11px] text-slate-500 italic">
              All baseline dependencies satisfied for {phc.name}
            </span>
          )}
        </div>
      </div>

      {/* Multilingual Voice Broadcast Bar (Voice & Language Track) */}
      <VoiceAlertBroadcaster
        alertTextEnglish={`Emergency capability alert at ${phc.name}. Diagnostic testing offline.`}
        facilityName={phc.name}
        district={phc.district}
      />

      {/* 2. SECOND: 5 Service Capabilities */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
          Clinical Healthcare Services (Select to inspect)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {serviceList.map((sid) => {
            const cap = phc.capabilities?.[sid];
            const Icon = serviceIcons[sid];
            const isSelected = selectedServiceId === sid;

            return (
              <button
                key={sid}
                onClick={() => setSelectedServiceId(sid)}
                className={`p-3.5 rounded-xl border text-left transition-all space-y-2 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-600'}`} />
                  <StatusBadge status={cap?.status || 'AVAILABLE'} size="sm" showIcon={false} />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {cap?.serviceName.split('(')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. THIRD: "Why?" - Dependency Explanation for Selected Service */}
      {selectedCapability && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {selectedCapability.serviceName}
              </h3>
              <p className="text-xs text-slate-500">
                Prerequisite dependency evaluation
              </p>
            </div>
            <StatusBadge status={selectedCapability.status} />
          </div>

          <DependencyGraph capability={selectedCapability} />
        </div>
      )}

      {/* 4. FOURTH: "Recommended Intervention" - AI Recommendation */}
      {selectedCapability && (
        <AIDecisionCard
          phc={phc}
          serviceCapability={selectedCapability}
          nearbySummaries={nearbySummaries}
          existingIntervention={primaryIntervention}
        />
      )}

      {/* 5. Vision AI: Multimodal Paper Register Scanner (Vision & Multimodal Track) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <button
          onClick={() => setShowScanner(!showScanner)}
          className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-600" />
            <span>Gemini 1.5 Flash Vision &bull; Paper Stock Register Scanner (HMIS Form 5A)</span>
          </div>
          {showScanner ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showScanner && (
          <div className="p-3 bg-slate-950 border-t border-slate-200">
            <MultimodalRegisterScanner facilityName={phc.name} facilityId={phc.id} />
          </div>
        )}
      </div>

      {/* 5. Geographic Roadmap & Transit Corridors */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <button
          onClick={() => setShowMap(!showMap)}
          className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-blue-600" />
            <span>District Geographic Roadmap & Transit Corridors (NH-30 & SH-26)</span>
          </div>
          {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showMap && (
          <div className="p-3 bg-slate-950 border-t border-slate-200">
            <MapWrapper />
          </div>
        )}
      </div>

      {/* 6. Progressive Disclosure: Raw Physical Resources (Collapsible) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowRawResources(!showRawResources)}
          className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span>Raw Facility Inventory & Staff Counts</span>
          {showRawResources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRawResources && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Doctors on Duty</span>
              <span className="font-bold font-mono text-slate-900">
                {phc.resources.doctorsAvailable} of {phc.resources.doctorsTotal}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Nurses on Duty</span>
              <span className="font-bold font-mono text-slate-900">
                {phc.resources.nursesAvailable} of {phc.resources.nursesTotal}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Lab Technicians</span>
              <span className="font-bold font-mono text-slate-900">
                {phc.resources.techniciansAvailable} of {phc.resources.techniciansTotal}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Medicine Stock</span>
              <span className="font-bold font-mono text-slate-900">
                {phc.resources.medicineStockPercentage}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
