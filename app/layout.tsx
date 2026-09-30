import type { Metadata } from 'next';
import './globals.css';
import { PHCProvider } from '@/components/phc-context';
import { Navbar } from '@/components/navbar';
import { GuidedDemoModal } from '@/components/guided-demo-modal';
import { RecoveryToast } from '@/components/recovery-toast';

export const metadata: Metadata = {
  title: 'PHC-Twin | Healthcare Capability Intelligence Platform',
  description:
    'AI-powered Healthcare Capability Intelligence for India\'s Primary Health Centre Network. "From Resource Availability to Healthcare Capability."',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <PHCProvider>
          <Navbar />
          <GuidedDemoModal />
          <RecoveryToast />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <strong>PHC-Twin</strong> &mdash; Healthcare Capability Intelligence Platform for India & BRICS Resilience.
              </div>
              <div className="text-[11px] text-slate-400">
                Prototype uses synthetic operational telemetry data for demonstration purposes.
              </div>
            </div>
          </footer>
        </PHCProvider>
      </body>
    </html>
  );
}
