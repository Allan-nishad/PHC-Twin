export type ServiceId = 'opd' | 'maternal' | 'diagnostics' | 'emergency' | 'inpatient';

export type CapabilityStatus = 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';

export interface ServiceDependency {
  id: string;
  name: string;
  category: 'STAFF' | 'EQUIPMENT' | 'SUPPLY' | 'INFRASTRUCTURE';
  isCritical: boolean; // if false and missing -> LIMITED, if true and missing -> UNAVAILABLE
  isAvailable: boolean;
  currentValueDescription: string;
  requiredValueDescription: string;
  impactIfMissing: string;
}

export interface ServiceCapabilityResult {
  serviceId: ServiceId;
  serviceName: string;
  status: CapabilityStatus;
  score: number; // 0 to 100
  effectiveCapacityPatients: number;
  dependencies: ServiceDependency[];
  failedCriticalDependencies: ServiceDependency[];
  warningDependencies: ServiceDependency[];
  explanation: string;
  rootCause: string;
  bottleneck: string | null;
}

export interface PHCResources {
  // Staff
  doctorsTotal: number;
  doctorsAvailable: number;
  nursesTotal: number;
  nursesAvailable: number;
  techniciansTotal: number;
  techniciansAvailable: number;

  // Beds
  bedsTotal: number;
  bedsOccupied: number;

  // Equipment Status
  diagnosticEquipmentFunctional: boolean;
  emergencyEquipmentFunctional: boolean;
  maternalEquipmentFunctional: boolean;
  generalEquipmentFunctional: boolean;

  // Infrastructure
  powerGridAvailable: boolean;
  powerBackupAvailable: boolean; // DG or solar
  waterSupplyAvailable: boolean;
  coldChainFunctional: boolean;

  // Supplies & Stock
  medicineStockPercentage: number;
  essentialEmergencyDrugsAvailable: boolean;
  maternalDrugsAvailable: boolean;
  diagnosticReagentsAvailable: boolean;

  // Operational metrics
  dailyPatientLoad: number;
  operationalConfidenceScore: number; // 0 to 100
  confidenceAnomalyReason?: string;
  recentDailyUsage: number[]; // past 7 days usage units
  currentStockUnits: number;
}

export interface PHC {
  id: string;
  code: string;
  name: string;
  district: string;
  state: string;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East';
  latitude: number;
  longitude: number;
  tier: 'Sub-Centre' | 'Primary Health Centre' | 'Community Health Centre';
  lastUpdated: string;
  resources: PHCResources;
  // calculated dynamically or stored
  capabilities?: Record<ServiceId, ServiceCapabilityResult>;
  overallCoveragePercentage?: number;
  effectiveDailyCapacity?: number;
  statusSummary?: CapabilityStatus;
}

export interface StockoutForecast {
  phcId: string;
  phcName: string;
  currentStockUnits: number;
  avgDailyUsage: number;
  projected7DayDemand: number;
  daysOfStockRemaining: number;
  stockoutRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  projectedShortageUnits: number;
  explanation: string;
}

export interface InterventionOption {
  id: string;
  title: string;
  type: 'STAFF_REASSIGNMENT' | 'MEDICINE_TRANSFER' | 'PATIENT_REDIRECT' | 'EQUIPMENT_SUPPORT' | 'DISTRICT_ESCALATION';
  sourcePHCId?: string;
  sourcePHCName?: string;
  targetPHCId: string;
  targetPHCName: string;
  targetServiceId: ServiceId;
  reason: string;
  recoveryTimeHours: number;
  estimatedCostINR: number;
  distanceKm: number;
  affectedPatientsProtected: number;
  donorImpactRating: 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT' | 'NONE';
  coverageGainPercentage: number;
  score: number;
  isAiRecommended: boolean;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  rationale: string[];
}

export interface GeminiAnalysisResult {
  problem: string;
  rootCause: string;
  recommendation: string;
  reasoning: string[];
  expectedImpact: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  humanApprovalRequired: boolean;
  confidenceScore: number;
  donorSafeguardNote: string;
  generatedAt: string;
  isFallback?: boolean;
}

export interface Alert {
  id: string;
  phcId: string;
  phcName: string;
  state: string;
  district: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'SERVICE_FAILURE' | 'STOCKOUT_RISK' | 'CAPACITY_OVERLOAD' | 'DATA_CONFIDENCE';
  title: string;
  reason: string;
  timestamp: string;
  recommendedAction: string;
  serviceId?: ServiceId;
}
