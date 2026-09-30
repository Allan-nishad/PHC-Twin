import { PHC, PHCResources, ServiceCapabilityResult, ServiceDependency, ServiceId, CapabilityStatus } from './types';
import { SERVICES_CONFIG } from './data';

/**
 * Evaluates the capability of a specific service at a PHC based on explicit resource dependencies.
 * Deterministic, reproducible, and explainable.
 */
export function evaluateServiceCapability(
  serviceId: ServiceId,
  resources: PHCResources
): ServiceCapabilityResult {
  const serviceDef = SERVICES_CONFIG[serviceId];
  const dependencies: ServiceDependency[] = [];

  const hasPower = resources.powerGridAvailable || resources.powerBackupAvailable;

  switch (serviceId) {
    case 'diagnostics': {
      // Diagnostic Equipment
      dependencies.push({
        id: 'diag-equipment',
        name: 'Diagnostic Equipment Functional',
        category: 'EQUIPMENT',
        isCritical: true,
        isAvailable: resources.diagnosticEquipmentFunctional,
        currentValueDescription: resources.diagnosticEquipmentFunctional ? 'Functional' : 'Malfunctioning / Offline',
        requiredValueDescription: 'Hematology & rapid testing units online',
        impactIfMissing: 'Diagnostic testing cannot be executed on hardware.',
      });

      // Technician
      const techOk = resources.techniciansAvailable >= 1;
      dependencies.push({
        id: 'diag-technician',
        name: 'Trained Diagnostic Lab Technician',
        category: 'STAFF',
        isCritical: true,
        isAvailable: techOk,
        currentValueDescription: `${resources.techniciansAvailable} of ${resources.techniciansTotal} on duty`,
        requiredValueDescription: 'At least 1 qualified lab technician present',
        impactIfMissing: 'Equipment cannot be operated safely or results analyzed.',
      });

      // Reagents
      dependencies.push({
        id: 'diag-reagents',
        name: 'Diagnostic Testing Reagents & Kits',
        category: 'SUPPLY',
        isCritical: true,
        isAvailable: resources.diagnosticReagentsAvailable,
        currentValueDescription: resources.diagnosticReagentsAvailable ? 'In Stock' : 'Depleted',
        requiredValueDescription: 'Test kits & reagents available',
        impactIfMissing: 'Tests cannot be run without chemical consumables.',
      });

      // Power
      dependencies.push({
        id: 'diag-power',
        name: 'Continuous Power (Grid or Generator)',
        category: 'INFRASTRUCTURE',
        isCritical: true,
        isAvailable: hasPower,
        currentValueDescription: hasPower
          ? resources.powerGridAvailable ? 'Main Grid Active' : 'Backup Generator Active'
          : 'Total Power Failure',
        requiredValueDescription: 'Active electrical supply for analyzers and centrifuge',
        impactIfMissing: 'Lab hardware cannot power on.',
      });

      // Cold Chain (non-critical warning)
      dependencies.push({
        id: 'diag-cold-chain',
        name: 'Cold Chain Storage for Reagents',
        category: 'INFRASTRUCTURE',
        isCritical: false,
        isAvailable: resources.coldChainFunctional,
        currentValueDescription: resources.coldChainFunctional ? 'Optimal Temp (2-8°C)' : 'Compromised Temp',
        requiredValueDescription: 'Functional refrigerator for reagent preservation',
        impactIfMissing: 'Reagent shelf-life rapidly deteriorating.',
      });

      break;
    }

    case 'opd': {
      const docOk = resources.doctorsAvailable >= 1;
      dependencies.push({
        id: 'opd-doctor',
        name: 'Medical Officer (Doctor) On-Duty',
        category: 'STAFF',
        isCritical: true,
        isAvailable: docOk,
        currentValueDescription: `${resources.doctorsAvailable} of ${resources.doctorsTotal} doctors present`,
        requiredValueDescription: 'Minimum 1 general medical officer',
        impactIfMissing: 'Clinical diagnosis and prescriptions cannot be legally issued.',
      });

      dependencies.push({
        id: 'opd-equipment',
        name: 'General Examination Equipment',
        category: 'EQUIPMENT',
        isCritical: true,
        isAvailable: resources.generalEquipmentFunctional,
        currentValueDescription: resources.generalEquipmentFunctional ? 'Functional' : 'Damaged / Missing',
        requiredValueDescription: 'Stethoscope, BP apparatus, weighing scale, thermometer',
        impactIfMissing: 'Basic patient vitals cannot be assessed.',
      });

      dependencies.push({
        id: 'opd-power',
        name: 'Operational Power Supply',
        category: 'INFRASTRUCTURE',
        isCritical: true,
        isAvailable: hasPower,
        currentValueDescription: hasPower ? 'Active' : 'No Power',
        requiredValueDescription: 'Lighting and clinic airflow',
        impactIfMissing: 'Consultation rooms dark and non-operational.',
      });

      const medCritical = resources.medicineStockPercentage >= 30;
      dependencies.push({
        id: 'opd-medicine',
        name: 'Essential Outpatient Formulary Stock',
        category: 'SUPPLY',
        isCritical: true,
        isAvailable: medCritical,
        currentValueDescription: `${resources.medicineStockPercentage}% formulary availability`,
        requiredValueDescription: 'Minimum 30% baseline essential medication stock',
        impactIfMissing: 'Patients cannot be dispensed prescribed treatments.',
      });

      const waterOk = resources.waterSupplyAvailable;
      dependencies.push({
        id: 'opd-water',
        name: 'Potable Running Water',
        category: 'INFRASTRUCTURE',
        isCritical: false,
        isAvailable: waterOk,
        currentValueDescription: waterOk ? 'Available' : 'Interrupted',
        requiredValueDescription: 'Handwashing and sanitation',
        impactIfMissing: 'Hygiene standards compromised; high infection risk.',
      });

      break;
    }

    case 'maternal': {
      const staffOk = resources.doctorsAvailable >= 1 || resources.nursesAvailable >= 1;
      dependencies.push({
        id: 'mat-staff',
        name: 'Skilled Birth Attendant / Doctor / Staff Nurse',
        category: 'STAFF',
        isCritical: true,
        isAvailable: staffOk,
        currentValueDescription: `${resources.nursesAvailable} nurses, ${resources.doctorsAvailable} doctors on duty`,
        requiredValueDescription: 'At least 1 qualified nurse or doctor',
        impactIfMissing: 'Deliveries cannot be assisted safely.',
      });

      dependencies.push({
        id: 'mat-equipment',
        name: 'Maternal & Neonatal Care Kit',
        category: 'EQUIPMENT',
        isCritical: true,
        isAvailable: resources.maternalEquipmentFunctional,
        currentValueDescription: resources.maternalEquipmentFunctional ? 'Functional radiant warmer & delivery kit' : 'Equipment offline',
        requiredValueDescription: 'Labor table, suction apparatus, radiant warmer',
        impactIfMissing: 'Neonatal resuscitation and aseptic delivery impossible.',
      });

      dependencies.push({
        id: 'mat-drugs',
        name: 'Maternal Emergency Medications (Oxytocin/Magnesium)',
        category: 'SUPPLY',
        isCritical: true,
        isAvailable: resources.maternalDrugsAvailable,
        currentValueDescription: resources.maternalDrugsAvailable ? 'In Stock' : 'Depleted',
        requiredValueDescription: 'Uterotonics and anti-hypertensives',
        impactIfMissing: 'Postpartum hemorrhage and eclampsia cannot be managed.',
      });

      dependencies.push({
        id: 'mat-power',
        name: 'Continuous Power for Radiant Warmer',
        category: 'INFRASTRUCTURE',
        isCritical: true,
        isAvailable: hasPower,
        currentValueDescription: hasPower ? 'Active' : 'No Power',
        requiredValueDescription: 'Uninterrupted power for newborn warmers',
        impactIfMissing: 'Risk of neonatal hypothermia.',
      });

      dependencies.push({
        id: 'mat-water',
        name: 'Sterile Water Supply for Labor Room',
        category: 'INFRASTRUCTURE',
        isCritical: true,
        isAvailable: resources.waterSupplyAvailable,
        currentValueDescription: resources.waterSupplyAvailable ? 'Active' : 'Unavailable',
        requiredValueDescription: 'Sanitary delivery suite running water',
        impactIfMissing: 'Maternal sepsis prevention protocol breached.',
      });

      dependencies.push({
        id: 'mat-cold-chain',
        name: 'Vaccine Cold Chain for Birth Doses',
        category: 'INFRASTRUCTURE',
        isCritical: false,
        isAvailable: resources.coldChainFunctional,
        currentValueDescription: resources.coldChainFunctional ? 'Functional' : 'Degraded',
        requiredValueDescription: 'BCG, OPV-0, Hep-B birth dose storage',
        impactIfMissing: 'Neonatal immunization cannot be completed at discharge.',
      });

      break;
    }

    case 'emergency': {
      const docOk = resources.doctorsAvailable >= 1;
      dependencies.push({
        id: 'emg-doctor',
        name: 'Emergency Medical Officer',
        category: 'STAFF',
        isCritical: true,
        isAvailable: docOk,
        currentValueDescription: `${resources.doctorsAvailable} doctor(s) on-site`,
        requiredValueDescription: 'At least 1 qualified physician',
        impactIfMissing: 'Trauma triage and acute resuscitation decisions cannot proceed.',
      });

      const nurseOk = resources.nursesAvailable >= 1;
      dependencies.push({
        id: 'emg-nurse',
        name: 'Emergency Staff Nurse',
        category: 'STAFF',
        isCritical: true,
        isAvailable: nurseOk,
        currentValueDescription: `${resources.nursesAvailable} nurse(s) on-site`,
        requiredValueDescription: 'At least 1 emergency care nurse',
        impactIfMissing: 'Cannot establish IV lines, administer stat meds, or monitor vitals.',
      });

      dependencies.push({
        id: 'emg-equipment',
        name: 'Emergency Stabilization Equipment',
        category: 'EQUIPMENT',
        isCritical: true,
        isAvailable: resources.emergencyEquipmentFunctional,
        currentValueDescription: resources.emergencyEquipmentFunctional ? 'Functional O2, defibrillator, suction' : 'Equipment failure',
        requiredValueDescription: 'Oxygen delivery, suction machine, crash cart',
        impactIfMissing: 'Acute respiratory and cardiac stabilization impossible.',
      });

      dependencies.push({
        id: 'emg-drugs',
        name: 'Essential Emergency Crash Cart Drugs',
        category: 'SUPPLY',
        isCritical: true,
        isAvailable: resources.essentialEmergencyDrugsAvailable,
        currentValueDescription: resources.essentialEmergencyDrugsAvailable ? 'Stocked' : 'Stockout',
        requiredValueDescription: 'Adrenaline, Atropine, IV fluids, analgesics',
        impactIfMissing: 'Life-saving pharmacology unavailable during golden hour.',
      });

      dependencies.push({
        id: 'emg-power',
        name: 'High-Reliability Power & Lighting',
        category: 'INFRASTRUCTURE',
        isCritical: true,
        isAvailable: hasPower,
        currentValueDescription: hasPower ? 'Active' : 'Blackout',
        requiredValueDescription: 'Uninterrupted power for suction & monitor',
        impactIfMissing: 'Emergency care in darkness is hazardous.',
      });

      const bedsFree = resources.bedsTotal - resources.bedsOccupied;
      dependencies.push({
        id: 'emg-beds',
        name: 'Stabilization Bed Availability',
        category: 'INFRASTRUCTURE',
        isCritical: false,
        isAvailable: bedsFree > 0,
        currentValueDescription: `${bedsFree} of ${resources.bedsTotal} beds vacant`,
        requiredValueDescription: 'At least 1 triage observation bed',
        impactIfMissing: 'Emergency admissions must be stabilized on transit stretchers.',
      });

      break;
    }

    case 'inpatient': {
      const bedsFree = resources.bedsTotal - resources.bedsOccupied;
      dependencies.push({
        id: 'inp-beds',
        name: 'Inpatient Bed Capacity',
        category: 'INFRASTRUCTURE',
        isCritical: true,
        isAvailable: bedsFree > 0,
        currentValueDescription: `${bedsFree} free beds (${resources.bedsOccupied}/${resources.bedsTotal} occupied)`,
        requiredValueDescription: 'At least 1 vacant ward bed',
        impactIfMissing: 'Facility cannot admit new short-stay observation patients.',
      });

      const nurseOk = resources.nursesAvailable >= 1;
      dependencies.push({
        id: 'inp-nurses',
        name: 'Ward Nursing Staff',
        category: 'STAFF',
        isCritical: true,
        isAvailable: nurseOk,
        currentValueDescription: `${resources.nursesAvailable} nurse(s) on shift`,
        requiredValueDescription: 'Minimum 1 nurse per shift for ward rounds',
        impactIfMissing: 'Continuous inpatient monitoring cannot be maintained.',
      });

      const docOk = resources.doctorsAvailable >= 1;
      dependencies.push({
        id: 'inp-doctor',
        name: 'Attending Medical Officer',
        category: 'STAFF',
        isCritical: true,
        isAvailable: docOk,
        currentValueDescription: `${resources.doctorsAvailable} doctor(s) present`,
        requiredValueDescription: 'Attending doctor for daily ward rounds',
        impactIfMissing: 'Inpatients cannot be clinically reviewed or discharged.',
      });

      dependencies.push({
        id: 'inp-power',
        name: 'Ward Power & Ventilation',
        category: 'INFRASTRUCTURE',
        isCritical: true,
        isAvailable: hasPower,
        currentValueDescription: hasPower ? 'Active' : 'No Power',
        requiredValueDescription: 'Ward fans, lighting, medical devices',
        impactIfMissing: 'Ward conditions intolerable for admitted patients.',
      });

      dependencies.push({
        id: 'inp-water',
        name: 'Sanitary Water & Hygiene',
        category: 'INFRASTRUCTURE',
        isCritical: true,
        isAvailable: resources.waterSupplyAvailable,
        currentValueDescription: resources.waterSupplyAvailable ? 'Active' : 'No Water',
        requiredValueDescription: 'Ward sanitation and washrooms',
        impactIfMissing: 'Inpatient hygiene failure and infection vector risk.',
      });

      break;
    }
  }

  // Evaluate critical vs warning failures
  const failedCritical = dependencies.filter((d) => d.isCritical && !d.isAvailable);
  const warningDeps = dependencies.filter((d) => !d.isCritical && !d.isAvailable);

  let status: CapabilityStatus = 'AVAILABLE';
  let score = 100;
  let explanation = `${serviceDef.name} is fully operational with all required clinical dependencies satisfied.`;
  let rootCause = 'All operational prerequisites satisfied.';
  let bottleneck: string | null = null;

  if (failedCritical.length > 0) {
    status = 'UNAVAILABLE';
    const primaryFailure = failedCritical[0];
    score = Math.max(0, Math.round(25 - failedCritical.length * 5));
    rootCause = primaryFailure.impactIfMissing;
    bottleneck = primaryFailure.name;
    explanation = `Service is UNAVAILABLE because critical dependency [${primaryFailure.name}] is missing: ${primaryFailure.currentValueDescription}. ${primaryFailure.impactIfMissing}`;
  } else if (warningDeps.length > 0 || resources.medicineStockPercentage < 60) {
    status = 'LIMITED';
    score = Math.max(45, Math.round(75 - warningDeps.length * 10 - (100 - resources.medicineStockPercentage) * 0.2));
    const firstWarning = warningDeps[0];
    if (firstWarning) {
      bottleneck = firstWarning.name;
      rootCause = `Constrained by non-critical dependency: ${firstWarning.name} (${firstWarning.currentValueDescription}).`;
      explanation = `Service is LIMITED: ${rootCause} Effective throughput is reduced.`;
    } else {
      bottleneck = 'Medicine Stock Depletion';
      rootCause = `Medicine stock at ${resources.medicineStockPercentage}% restricts continuous dispensing.`;
      explanation = `Service is LIMITED due to low medicine stock (${resources.medicineStockPercentage}%).`;
    }
  }

  // Calculate effective capacity in patients supported per day
  let effectiveCapacityPatients = 0;
  if (status === 'AVAILABLE') {
    if (serviceId === 'opd') {
      effectiveCapacityPatients = Math.round(resources.doctorsAvailable * 35 * (resources.medicineStockPercentage / 100));
    } else if (serviceId === 'diagnostics') {
      effectiveCapacityPatients = Math.round(resources.techniciansAvailable * 28);
    } else if (serviceId === 'maternal') {
      effectiveCapacityPatients = Math.round(resources.nursesAvailable * 6 + resources.doctorsAvailable * 4);
    } else if (serviceId === 'emergency') {
      effectiveCapacityPatients = Math.round(resources.doctorsAvailable * 8 + resources.nursesAvailable * 6);
    } else if (serviceId === 'inpatient') {
      const freeBeds = Math.max(0, resources.bedsTotal - resources.bedsOccupied);
      effectiveCapacityPatients = Math.min(freeBeds, resources.nursesAvailable * 4);
    }
  } else if (status === 'LIMITED') {
    if (serviceId === 'opd') {
      effectiveCapacityPatients = Math.round(resources.doctorsAvailable * 18 * (resources.medicineStockPercentage / 100));
    } else if (serviceId === 'diagnostics') {
      effectiveCapacityPatients = Math.round(resources.techniciansAvailable * 12);
    } else if (serviceId === 'maternal') {
      effectiveCapacityPatients = Math.round(resources.nursesAvailable * 3);
    } else if (serviceId === 'emergency') {
      effectiveCapacityPatients = Math.round(resources.doctorsAvailable * 4);
    } else if (serviceId === 'inpatient') {
      const freeBeds = Math.max(0, resources.bedsTotal - resources.bedsOccupied);
      effectiveCapacityPatients = Math.min(Math.floor(freeBeds / 2), resources.nursesAvailable * 2);
    }
  } else {
    // UNAVAILABLE
    effectiveCapacityPatients = 0;
  }

  return {
    serviceId,
    serviceName: serviceDef.name,
    status,
    score,
    effectiveCapacityPatients,
    dependencies,
    failedCriticalDependencies: failedCritical,
    warningDependencies: warningDeps,
    explanation,
    rootCause,
    bottleneck,
  };
}

/**
 * Calculates capability results for all 5 services for a given PHC.
 */
export function calculatePHCCapabilities(phc: PHC): PHC {
  const serviceIds: ServiceId[] = ['opd', 'maternal', 'diagnostics', 'emergency', 'inpatient'];
  const capabilities: Record<ServiceId, ServiceCapabilityResult> = {} as any;

  let totalScore = 0;
  let totalEffectivePatients = 0;
  let unavailCount = 0;
  let limitedCount = 0;

  for (const sid of serviceIds) {
    const result = evaluateServiceCapability(sid, phc.resources);
    capabilities[sid] = result;
    totalScore += result.score;
    totalEffectivePatients += result.effectiveCapacityPatients;
    if (result.status === 'UNAVAILABLE') unavailCount++;
    else if (result.status === 'LIMITED') limitedCount++;
  }

  const overallCoverage = Math.round(totalScore / serviceIds.length);

  let statusSummary: CapabilityStatus = 'AVAILABLE';
  if (unavailCount >= 2 || capabilities.emergency.status === 'UNAVAILABLE') {
    statusSummary = 'UNAVAILABLE';
  } else if (unavailCount > 0 || limitedCount > 0) {
    statusSummary = 'LIMITED';
  }

  return {
    ...phc,
    capabilities,
    overallCoveragePercentage: overallCoverage,
    effectiveDailyCapacity: totalEffectivePatients,
    statusSummary,
  };
}

/**
 * Calculate network-wide capability metrics across a collection of PHCs.
 */
export function calculateNetworkMetrics(phcs: PHC[]) {
  const enriched = phcs.map((p) => calculatePHCCapabilities(p));
  const total = enriched.length;

  const availableCount = enriched.filter((p) => p.statusSummary === 'AVAILABLE').length;
  const limitedCount = enriched.filter((p) => p.statusSummary === 'LIMITED').length;
  const criticalCount = enriched.filter((p) => p.statusSummary === 'UNAVAILABLE').length;

  const avgCoverage = Math.round(
    enriched.reduce((acc, p) => acc + (p.overallCoveragePercentage || 0), 0) / (total || 1)
  );

  const totalEffectiveDailyPatients = enriched.reduce(
    (acc, p) => acc + (p.effectiveDailyCapacity || 0),
    0
  );

  // Diagnostic specific coverage
  const diagAvailableCount = enriched.filter(
    (p) => p.capabilities?.diagnostics.status === 'AVAILABLE'
  ).length;
  const diagCoverage = Math.round((diagAvailableCount / total) * 100);

  return {
    totalPHCs: total,
    availableCount,
    limitedCount,
    criticalCount,
    avgCoverage,
    totalEffectiveDailyPatients,
    diagCoverage,
    enrichedPHCs: enriched,
  };
}
