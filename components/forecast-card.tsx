'use client';

import React from 'react';
import { StockoutForecast } from '@/lib/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { AlertOctagon, TrendingDown, Package, Clock, ShieldCheck } from 'lucide-react';

interface ForecastCardProps {
  forecast: StockoutForecast;
  recentUsage: number[];
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast, recentUsage }) => {
  // Generate chart data combining past 7 days usage with projected next 7 days depletion
  const days = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today'];
  const futureDays = ['D+1', 'D+2', 'D+3', 'D+4', 'D+5', 'D+6', 'D+7'];

  let runningStock = forecast.currentStockUnits;
  const chartData = [
    ...recentUsage.map((val, idx) => ({
      day: days[idx] || `Day ${idx + 1}`,
      dailyConsumption: val,
      stockRemaining: null,
      type: 'historical',
    })),
  ];

  // Projected stock curve
  const projectionData = futureDays.map((fDay) => {
    runningStock = Math.max(0, runningStock - forecast.avgDailyUsage);
    return {
      day: fDay,
      dailyConsumption: forecast.avgDailyUsage,
      stockRemaining: Math.round(runningStock),
      type: 'projected',
    };
  });

  const fullData = [
    ...recentUsage.map((val, idx) => ({
      day: days[idx],
      dailyUsage: val,
      bufferLevel: null as number | null,
    })),
    {
      day: 'Today',
      dailyUsage: recentUsage[recentUsage.length - 1] || forecast.avgDailyUsage,
      bufferLevel: forecast.currentStockUnits,
    },
    ...projectionData.map((p) => ({
      day: p.day,
      dailyUsage: p.dailyConsumption,
      bufferLevel: p.stockRemaining,
    })),
  ];

  const isHighRisk = forecast.stockoutRiskLevel === 'HIGH';
  const isMedRisk = forecast.stockoutRiskLevel === 'MEDIUM';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-slate-900">
            Medicine Stock Runway & 7-Day Demand Forecast
          </h4>
        </div>

        <div>
          {isHighRisk ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              HIGH STOCK-OUT RISK
            </span>
          ) : isMedRisk ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
              MEDIUM DEPLETION RISK
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              STOCK BUFFER STABLE
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Metric summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500">Current Stock</div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {forecast.currentStockUnits}
              <span className="text-xs font-normal text-slate-500 ml-1">units</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500">Avg Daily Usage</div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {forecast.avgDailyUsage}
              <span className="text-xs font-normal text-slate-500 ml-1">u/day</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500">7-Day Projected Demand</div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {forecast.projected7DayDemand}
              <span className="text-xs font-normal text-slate-500 ml-1">units</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500">Runway Remaining</div>
            <div
              className={`text-xl font-bold font-mono ${
                isHighRisk ? 'text-rose-700' : isMedRisk ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              ~{forecast.daysOfStockRemaining}
              <span className="text-xs font-normal text-slate-500 ml-1">days</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="pt-2">
          <div className="text-xs font-medium text-slate-700 mb-2 flex items-center justify-between">
            <span>Projected Inventory Depletion Curve (Next 7 Days)</span>
            <span className="text-[11px] text-slate-500 italic">
              Critical Threshold: 50 units
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fullData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isHighRisk ? '#f43f5e' : '#3b82f6'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isHighRisk ? '#f43f5e' : '#3b82f6'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Stockout Buffer', fill: '#ef4444', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="bufferLevel"
                  stroke={isHighRisk ? '#e11d48' : '#2563eb'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#stockGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200">
          <strong>Early Warning Note: </strong>
          <span>{forecast.explanation}</span>
        </div>
      </div>
    </div>
  );
};
