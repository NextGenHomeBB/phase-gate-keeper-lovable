/**
 * Analysis service for charts, calculations, and data processing
 * Pure functions for business logic with comprehensive error handling
 */

export interface MaterialCost {
  id: string;
  name: string;
  quantity: number;
  estimatedCost: number;
  category: string;
  vatPercentage: number;
}

export interface LabourCost {
  id: string;
  task: string;
  hours: number;
  hourlyRate: number;
  costPerJob: number;
  billPerHour: boolean;
}

export interface ProjectMetrics {
  totalMaterialCost: number;
  totalLabourCost: number;
  totalCostWithVat: number;
  totalHours: number;
  averageHourlyRate: number;
  costBreakdown: {
    materials: number;
    labour: number;
    vat: number;
  };
}

export interface PhaseProgress {
  phaseId: string;
  phaseName: string;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  estimatedDuration: number;
  actualDuration: number;
}

/**
 * Calculate total material costs including VAT
 */
export function calculateMaterialCosts(materials: MaterialCost[]): {
  subtotal: number;
  vatAmount: number;
  total: number;
} {
  if (!Array.isArray(materials)) {
    throw new Error('Materials must be an array');
  }

  const subtotal = materials.reduce((sum, material) => {
    const cost = (material.estimatedCost || 0) * (material.quantity || 1);
    return sum + cost;
  }, 0);

  const vatAmount = materials.reduce((sum, material) => {
    const cost = (material.estimatedCost || 0) * (material.quantity || 1);
    const vatRate = (material.vatPercentage || 0) / 100;
    return sum + (cost * vatRate);
  }, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round((subtotal + vatAmount) * 100) / 100,
  };
}

/**
 * Calculate total labour costs
 */
export function calculateLabourCosts(labour: LabourCost[]): {
  totalCost: number;
  totalHours: number;
  averageHourlyRate: number;
} {
  if (!Array.isArray(labour)) {
    throw new Error('Labour must be an array');
  }

  let totalCost = 0;
  let totalHours = 0;
  let totalHourlyWork = 0;

  labour.forEach((item) => {
    if (item.billPerHour) {
      const hours = item.hours || 0;
      const rate = item.hourlyRate || 0;
      totalCost += hours * rate;
      totalHours += hours;
      totalHourlyWork += hours * rate;
    } else {
      totalCost += item.costPerJob || 0;
    }
  });

  const averageHourlyRate = totalHours > 0 ? totalHourlyWork / totalHours : 0;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
    averageHourlyRate: Math.round(averageHourlyRate * 100) / 100,
  };
}

/**
 * Generate comprehensive project metrics
 */
export function generateProjectMetrics(
  materials: MaterialCost[],
  labour: LabourCost[]
): ProjectMetrics {
  const materialCosts = calculateMaterialCosts(materials);
  const labourCosts = calculateLabourCosts(labour);

  const totalCostWithVat = materialCosts.total + labourCosts.totalCost;

  return {
    totalMaterialCost: materialCosts.subtotal,
    totalLabourCost: labourCosts.totalCost,
    totalCostWithVat,
    totalHours: labourCosts.totalHours,
    averageHourlyRate: labourCosts.averageHourlyRate,
    costBreakdown: {
      materials: materialCosts.subtotal,
      labour: labourCosts.totalCost,
      vat: materialCosts.vatAmount,
    },
  };
}

/**
 * Calculate phase progress and completion metrics
 */
export function calculatePhaseProgress(
  checklist: Array<{ completed: boolean; required: boolean }>,
  estimatedDuration?: number,
  actualStartDate?: string,
  actualEndDate?: string
): {
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  estimatedDuration: number;
  actualDuration: number;
} {
  if (!Array.isArray(checklist)) {
    throw new Error('Checklist must be an array');
  }

  const totalTasks = checklist.length;
  const completedTasks = checklist.filter((item) => item.completed).length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  let actualDuration = 0;
  if (actualStartDate && actualEndDate) {
    const start = new Date(actualStartDate);
    const end = new Date(actualEndDate);
    actualDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    completedTasks,
    totalTasks,
    completionPercentage: Math.round(completionPercentage * 100) / 100,
    estimatedDuration: estimatedDuration || 0,
    actualDuration,
  };
}

/**
 * Generate cost breakdown by category
 */
export function generateCostBreakdown(materials: MaterialCost[]): Record<string, number> {
  if (!Array.isArray(materials)) {
    throw new Error('Materials must be an array');
  }

  const breakdown: Record<string, number> = {};

  materials.forEach((material) => {
    const category = material.category || 'Uncategorized';
    const cost = (material.estimatedCost || 0) * (material.quantity || 1);
    breakdown[category] = (breakdown[category] || 0) + cost;
  });

  // Round all values
  Object.keys(breakdown).forEach((key) => {
    breakdown[key] = Math.round(breakdown[key] * 100) / 100;
  });

  return breakdown;
}

/**
 * Calculate timeline variance (actual vs estimated)
 */
export function calculateTimelineVariance(
  estimatedDuration: number,
  actualDuration: number
): {
  variance: number;
  variancePercentage: number;
  status: 'ahead' | 'on-time' | 'behind' | 'unknown';
} {
  if (typeof estimatedDuration !== 'number' || typeof actualDuration !== 'number') {
    return {
      variance: 0,
      variancePercentage: 0,
      status: 'unknown',
    };
  }

  const variance = actualDuration - estimatedDuration;
  const variancePercentage = estimatedDuration > 0 ? (variance / estimatedDuration) * 100 : 0;

  let status: 'ahead' | 'on-time' | 'behind' | 'unknown';
  if (variance < -1) status = 'ahead';
  else if (variance > 1) status = 'behind';
  else status = 'on-time';

  return {
    variance,
    variancePercentage: Math.round(variancePercentage * 100) / 100,
    status,
  };
}