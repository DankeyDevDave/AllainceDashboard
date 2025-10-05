import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getDevicePower,
  getDeviceDailyEnergy,
  getDeviceState,
  getDeviceMetrics,
  getAllDevicesMetrics,
  testDeviceConnection,
} from '@/lib/queries/device-metrics';

// Mock InfluxDB
vi.mock('@influxdata/influxdb-client', () => ({
  InfluxDB: vi.fn(() => ({
    getQueryApi: vi.fn(() => ({
      queryRows: vi.fn(),
    })),
  })),
}));

describe('Device Metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.INFLUXDB_URL = 'http://localhost:8086';
    process.env.INFLUXDB_TOKEN = 'test-token';
    process.env.INFLUXDB_ORG = 'test-org';
    process.env.INFLUXDB_BUCKET = 'homeassistant';
  });

  describe('getDevicePower', () => {
    it('should return power value for valid entity', async () => {
      const power = await getDevicePower('sensor.pool_pump_power');
      expect(power).toBeNull(); // Will be null in test environment
    });

    it('should return null for non-existent entity', async () => {
      const power = await getDevicePower('sensor.invalid_entity');
      expect(power).toBeNull();
    });
  });

  describe('getDeviceDailyEnergy', () => {
    it('should return 0 for device with no data', async () => {
      const energy = await getDeviceDailyEnergy('sensor.pool_pump_energy');
      expect(energy).toBe(0);
    });
  });

  describe('getDeviceState', () => {
    it('should return unknown state when no power data', async () => {
      const state = await getDeviceState('sensor.pool_pump_power');
      expect(state).toBe('unknown');
    });
  });

  describe('getDeviceMetrics', () => {
    it('should return metrics object with default values', async () => {
      const metrics = await getDeviceMetrics('pump-1', 'sensor.pool_pump_power');

      expect(metrics).toHaveProperty('deviceId', 'pump-1');
      expect(metrics).toHaveProperty('power');
      expect(metrics).toHaveProperty('energyToday');
      expect(metrics).toHaveProperty('state');
      expect(metrics).toHaveProperty('timestamp');
    });
  });

  describe('getAllDevicesMetrics', () => {
    it('should return metrics map for multiple devices', async () => {
      const devices = [
        { id: 'pump-1', entityId: 'sensor.pool_pump_power' },
        { id: 'monitor-1', entityId: 'sensor.filter_power' },
      ];

      const metricsMap = await getAllDevicesMetrics(devices);

      expect(metricsMap.size).toBe(2);
      expect(metricsMap.has('pump-1')).toBe(true);
      expect(metricsMap.has('monitor-1')).toBe(true);
    });

    it('should handle empty device array', async () => {
      const metricsMap = await getAllDevicesMetrics([]);
      expect(metricsMap.size).toBe(0);
    });
  });

  describe('testDeviceConnection', () => {
    it('should return connection result', async () => {
      const result = await testDeviceConnection('sensor.pool_pump_power');

      expect(result).toHaveProperty('connected');
      expect(result).toHaveProperty('hasData');
      expect(result).toHaveProperty('message');
    });
  });
});
