'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Play, RotateCcw } from 'lucide-react';
import { usePHC } from './phc-context';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isTechnicianOutageSimulated, isSupplyDelaySimulated, resetScenarios, startGuidedDemo } = usePHC();

  const navItems = [
    { href: '/', label: 'Overview' },
    { href: '/phcs', label: 'PHC Network' },
    { href: '/alerts', label: 'Alerts' },
    { href: '/interventions', label: 'Interventions' },
  ];

  const hasActiveSim = isTechnicianOutageSimulated || isSupplyDelaySimulated;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Name */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight">PHC-Twin</span>
              <span className="text-xs text-slate-500 hidden sm:inline ml-2 border-l border-slate-200 pl-2">
                Healthcare Capability Intelligence
              </span>
            </div>
          </Link>

          {/* Simple Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Demo Actions */}
          <div className="flex items-center gap-2">
            {hasActiveSim ? (
              <button
                onClick={resetScenarios}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Demo</span>
              </button>
            ) : (
              <button
                onClick={startGuidedDemo}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Demo Scenario</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
