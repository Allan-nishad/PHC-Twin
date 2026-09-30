'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Route } from 'lucide-react';

const RealDistrictMapClient = dynamic(
  () => import('./real-district-map').then((mod) => mod.RealDistrictMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 min-h-[480px] flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center animate-pulse">
          <Route className="w-6 h-6 text-blue-400" />
        </div>
        <div className="text-sm font-bold text-white">Loading Real Geographic Highway Map...</div>
        <div className="text-xs text-slate-400 max-w-sm">
          Fetching OpenStreetMap tiles, Sitapur highway corridors (NH-30 & SH-26), and live facility GPS coordinates...
        </div>
      </div>
    ),
  }
);

export const MapWrapper: React.FC = () => {
  return <RealDistrictMapClient />;
};
