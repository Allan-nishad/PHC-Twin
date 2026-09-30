import { PHC } from './types';

/**
 * Calculates Haversine distance in kilometers between two geographic coordinates.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

/**
 * Finds all capable nearby PHCs sorted by distance.
 */
export function findNearbyCapablePHCs(
  targetPHC: PHC,
  allPHCs: PHC[],
  serviceRequired: 'diagnostics' | 'opd' | 'maternal' | 'emergency' | 'inpatient',
  maxDistanceKm = 80
) {
  return allPHCs
    .filter((p) => p.id !== targetPHC.id)
    .map((p) => {
      const distance = calculateHaversineDistance(
        targetPHC.latitude,
        targetPHC.longitude,
        p.latitude,
        p.longitude
      );
      const isCapable = p.capabilities?.[serviceRequired]?.status === 'AVAILABLE';
      const availableCapacity = p.capabilities?.[serviceRequired]?.effectiveCapacityPatients || 0;
      return {
        phc: p,
        distanceKm: distance,
        isCapable,
        availableCapacity,
        spareTechnicians: p.resources.techniciansAvailable > 1 ? p.resources.techniciansAvailable - 1 : 0,
        spareDoctors: p.resources.doctorsAvailable > 1 ? p.resources.doctorsAvailable - 1 : 0,
        spareNurses: p.resources.nursesAvailable > 2 ? p.resources.nursesAvailable - 2 : 0,
      };
    })
    .filter((item) => item.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Format currency in INR.
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
