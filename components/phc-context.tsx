'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { PHC, Alert, InterventionOption, ServiceId } from '@/lib/types';
import { INITIAL_PHCS } from '@/lib/data';
import { calculatePHCCapabilities, calculateNetworkMetrics } from '@/lib/capability-engine';
import { generateSystemAlerts } from '@/lib/forecast-engine';
import { generateInterventionsForPHC } from '@/lib/intervention-engine';

interface PHCContextType {
  phcs: PHC[];
  selectedPHC: PHC;
  selectedPHCId: string;
  setSelectedPHCId: (id: string) => void;
  isTechnicianOutageSimulated: boolean;
  isSupplyDelaySimulated: boolean;
  toggleTechnicianOutage: () => void;
  toggleSupplyDelay: () => void;
  resetScenarios: () => void;
  networkMetrics: ReturnType<typeof calculateNetworkMetrics>;
  alerts: Alert[];
  interventions: InterventionOption[];
  approveIntervention: (id: string) => void;
  rejectIntervention: (id: string) => void;
  executeIntervention: (id: string) => void;
  activeRecoveryToast: string | null;
  dismissRecoveryToast: () => void;
  isGuidedDemoRunning: boolean;
  guidedDemoStep: number;
  startGuidedDemo: () => void;
  stopGuidedDemo: () => void;
  setGuidedDemoStep: (step: number) => void;
}

const PHCContext = createContext<PHCContextType | undefined>(undefined);

export function PHCProvider({ children }: { children: React.ReactNode }) {
  const [selectedPHCId, setSelectedPHCId] = useState<string>('phc-rampur');
  const [isTechnicianOutageSimulated, setIsTechnicianOutageSimulated] = useState<boolean>(false);
  const [isSupplyDelaySimulated, setIsSupplyDelaySimulated] = useState<boolean>(false);
  const [interventionStatuses, setInterventionStatuses] = useState<Record<string, 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED'>>({});
  const [activeRecoveryToast, setActiveRecoveryToast] = useState<string | null>(null);
  
  // Guided Demo State
  const [isGuidedDemoRunning, setIsGuidedDemoRunning] = useState<boolean>(false);
  const [guidedDemoStep, setGuidedDemoStep] = useState<number>(0);

  // Compute live PHC list based on active simulations
  const phcs = useMemo(() => {
    return INITIAL_PHCS.map((rawPhc) => {
      let phc = { ...rawPhc, resources: { ...rawPhc.resources } };

      // Scenario 1: Technician Outage at PHC Rampur
      if (phc.id === 'phc-rampur') {
        if (isTechnicianOutageSimulated) {
          phc.resources.techniciansAvailable = 0;
          phc.resources.operationalConfidenceScore = 91;
          phc.lastUpdated = 'Just now (Telemetry Alert)';
        }
      }

      // Scenario 2: Warehouse supply delay at PHC Lakshmipur
      if (phc.id === 'phc-lakshmipur') {
        if (isSupplyDelaySimulated) {
          phc.resources.medicineStockPercentage = 25;
          phc.resources.currentStockUnits = 45;
          phc.resources.essentialEmergencyDrugsAvailable = false;
          phc.lastUpdated = 'Just now (Warehouse Delayed)';
        }
      }

      return calculatePHCCapabilities(phc);
    });
  }, [isTechnicianOutageSimulated, isSupplyDelaySimulated]);

  const selectedPHC = useMemo(() => {
    return phcs.find((p) => p.id === selectedPHCId) || phcs[0];
  }, [phcs, selectedPHCId]);

  const networkMetrics = useMemo(() => {
    return calculateNetworkMetrics(phcs);
  }, [phcs]);

  const alerts = useMemo(() => {
    return generateSystemAlerts(phcs);
  }, [phcs]);

  // Generate interventions across all PHCs needing support
  const interventions = useMemo(() => {
    const list: InterventionOption[] = [];
    for (const phc of phcs) {
      if (phc.capabilities) {
        Object.entries(phc.capabilities).forEach(([sid, cap]) => {
          if (cap.status === 'UNAVAILABLE') {
            const intOptions = generateInterventionsForPHC(phc, phcs, sid as ServiceId);
            intOptions.forEach((opt) => {
              const currentStatus = interventionStatuses[opt.id] || opt.status;
              list.push({ ...opt, status: currentStatus });
            });
          }
        });
      }
    }

    // Default if no outage
    if (list.length === 0) {
      const defaultOpt = generateInterventionsForPHC(selectedPHC, phcs, 'diagnostics')[0];
      if (defaultOpt) {
        list.push({
          ...defaultOpt,
          status: interventionStatuses[defaultOpt.id] || 'PROPOSED',
        });
      }
    }

    return list;
  }, [phcs, selectedPHC, interventionStatuses]);

  const toggleTechnicianOutage = () => {
    setIsTechnicianOutageSimulated((prev) => !prev);
  };

  const toggleSupplyDelay = () => {
    setIsSupplyDelaySimulated((prev) => !prev);
  };

  const resetScenarios = () => {
    setIsTechnicianOutageSimulated(false);
    setIsSupplyDelaySimulated(false);
    setIsGuidedDemoRunning(false);
    setGuidedDemoStep(0);
    setInterventionStatuses({});
  };

  const approveIntervention = (id: string) => {
    setInterventionStatuses((prev) => ({ ...prev, [id]: 'APPROVED' }));
  };

  const rejectIntervention = (id: string) => {
    setInterventionStatuses((prev) => ({ ...prev, [id]: 'REJECTED' }));
  };

  const executeIntervention = (id: string) => {
    setInterventionStatuses((prev) => ({ ...prev, [id]: 'EXECUTED' }));
    setIsTechnicianOutageSimulated(false);
    setIsSupplyDelaySimulated(false);
    setActiveRecoveryToast(
      'Rotational Dispatch Executed: Lab Technician arrived from Sitapur Urban via NH-30. Diagnostics restored to 100% (+28 patients protected).'
    );
  };

  const dismissRecoveryToast = () => {
    setActiveRecoveryToast(null);
  };

  const startGuidedDemo = () => {
    resetScenarios();
    setSelectedPHCId('phc-rampur');
    setIsGuidedDemoRunning(true);
    setGuidedDemoStep(1);
  };

  const stopGuidedDemo = () => {
    setIsGuidedDemoRunning(false);
    setGuidedDemoStep(0);
  };

  return (
    <PHCContext.Provider
      value={{
        phcs,
        selectedPHC,
        selectedPHCId,
        setSelectedPHCId,
        isTechnicianOutageSimulated,
        isSupplyDelaySimulated,
        toggleTechnicianOutage,
        toggleSupplyDelay,
        resetScenarios,
        networkMetrics,
        alerts,
        interventions,
        approveIntervention,
        rejectIntervention,
        executeIntervention,
        activeRecoveryToast,
        dismissRecoveryToast,
        isGuidedDemoRunning,
        guidedDemoStep,
        startGuidedDemo,
        stopGuidedDemo,
        setGuidedDemoStep,
      }}
    >
      {children}
    </PHCContext.Provider>
  );
}

export function usePHC() {
  const context = useContext(PHCContext);
  if (!context) {
    throw new Error('usePHC must be used within a PHCProvider');
  }
  return context;
}
