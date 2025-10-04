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
    // Fetch all data in parallel
    const [metrics, energyToday, runtimeToday, energyByTariff] = await Promise.all([
      getCurrentMetrics(device),
      getDailyEnergy(device),
      getDailyRuntime(device),
      getEnergyByTariff(device),
    ]);

    // Calculate derived metrics
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
      energyByTariff.regular,
      energyByTariff.low,
      regularTariff,
      lowTariff
    );

    const dutyCycle = calculateDutyCycle(runtimeToday);

    // Build response
    const response = {
      timestamp: new Date().toISOString(),
      device,
      metrics: {
        ...metrics,
        energyToday,
        runtimeToday,
        energyRegular: energyByTariff.regular,
        energyLow: energyByTariff.low,
      },
      calculated: {
        cop: copData,
        thermalLift,
        costToday,
        dutyCycle,
      },
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
