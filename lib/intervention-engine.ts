import { PHC, InterventionOption, ServiceId } from './types';
import { calculateHaversineDistance, findNearbyCapablePHCs } from './calculations';

/**
 * Evaluates and ranks deterministic intervention options for a PHC experiencing service failure.
 */
export function generateInterventionsForPHC(
  targetPHC: PHC,
  allPHCs: PHC[],
  failedServiceId: ServiceId
): InterventionOption[] {
  const interventions: InterventionOption[] = [];

  const nearby = findNearbyCapablePHCs(targetPHC, allPHCs, failedServiceId, 60);

  if (failedServiceId === 'diagnostics') {
    // Find best donor with spare technician
    const bestDonor = nearby.find((n) => n.spareTechnicians > 0) || nearby[0];

    if (bestDonor) {
      // 1. Staff Reassignment (Rotational)
      interventions.push({
        id: `int-reassign-${targetPHC.id}-${bestDonor.phc.id}`,
        title: `Rotational Staff Reassignment: Lab Technician from ${bestDonor.phc.name}`,
        type: 'STAFF_REASSIGNMENT',
        sourcePHCId: bestDonor.phc.id,
        sourcePHCName: bestDonor.phc.name,
        targetPHCId: targetPHC.id,
        targetPHCName: targetPHC.name,
        targetServiceId: 'diagnostics',
        reason: `${targetPHC.name} diagnostic lab is idle due to technician absence while hardware and reagents are 100% functional. ${bestDonor.phc.name} possesses ${bestDonor.phc.resources.techniciansAvailable} technicians (${bestDonor.spareTechnicians} surplus above minimum shift requirement).`,
        recoveryTimeHours: Math.round((bestDonor.distanceKm / 30 + 1.0) * 10) / 10, // ~1.5 - 2.5 hrs
        distanceKm: bestDonor.distanceKm,
        estimatedCostINR: Math.round(500 + bestDonor.distanceKm * 45),
        affectedPatientsProtected: 28,
        donorImpactRating: bestDonor.spareTechnicians > 0 ? 'MINIMAL' : 'MODERATE',
        coverageGainPercentage: 20, // 1 out of 5 services restored = +20%
        score: 95 - Math.round(bestDonor.distanceKm * 0.4),
        isAiRecommended: true,
        status: 'PROPOSED',
        rationale: [
          `Rapid turnaround (${Math.round((bestDonor.distanceKm / 30 + 1.0) * 10) / 10} hours) avoids diagnostic backlog for 28 daily patients.`,
          `Donor facility (${bestDonor.phc.name}) maintains ${bestDonor.phc.resources.techniciansAvailable - 1} lab tech(s), preventing local service degradation.`,
          `Cost-effective (est. INR ${Math.round(500 + bestDonor.distanceKm * 45)}) utilizing existing district health transport allowance.`,
        ],
      });

      // 2. Sample Transit Shuttle (Alternative)
      interventions.push({
        id: `int-sample-transit-${targetPHC.id}-${bestDonor.phc.id}`,
        title: `Sample Transit Shuttle to Central Lab at ${bestDonor.phc.name}`,
        type: 'PATIENT_REDIRECT',
        sourcePHCId: bestDonor.phc.id,
        sourcePHCName: bestDonor.phc.name,
        targetPHCId: targetPHC.id,
        targetPHCName: targetPHC.name,
        targetServiceId: 'diagnostics',
        reason: `Collect blood and diagnostic samples locally at ${targetPHC.name} and route them via temperature-controlled sample bike carrier to ${bestDonor.phc.name} for batch processing.`,
        recoveryTimeHours: Math.round((bestDonor.distanceKm / 20 + 2.5) * 10) / 10,
        distanceKm: bestDonor.distanceKm,
        estimatedCostINR: Math.round(1200 + bestDonor.distanceKm * 30),
        affectedPatientsProtected: 20,
        donorImpactRating: 'MODERATE',
        coverageGainPercentage: 15,
        score: 78 - Math.round(bestDonor.distanceKm * 0.3),
        isAiRecommended: false,
        status: 'PROPOSED',
        rationale: [
          'Ensures test turnaround within 4 hours without moving medical personnel.',
          'Increases daily sample load on donor lab equipment.',
        ],
      });
    }

    // 3. District Mobile Unit Deployment
    interventions.push({
      id: `int-mobile-van-${targetPHC.id}`,
      title: 'District Mobile Diagnostic Van Dispatch',
      type: 'EQUIPMENT_SUPPORT',
      targetPHCId: targetPHC.id,
      targetPHCName: targetPHC.name,
      targetServiceId: 'diagnostics',
      reason: 'Request District Health Society (DHS) to route the mobile tele-diagnostic van to cover morning outpatient diagnostic load.',
      recoveryTimeHours: 5.5,
      distanceKm: 22.0,
      estimatedCostINR: 5200,
      affectedPatientsProtected: 25,
      donorImpactRating: 'NONE',
      coverageGainPercentage: 20,
      score: 68,
      isAiRecommended: false,
      status: 'PROPOSED',
      rationale: [
        'Complete self-contained diagnostic capability independent of local staff.',
        'Higher mobilization latency and fuel logistics expenditure.',
      ],
    });
  } else if (failedServiceId === 'emergency') {
    const bestDonor = nearby[0];
    interventions.push({
      id: `int-emg-redirect-${targetPHC.id}`,
      title: `Emergency Patient Triage & Direct Ambulance Routing to ${bestDonor?.phc.name || 'District Hospital'}`,
      type: 'PATIENT_REDIRECT',
      sourcePHCId: bestDonor?.phc.id,
      sourcePHCName: bestDonor?.phc.name,
      targetPHCId: targetPHC.id,
      targetPHCName: targetPHC.name,
      targetServiceId: 'emergency',
      reason: 'Emergency stabilization equipment/staff constrained. Activate 108 Emergency Ambulance network pre-routing.',
      recoveryTimeHours: 0.5,
      distanceKm: bestDonor?.distanceKm || 15,
      estimatedCostINR: 2500,
      affectedPatientsProtected: 12,
      donorImpactRating: 'MINIMAL',
      coverageGainPercentage: 20,
      score: 90,
      isAiRecommended: true,
      status: 'PROPOSED',
      rationale: [
        'Immediate patient safety protection during acute emergency episodes.',
        'Prevents referral delays at gate.',
      ],
    });
  } else {
    // Generic district support
    interventions.push({
      id: `int-generic-${targetPHC.id}-${failedServiceId}`,
      title: `District Emergency Supply Requisition for ${failedServiceId.toUpperCase()}`,
      type: 'DISTRICT_ESCALATION',
      targetPHCId: targetPHC.id,
      targetPHCName: targetPHC.name,
      targetServiceId: failedServiceId,
      reason: `Automated capability bottleneck escalation logged to Chief Medical Officer (CMO) portal.`,
      recoveryTimeHours: 24,
      distanceKm: 0,
      estimatedCostINR: 3000,
      affectedPatientsProtected: 15,
      donorImpactRating: 'NONE',
      coverageGainPercentage: 20,
      score: 75,
      isAiRecommended: true,
      status: 'PROPOSED',
      rationale: ['Formal administrative procurement channel escalation.'],
    });
  }

  return interventions.sort((a, b) => b.score - a.score);
}

/**
 * Computes before and after capability metrics for an intervention.
 */
export function calculateInterventionImpact(
  targetPHC: PHC,
  intervention: InterventionOption,
  allPHCs: PHC[]
) {
  // Before
  const beforeCoverage = targetPHC.overallCoveragePercentage || 60;
  const beforeEffectivePatients = targetPHC.effectiveDailyCapacity || 45;

  // After applying intervention:
  // The targeted service is restored from UNAVAILABLE to AVAILABLE (score +20% approximately)
  const afterCoverage = Math.min(100, beforeCoverage + intervention.coverageGainPercentage);
  const afterEffectivePatients = beforeEffectivePatients + intervention.affectedPatientsProtected;

  // Network wide diagnostic coverage before vs after
  const diagCountBefore = allPHCs.filter(
    (p) => p.capabilities?.diagnostics.status === 'AVAILABLE'
  ).length;
  const diagCoverageBefore = Math.round((diagCountBefore / allPHCs.length) * 100);

  // If this target PHC was down and now restored:
  const isTargetDown = targetPHC.capabilities?.diagnostics.status !== 'AVAILABLE';
  const diagCountAfter = isTargetDown ? diagCountBefore + 1 : diagCountBefore;
  const diagCoverageAfter = Math.round((diagCountAfter / allPHCs.length) * 100);

  return {
    targetPHC: {
      name: targetPHC.name,
      beforeCoverage,
      afterCoverage,
      coverageDelta: afterCoverage - beforeCoverage,
      beforeEffectivePatients,
      afterEffectivePatients,
      patientsProtected: intervention.affectedPatientsProtected,
    },
    network: {
      diagCoverageBefore,
      diagCoverageAfter,
      diagDelta: diagCoverageAfter - diagCoverageBefore,
      totalFacilitiesProtected: 1,
    },
    estimatedRecoveryHours: intervention.recoveryTimeHours,
    estimatedCostINR: intervention.estimatedCostINR,
  };
}
