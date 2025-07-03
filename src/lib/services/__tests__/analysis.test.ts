import { describe, it, expect } from 'vitest';
import {
  calculateMaterialCosts,
  calculateLabourCosts,
  generateProjectMetrics,
  calculatePhaseProgress,
  generateCostBreakdown,
  calculateTimelineVariance,
  type MaterialCost,
  type LabourCost,
} from '../analysis';

describe('Analysis Service', () => {
  describe('calculateMaterialCosts', () => {
    it('should calculate material costs correctly', () => {
      const materials: MaterialCost[] = [
        {
          id: '1',
          name: 'Cement',
          quantity: 10,
          estimatedCost: 25.50,
          category: 'Building Materials',
          vatPercentage: 21,
        },
        {
          id: '2',
          name: 'Steel Rebar',
          quantity: 5,
          estimatedCost: 45.00,
          category: 'Building Materials',
          vatPercentage: 21,
        },
      ];

      const result = calculateMaterialCosts(materials);

      expect(result.subtotal).toBe(480); // (10 * 25.50) + (5 * 45.00)
      expect(result.vatAmount).toBe(100.8); // 480 * 0.21
      expect(result.total).toBe(580.8);
    });

    it('should handle empty materials array', () => {
      const result = calculateMaterialCosts([]);
      expect(result.subtotal).toBe(0);
      expect(result.vatAmount).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should throw error for invalid input', () => {
      expect(() => calculateMaterialCosts(null as any)).toThrow('Materials must be an array');
    });

    it('should handle materials with missing values', () => {
      const materials: MaterialCost[] = [
        {
          id: '1',
          name: 'Test Material',
          quantity: 0,
          estimatedCost: 0,
          category: 'Test',
          vatPercentage: 0,
        },
      ];

      const result = calculateMaterialCosts(materials);
      expect(result.subtotal).toBe(0);
      expect(result.vatAmount).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('calculateLabourCosts', () => {
    it('should calculate hourly labour costs correctly', () => {
      const labour: LabourCost[] = [
        {
          id: '1',
          task: 'Foundation Work',
          hours: 40,
          hourlyRate: 35.00,
          costPerJob: 0,
          billPerHour: true,
        },
        {
          id: '2',
          task: 'Electrical Installation',
          hours: 20,
          hourlyRate: 50.00,
          costPerJob: 0,
          billPerHour: true,
        },
      ];

      const result = calculateLabourCosts(labour);

      expect(result.totalCost).toBe(2400); // (40 * 35) + (20 * 50)
      expect(result.totalHours).toBe(60);
      expect(result.averageHourlyRate).toBe(40); // 2400 / 60
    });

    it('should calculate fixed job costs correctly', () => {
      const labour: LabourCost[] = [
        {
          id: '1',
          task: 'Plumbing Package',
          hours: 0,
          hourlyRate: 0,
          costPerJob: 1500,
          billPerHour: false,
        },
      ];

      const result = calculateLabourCosts(labour);

      expect(result.totalCost).toBe(1500);
      expect(result.totalHours).toBe(0);
      expect(result.averageHourlyRate).toBe(0);
    });

    it('should handle mixed billing types', () => {
      const labour: LabourCost[] = [
        {
          id: '1',
          task: 'Foundation Work',
          hours: 10,
          hourlyRate: 35.00,
          costPerJob: 0,
          billPerHour: true,
        },
        {
          id: '2',
          task: 'Plumbing Package',
          hours: 0,
          hourlyRate: 0,
          costPerJob: 800,
          billPerHour: false,
        },
      ];

      const result = calculateLabourCosts(labour);

      expect(result.totalCost).toBe(1150); // (10 * 35) + 800
      expect(result.totalHours).toBe(10);
      expect(result.averageHourlyRate).toBe(35);
    });

    it('should throw error for invalid input', () => {
      expect(() => calculateLabourCosts(null as any)).toThrow('Labour must be an array');
    });
  });

  describe('generateProjectMetrics', () => {
    it('should generate comprehensive project metrics', () => {
      const materials: MaterialCost[] = [
        {
          id: '1',
          name: 'Cement',
          quantity: 10,
          estimatedCost: 25.00,
          category: 'Building Materials',
          vatPercentage: 20,
        },
      ];

      const labour: LabourCost[] = [
        {
          id: '1',
          task: 'Foundation Work',
          hours: 20,
          hourlyRate: 40.00,
          costPerJob: 0,
          billPerHour: true,
        },
      ];

      const result = generateProjectMetrics(materials, labour);

      expect(result.totalMaterialCost).toBe(250); // 10 * 25
      expect(result.totalLabourCost).toBe(800); // 20 * 40
      expect(result.totalCostWithVat).toBe(1100); // 300 (materials + VAT) + 800 (labour)
      expect(result.totalHours).toBe(20);
      expect(result.averageHourlyRate).toBe(40);
      expect(result.costBreakdown.materials).toBe(250);
      expect(result.costBreakdown.labour).toBe(800);
      expect(result.costBreakdown.vat).toBe(50); // 250 * 0.20
    });
  });

  describe('calculatePhaseProgress', () => {
    it('should calculate phase progress correctly', () => {
      const checklist = [
        { completed: true, required: true },
        { completed: true, required: true },
        { completed: false, required: true },
        { completed: false, required: false },
      ];

      const result = calculatePhaseProgress(checklist, 30, '2024-01-01', '2024-01-25');

      expect(result.completedTasks).toBe(2);
      expect(result.totalTasks).toBe(4);
      expect(result.completionPercentage).toBe(50);
      expect(result.estimatedDuration).toBe(30);
      expect(result.actualDuration).toBe(24);
    });

    it('should handle empty checklist', () => {
      const result = calculatePhaseProgress([]);

      expect(result.completedTasks).toBe(0);
      expect(result.totalTasks).toBe(0);
      expect(result.completionPercentage).toBe(0);
    });

    it('should throw error for invalid input', () => {
      expect(() => calculatePhaseProgress(null as any)).toThrow('Checklist must be an array');
    });
  });

  describe('generateCostBreakdown', () => {
    it('should generate cost breakdown by category', () => {
      const materials: MaterialCost[] = [
        {
          id: '1',
          name: 'Cement',
          quantity: 2,
          estimatedCost: 25.00,
          category: 'Building Materials',
          vatPercentage: 21,
        },
        {
          id: '2',
          name: 'Paint',
          quantity: 3,
          estimatedCost: 15.00,
          category: 'Finishing Materials',
          vatPercentage: 21,
        },
        {
          id: '3',
          name: 'Sand',
          quantity: 5,
          estimatedCost: 10.00,
          category: 'Building Materials',
          vatPercentage: 21,
        },
      ];

      const result = generateCostBreakdown(materials);

      expect(result['Building Materials']).toBe(100); // (2 * 25) + (5 * 10)
      expect(result['Finishing Materials']).toBe(45); // 3 * 15
    });

    it('should handle materials without category', () => {
      const materials: MaterialCost[] = [
        {
          id: '1',
          name: 'Unknown Material',
          quantity: 1,
          estimatedCost: 50.00,
          category: '',
          vatPercentage: 0,
        },
      ];

      const result = generateCostBreakdown(materials);
      expect(result['Uncategorized']).toBe(50);
    });

    it('should throw error for invalid input', () => {
      expect(() => generateCostBreakdown(null as any)).toThrow('Materials must be an array');
    });
  });

  describe('calculateTimelineVariance', () => {
    it('should calculate timeline variance correctly', () => {
      const result = calculateTimelineVariance(30, 35);

      expect(result.variance).toBe(5);
      expect(result.variancePercentage).toBe(16.67);
      expect(result.status).toBe('behind');
    });

    it('should identify ahead schedule', () => {
      const result = calculateTimelineVariance(30, 25);

      expect(result.variance).toBe(-5);
      expect(result.variancePercentage).toBe(-16.67);
      expect(result.status).toBe('ahead');
    });

    it('should identify on-time status', () => {
      const result = calculateTimelineVariance(30, 30);

      expect(result.variance).toBe(0);
      expect(result.variancePercentage).toBe(0);
      expect(result.status).toBe('on-time');
    });

    it('should handle invalid inputs', () => {
      const result = calculateTimelineVariance(null as any, undefined as any);

      expect(result.variance).toBe(0);
      expect(result.variancePercentage).toBe(0);
      expect(result.status).toBe('unknown');
    });
  });
});