import { PHC, StockoutForecast, Alert } from './types';

/**
 * Calculates stockout forecast for a PHC based on past usage trends.
 */
export function calculateStockoutForecast(phc: PHC): StockoutForecast {
  const usage = phc.resources.recentDailyUsage || [30, 30, 30, 30, 30, 30, 30];
  const sumUsage = usage.reduce((a, b) => a + b, 0);
  const avgDailyUsage = Math.round((sumUsage / usage.length) * 10) / 10;
  
  // Projected 7-day demand with a realistic weekend / patient surge buffer (5% growth trend)
  const projected7DayDemand = Math.round(avgDailyUsage * 7 * 1.05);
  const currentStock = phc.resources.currentStockUnits;

  const daysOfStockRemaining =
    avgDailyUsage > 0 ? Math.round((currentStock / avgDailyUsage) * 10) / 10 : 99;

  let stockoutRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let projectedShortageUnits = 0;
  let explanation = `Stock buffer adequate for ${daysOfStockRemaining} days under baseline demand.`;

  if (daysOfStockRemaining <= 3 || currentStock < projected7DayDemand * 0.4) {
    stockoutRiskLevel = 'HIGH';
    projectedShortageUnits = Math.max(0, projected7DayDemand - currentStock);
    explanation = `CRITICAL: Stock-out risk in ~${Math.floor(daysOfStockRemaining)} days. Projected 7-day shortage: ${projectedShortageUnits} units.`;
  } else if (daysOfStockRemaining <= 7 || currentStock < projected7DayDemand) {
    stockoutRiskLevel = 'MEDIUM';
    projectedShortageUnits = Math.max(0, projected7DayDemand - currentStock);
    explanation = `WARNING: Stock-out risk in ~${Math.floor(daysOfStockRemaining)} days. Projected buffer will deplete by day 7 without replenishment.`;
  }

  return {
    phcId: phc.id,
    phcName: phc.name,
    currentStockUnits: currentStock,
    avgDailyUsage,
    projected7DayDemand,
    daysOfStockRemaining,
    stockoutRiskLevel,
    projectedShortageUnits,
    explanation,
  };
}

/**
 * Generates system-wide active alerts based on capability failures, stock-out forecasts, and data anomalies.
 */
export function generateSystemAlerts(phcs: PHC[]): Alert[] {
  const alerts: Alert[] = [];

  for (const phc of phcs) {
    // 1. Stockout Alerts
    const forecast = calculateStockoutForecast(phc);
    if (forecast.stockoutRiskLevel === 'HIGH') {
      alerts.push({
        id: `alert-stock-${phc.id}`,
        phcId: phc.id,
        phcName: phc.name,
        state: phc.state,
        district: phc.district,
        severity: 'CRITICAL',
        type: 'STOCKOUT_RISK',
        title: `Imminent Stock-Out Risk at ${phc.name}`,
        reason: forecast.explanation,
        timestamp: 'Active - Projected 5-day horizon',
        recommendedAction: 'Trigger inter-district buffer transfer or emergency depot requisition.',
      });
    } else if (forecast.stockoutRiskLevel === 'MEDIUM') {
      alerts.push({
        id: `alert-stock-${phc.id}`,
        phcId: phc.id,
        phcName: phc.name,
        state: phc.state,
        district: phc.district,
        severity: 'HIGH',
        type: 'STOCKOUT_RISK',
        title: `Low Medicine Buffer at ${phc.name}`,
        reason: forecast.explanation,
        timestamp: 'Active - 7-day horizon',
        recommendedAction: 'Verify incoming consignment schedule from central warehouse.',
      });
    }

    // 2. Service Failure Alerts
    if (phc.capabilities) {
      Object.entries(phc.capabilities).forEach(([serviceId, cap]) => {
        if (cap.status === 'UNAVAILABLE') {
          alerts.push({
            id: `alert-svc-${phc.id}-${serviceId}`,
            phcId: phc.id,
            phcName: phc.name,
            state: phc.state,
            district: phc.district,
            severity: serviceId === 'emergency' || serviceId === 'diagnostics' ? 'CRITICAL' : 'HIGH',
            type: 'SERVICE_FAILURE',
            serviceId: serviceId as any,
            title: `${cap.serviceName} Offline at ${phc.name}`,
            reason: cap.explanation,
            timestamp: 'Real-time telemetry event',
            recommendedAction: `Inspect bottleneck (${cap.bottleneck}) and evaluate nearby facility dispatch.`,
          });
        }
      });
    }

    // 3. Operational Data Confidence Anomaly Alerts
    if (phc.resources.operationalConfidenceScore < 85) {
      alerts.push({
        id: `alert-conf-${phc.id}`,
        phcId: phc.id,
        phcName: phc.name,
        state: phc.state,
        district: phc.district,
        severity: 'MEDIUM',
        type: 'DATA_CONFIDENCE',
        title: `Operational Data Confidence Warning (${phc.resources.operationalConfidenceScore}%)`,
        reason: phc.resources.confidenceAnomalyReason || 'Telemetry sync variance detected between physical ledger and digital log.',
        timestamp: 'Audit warning',
        recommendedAction: 'Flag for district monitoring officer verification during weekly inspection cycle.',
      });
    }
  }

  // Sort: CRITICAL first, then HIGH, then MEDIUM, then LOW
  const rank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
