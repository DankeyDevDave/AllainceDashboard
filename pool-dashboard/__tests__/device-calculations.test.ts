import { describe, it, expect } from 'vitest';
import {
  calculateEnergyCost,
  calculateTotalPower,
  calculateTotalEnergy,
  calculateTotalCost,
  calculateCostBreakdown,
  calculatePowerBreakdown,
  buildCombinedMetrics,
  formatCost,
  formatPower,
  formatEnergy,
} from '@/lib/queries/device-calculations';
import type { DeviceMetrics, SonoffDevice } from '@/lib/types/devices';

describe('Device Calculations', () => {
  const mockDevices: SonoffDevice[] = [
    {
      id: 'pump-1',
      name: 'Pool Pump',
      entityId: 'sensor.pool_pump_power',
      type: 'pool_pump',
      enabled: true,
    },
    {
      id: 'monitor-1',
      name: 'Filter Monitor',
      entityId: 'sensor.filter_power',
      type: 'power_monitor',
      enabled: true,
    },
  ];

  const mockMetrics = new Map<string, DeviceMetrics>([
    [
      'pump-1',
      {
        deviceId: 'pump-1',
        power: 1.5, // kW
        energyToday: 12.0, // kWh
        state: 'on',
      },
    ],
    [
      'monitor-1',
      {
        deviceId: 'monitor-1',
        power: 0.5, // kW
        energyToday: 4.0, // kWh
        state: 'on',
      },
    ],
  ]);

  describe('calculateEnergyCost', () => {
    it('should calculate cost correctly', () => {
      const cost = calculateEnergyCost(10, 2.5);
      expect(cost).toBe(25);
    });

    it('should handle zero energy', () => {
      const cost = calculateEnergyCost(0, 2.5);
      expect(cost).toBe(0);
    });
  });

  describe('calculateTotalPower', () => {
    it('should sum heat pump and device power', () => {
      const total = calculateTotalPower(2.0, mockMetrics);
      expect(total).toBe(4.0); // 2.0 + 1.5 + 0.5
    });

    it('should handle empty device metrics', () => {
      const total = calculateTotalPower(2.0, new Map());
      expect(total).toBe(2.0);
    });
  });

  describe('calculateTotalEnergy', () => {
    it('should sum heat pump and device energy', () => {
      const total = calculateTotalEnergy(20.0, mockMetrics);
      expect(total).toBe(36.0); // 20.0 + 12.0 + 4.0
    });
  });

  describe('calculateTotalCost', () => {
    it('should calculate total cost at given tariff', () => {
      const total = calculateTotalCost(20.0, mockMetrics, 2.5);
      expect(total).toBe(90.0); // (20 + 12 + 4) * 2.5
    });
  });

  describe('calculateCostBreakdown', () => {
    it('should break down costs by device type', () => {
      const breakdown = calculateCostBreakdown(20.0, mockDevices, mockMetrics, 2.5);

      expect(breakdown.heatPump).toBe(50.0); // 20 * 2.5
      expect(breakdown.poolPump).toBe(30.0); // 12 * 2.5
      expect(breakdown.otherDevices).toBe(10.0); // 4 * 2.5
    });

    it('should handle no pool pump', () => {
      const devicesNoPump = mockDevices.filter((d) => d.type !== 'pool_pump');
      const breakdown = calculateCostBreakdown(20.0, devicesNoPump, mockMetrics, 2.5);

      expect(breakdown.poolPump).toBe(0);
      expect(breakdown.otherDevices).toBeGreaterThan(0);
    });
  });

  describe('calculatePowerBreakdown', () => {
    it('should calculate percentage breakdown', () => {
      const breakdown = calculatePowerBreakdown(2.0, mockDevices, mockMetrics);

      expect(breakdown.heatPumpPercent).toBeCloseTo(50.0); // 2/4 * 100
      expect(breakdown.poolPumpPercent).toBeCloseTo(37.5); // 1.5/4 * 100
      expect(breakdown.otherDevicesPercent).toBeCloseTo(12.5); // 0.5/4 * 100
    });

    it('should handle zero total power', () => {
      const breakdown = calculatePowerBreakdown(0, [], new Map());

      expect(breakdown.heatPumpPercent).toBe(0);
      expect(breakdown.poolPumpPercent).toBe(0);
      expect(breakdown.otherDevicesPercent).toBe(0);
    });
  });

  describe('buildCombinedMetrics', () => {
    it('should build complete combined metrics object', () => {
      const combined = buildCombinedMetrics(
        { power: 2.0, energyToday: 20.0 },
        mockDevices,
        mockMetrics,
        2.5
      );

      expect(combined.heatPump.power).toBe(2.0);
      expect(combined.heatPump.energyToday).toBe(20.0);
      expect(combined.poolPump).toBeDefined();
      expect(combined.poolPump?.power).toBe(1.5);
      expect(combined.devices).toHaveLength(2);
      expect(combined.totalPower).toBe(4.0);
      expect(combined.totalEnergyToday).toBe(36.0);
      expect(combined.costBreakdown).toBeDefined();
      expect(combined.powerBreakdown).toBeDefined();
    });

    it('should handle no pool pump device', () => {
      const devicesNoPump = mockDevices.filter((d) => d.type !== 'pool_pump');
      const combined = buildCombinedMetrics(
        { power: 2.0, energyToday: 20.0 },
        devicesNoPump,
        mockMetrics,
        2.5
      );

      expect(combined.poolPump).toBeNull();
    });
  });

  describe('Format functions', () => {
    it('should format cost correctly', () => {
      expect(formatCost(25.5, 'R')).toBe('R25.50');
      expect(formatCost(10, '$')).toBe('$10.00');
    });

    it('should format power correctly', () => {
      expect(formatPower(1.5)).toBe('1.50kW');
      expect(formatPower(0.75)).toBe('750W');
      expect(formatPower(0.1)).toBe('100W');
    });

    it('should format energy correctly', () => {
      expect(formatEnergy(12.5)).toBe('12.50kWh');
      expect(formatEnergy(0.75)).toBe('750Wh');
      expect(formatEnergy(0.1)).toBe('100Wh');
    });
  });
});
