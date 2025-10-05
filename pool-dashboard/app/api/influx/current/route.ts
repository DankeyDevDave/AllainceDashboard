import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentMetrics,
  getDailyEnergy,
  getDailyRuntime,
  getEnergyByTariff,
} from '@/lib/queries/current-metrics';
import {
  calculateCOP,
  calculateThermalLift,
  calculateCost,
  calculateDutyCycle,
} from '@/lib/queries/calculations';
import { getAllDevicesMetrics } from '@/lib/queries/device-metrics';
import { buildCombinedMetrics } from '@/lib/queries/device-calculations';
import { getSettings } from '@/lib/settings-storage';
import type { SonoffDevice } from '@/lib/types/devices';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get query parameters
  const device = searchParams.get('device') || process.env.NEXT_PUBLIC_DEFAULT_DEVICE || 'aloha_sensory_aquatics';
  const flowRate = Number(searchParams.get('flowRate') || 100);
  const regularTariff = Number(searchParams.get('regularTariff') || 2.50);
  const lowTariff = Number(searchParams.get('lowTariff') || 1.00);

  try {
    // Get configured devices from settings
    const settings = getSettings();
    const enabledDevices: SonoffDevice[] = settings.deviceManagement?.devices?.filter(d => d.enabled) || [];

    // Fetch all data in parallel with error handling
    const [metrics, energyToday, runtimeToday, energyByTariff, deviceMetrics] = await Promise.all([
      getCurrentMetrics(device).catch(err => {
        console.warn('Failed to fetch current metrics:', err);
        return {};
      }),
      getDailyEnergy(device).catch(err => {
        console.warn('Failed to fetch daily energy:', err);
        return 0;
      }),
      getDailyRuntime(device).catch(err => {
        console.warn('Failed to fetch daily runtime:', err);
        return 0;
      }),
      getEnergyByTariff(device).catch(err => {
        console.warn('Failed to fetch energy by tariff:', err);
        return { regular: 0, low: 0 };
      }),
      getAllDevicesMetrics(
        enabledDevices.map(d => ({ id: d.id, entityId: d.entityId }))
      ).catch(err => {
        console.warn('Failed to fetch device metrics:', err);
        return new Map();
      }),
    ]);

    // Calculate derived metrics with defaults
    const copData = calculateCOP(
      metrics.power || 0,
      metrics.inletTemp || 0,
      metrics.outletTemp || 0,
      flowRate
    );

    const thermalLift = calculateThermalLift(
      metrics.poolTemp || 0,
      metrics.ambientTemp || 0
    );

    const costToday = calculateCost(
      energyByTariff.regular || 0,
      energyByTariff.low || 0,
      regularTariff,
      lowTariff
    );

    const dutyCycle = calculateDutyCycle(runtimeToday || 0);

    // Build combined metrics with devices
    const combinedMetrics = buildCombinedMetrics(
      {
        power: (metrics.power || 0) / 1000, // Convert W to kW
        energyToday: energyToday || 0,
      },
      enabledDevices,
      deviceMetrics,
      regularTariff
    );

    // Build response
    const response = {
      timestamp: new Date().toISOString(),
      device,
      metrics: {
        power: metrics.power || 0,
        inletTemp: metrics.inletTemp || 0,
        outletTemp: metrics.outletTemp || 0,
        ambientTemp: metrics.ambientTemp || 0,
        poolTemp: metrics.poolTemp || 0,
        compressorFreq: metrics.compressorFreq || 0,
        mode: metrics.mode || 'unknown',
        energyToday,
        runtimeToday,
        energyRegular: energyByTariff.regular || 0,
        energyLow: energyByTariff.low || 0,
      },
      calculated: {
        cop: copData,
        thermalLift,
        costToday,
        dutyCycle,
      },
      devices: combinedMetrics,
      settings: {
        flowRate,
        regularTariff,
        lowTariff,
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error in current metrics API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch current metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
