'use client';

import React, { useState } from 'react';
import { Camera, FileText, Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight, RefreshCw, Eye } from 'lucide-react';
import { usePHC } from './phc-context';

interface MultimodalRegisterScannerProps {
  facilityName: string;
  facilityId: string;
}

export const MultimodalRegisterScanner: React.FC<MultimodalRegisterScannerProps> = ({
  facilityName,
  facilityId,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [isSynced, setIsSynced] = useState<boolean>(false);

  const handleScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    setIsSynced(false);

    try {
      const res = await fetch('/api/gemini/scan-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName,
          sampleType: 'HMIS_FORM_5A',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSyncToTwin = () => {
    setIsSynced(true);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden font-sans">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Camera className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Gemini 1.5 Flash Multimodal Paper Ledger Auditor
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Vision AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Digitizing physical paper stock registers (HMIS Form 5A) to eliminate &quot;Phantom Inventory&quot;
            </p>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Auditing Paper Register with Gemini Vision...</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Scan Physical Paper Ledger</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Paper Register Preview + Extracted Discrepancy Matrix */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Physical Paper Ledger Simulation */}
        <div className="md:col-span-5 bg-amber-50 rounded-2xl p-4 text-slate-900 border border-amber-200 shadow-inner font-mono text-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-300/80 pb-2">
            <div className="font-bold text-[11px] text-amber-950 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-800" />
              <span>HMIS FORM 5A: DAILY STOCK REGISTER</span>
            </div>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
              PHYSICAL SHEET
            </span>
          </div>

          <div className="space-y-2 text-[11px] text-slate-800">
            <div className="p-2 bg-white/80 rounded border border-amber-200 space-y-1">
              <div className="text-slate-500 text-[10px]">FACILITY & DATE:</div>
              <div className="font-bold">{facilityName} &bull; Sitapur District</div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between border-b border-amber-200 py-1">
                <span>1. Reagent Diluent (Vials):</span>
                <strong className="text-rose-700 bg-rose-100 px-1.5 rounded font-extrabold">
                  0 (EXHAUSTED)
                </strong>
              </div>
              <div className="flex justify-between border-b border-amber-200 py-1">
                <span>2. Dengue NS1 Rapid Kits:</span>
                <strong className="text-amber-800 bg-amber-100 px-1.5 rounded">4 units</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>3. Oxytocin 10 IU Injection:</span>
                <strong className="text-emerald-800 bg-emerald-100 px-1.5 rounded">22 units</strong>
              </div>
            </div>

            <div className="p-2 rounded bg-amber-100/70 border border-amber-300/60 text-[10px] text-amber-900 italic">
              Pharmacist Note: &quot;Auto-analyzer diluent empty since 08:30 AM. Blood tests stopped. Emergency stock request pending.&quot;
            </div>
          </div>
        </div>

        {/* Right Side: Gemini Vision Extracted Discrepancies */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          {!scanResult && !isScanning && (
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center space-y-3 flex flex-col items-center justify-center h-full">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
              <div className="text-xs font-bold text-slate-200">
                Detect &quot;Phantom Inventory&quot; with Gemini 1.5 Flash Vision
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Rural PHCs often suffer when district servers show stock available, but physical shelves are empty. Click <strong>Scan Physical Paper Ledger</strong> to cross-verify.
              </p>
            </div>
          )}

          {scanResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-indigo-300 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gemini Vision Audit Extraction</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Confidence: {scanResult.aiConfidenceScore}%
                </span>
              </div>

              {/* Discrepancy Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-2 text-center">Paper Count</th>
                      <th className="py-2 px-2 text-center">Digital Count</th>
                      <th className="py-2 px-3">Audit Discrepancy Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-[11px]">
                    {scanResult.extractedItems?.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-slate-200">
                          {item.item}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-rose-400 font-mono">
                          {item.handwrittenPhysicalCount}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-slate-400 font-mono">
                          {item.electronicLedgerCount}
                        </td>
                        <td className="py-2 px-3">
                          {item.discrepancyStatus === 'CRITICAL_DISCREPANCY' ? (
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Phantom Inventory (Empty)
                            </span>
                          ) : item.discrepancyStatus === 'LOW_STOCK_WARNING' ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Low Stock (4 left)
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized OK
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action sync button */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Root Cause: <strong className="text-slate-200">{scanResult.rootCauseIdentified}</strong>
                </div>

                {!isSynced ? (
                  <button
                    onClick={handleSyncToTwin}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <span>⚡ Synchronize & Correct Digital Twin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Digital Twin Synchronized &bull; Zero Phantom Inventory
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
