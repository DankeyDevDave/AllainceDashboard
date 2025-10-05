# 🏊 Advanced Swim School Performance Dashboard - Implementation Guide

## 🎯 Overview

This document provides the complete implementation plan for the **Advanced Performance Dashboard** - a specialized dashboard for swim school operators focusing on heat pump efficiency, cost optimization, and performance analysis.

## ✅ What's Been Created

### 1. Performance Metrics Library
**File**: `lib/queries/performance-metrics.ts` ✅

**Functions**:
- `calculateHeatOutput()` - Thermal power output
- `calculateThermalCost()` - R/kWh-thermal (true cost metric)
- `calculateSpecificEnergy()` - Warm-up efficiency
- `getCOPPeriod()` - Time-weighted COP (24h, 7d)
- `getMorningWarmupStats()` - 04:00-09:00 analysis
- `getDefrostRate()` - Events per hour
- `getSetpointAdherence()` - Temperature stability %
- `getCOPVsAmbientData()` - Scatter plot data

---

## 📋 Remaining Implementation Steps

### Phase 1: Complete API Endpoint (2-3 hours)

**File to create**: `app/api/influx/performance/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  getCOPPeriod,
  getMorningWarmupStats,
  getDefrostRate,
  getSetpointAdherence,
  getCOPVsAmbientData,
  calculateThermalCost,
} from '@/lib/queries/performance-metrics';
import { getCurrentMetrics, getDailyEnergy, getEnergyByTariff } from '@/lib/queries/current-metrics';
import { calculateCOP, calculateThermalLift } from '@/lib/queries/calculations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const device = searchParams.get('device') || 'aloha_sensory_aquatics';
  const flowRate = Number(searchParams.get('flowRate') || 100);
  const poolVolume = Number(searchParams.get('poolVolume') || 200);
  const regularTariff = Number(searchParams.get('regularTariff') || 2.50);
  const lowTariff = Number(searchParams.get('lowTariff') || 1.00);

  try {
    // Fetch all data in parallel
    const [
      currentMetrics,
      energyToday,
      energyByTariff,
      cop24h,
      cop7d,
      morningStats,
      defrostRate,
      setpointAdherence,
      copVsAmbient,
    ] = await Promise.all([
      getCurrentMetrics(device),
      getDailyEnergy(device),
      getEnergyByTariff(device),
      getCOPPeriod(device, '-24h', 'now', flowRate),
      getCOPPeriod(device, '-7d', 'now', flowRate),
      getMorningWarmupStats(device, flowRate, poolVolume, regularTariff),
      getDefrostRate(device, 24),
      getSetpointAdherence(device, 24, 0.5),
      getCOPVsAmbientData(device, 7, flowRate),
    ]);

    // Calculate current COP
    const copNow = calculateCOP(
      currentMetrics.power || 0,
      currentMetrics.inletTemp || 0,
      currentMetrics.outletTemp || 0,
      flowRate
    );

    // Calculate heat delivered today
    const heatToday = energyToday * cop24h;

    // Calculate costs
    const electricalCost = (energyByTariff.regular * regularTariff) + (energyByTariff.low * lowTariff);
    const thermalCost = calculateThermalCost(electricalCost, heatToday);

    const response = {
      timestamp: new Date().toISOString(),
      device,
      performance: {
        cop: {
          now: copNow.cop,
          24h: cop24h,
          7d: cop7d,
          trend: cop24h > cop7d ? 'improving' : cop24h < cop7d ? 'degrading' : 'stable',
        },
        energy: {
          electricalToday: energyToday,
          heatDeliveredToday: heatToday,
          thermalCost: thermalCost,
        },
        morning: morningStats,
        efficiency: {
          avgThermalLift: calculateThermalLift(currentMetrics.poolTemp || 0, currentMetrics.ambientTemp || 0),
          defrostRate: defrostRate,
          setpointAdherence: setpointAdherence,
        },
      },
      timeSeries: {
        copVsAmbient: copVsAmbient,
      },
      settings: {
        flowRate,
        poolVolume,
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
    console.error('Error in performance API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

---

### Phase 2: Performance Hook (1 hour)

**File to create**: `hooks/use-performance-data.ts`

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';

interface PerformanceData {
  timestamp: string;
  device: string;
  performance: {
    cop: {
      now: number;
      24h: number;
      7d: number;
      trend: 'improving' | 'degrading' | 'stable';
    };
    energy: {
      electricalToday: number;
      heatDeliveredToday: number;
      thermalCost: number;
    };
    morning: {
      energyUsed: number;
      tempRise: number;
      avgCOP: number;
      cost: number;
      specificEnergy: number;
    };
    efficiency: {
      avgThermalLift: number;
      defrostRate: number;
      setpointAdherence: number;
    };
  };
  timeSeries: {
    copVsAmbient: Array<{
      ambient: number;
      cop: number;
      thermalLift: number;
      timestamp: string;
    }>;
  };
}

export function usePerformanceData(
  device: string,
  flowRate: number,
  poolVolume: number,
  regularTariff: number,
  lowTariff: number,
  refreshInterval: number = 60000
) {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams({
      device,
      flowRate: flowRate.toString(),
      poolVolume: poolVolume.toString(),
      regularTariff: regularTariff.toString(),
      lowTariff: lowTariff.toString(),
    });

    try {
      const response = await fetch(`/api/influx/performance?${params}`, {
        cache: 'no-store',
      });
      
      if (!response.ok) throw new Error('Failed to fetch performance data');
      
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [device, flowRate, poolVolume, regularTariff, lowTariff]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}
```

---

### Phase 3: Performance Dashboard Page (3-4 hours)

**File to create**: `app/performance/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { GrafanaPanel } from '@/components/dashboard/grafana-panel';
import { usePerformanceData } from '@/hooks/use-performance-data';
import { TrendingUp, Zap, Flame, DollarSign, Thermometer, Target } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PerformancePage() {
  const [flowRate, setFlowRate] = useState(100);
  const [poolVolume, setPoolVolume] = useState(200);
  
  const { data, loading, error } = usePerformanceData(
    'aloha_sensory_aquatics',
    flowRate,
    poolVolume,
    2.50,
    1.00,
    60000
  );

  if (loading && !data) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const perf = data?.performance;

  return (
    <div className="space-y-6">
      {/* Header with Settings */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Analysis</h1>
          <p className="text-muted-foreground">COP-focused efficiency dashboard</p>
        </div>
        <div className="flex gap-4">
          <Select value={flowRate.toString()} onValueChange={(v) => setFlowRate(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Flow Rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60">60 L/min</SelectItem>
              <SelectItem value="80">80 L/min</SelectItem>
              <SelectItem value="100">100 L/min</SelectItem>
              <SelectItem value="120">120 L/min</SelectItem>
              <SelectItem value="150">150 L/min</SelectItem>
            </SelectContent>
          </Select>
          <Select value={poolVolume.toString()} onValueChange={(v) => setPoolVolume(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Pool Volume" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="150">150 m³</SelectItem>
              <SelectItem value="200">200 m³</SelectItem>
              <SelectItem value="250">250 m³</SelectItem>
              <SelectItem value="300">300 m³</SelectItem>
              <SelectItem value="400">400 m³</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 1: 6 Headline KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="COP Now"
          value={perf?.cop.now || 0}
          icon={TrendingUp}
          threshold={{ green: 4.0, yellow: 3.0, red: 2.5 }}
          subtitle="Current efficiency"
        />
        <MetricCard
          title="COP 24h"
          value={perf?.cop['24h'] || 0}
          threshold={{ green: 4.0, yellow: 3.0, red: 2.5 }}
          subtitle="Daily average"
        />
        <MetricCard
          title="COP 7d"
          value={perf?.cop['7d'] || 0}
          threshold={{ green: 4.0, yellow: 3.0, red: 2.5 }}
          subtitle={perf?.cop.trend || 'stable'}
        />
        <MetricCard
          title="Elec Today"
          value={perf?.energy.electricalToday || 0}
          unit="kWh"
          icon={Zap}
          subtitle="Input energy"
        />
        <MetricCard
          title="Heat Today"
          value={perf?.energy.heatDeliveredToday || 0}
          unit="kWh-th"
          icon={Flame}
          subtitle="Output energy"
        />
        <MetricCard
          title="R/kWh-th"
          value={perf?.energy.thermalCost || 0}
          unit="R"
          icon={DollarSign}
          subtitle="True cost"
        />
      </div>

      {/* Row 2: Energy In vs Heat Out */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Energy In vs Heat Out</h2>
          <GrafanaPanel
            dashboardUid={process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA || ''}
            panelId={7}
            height={400}
            vars={{ flow_rate: flowRate.toString(), interval: '15m' }}
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">COP with Context</h2>
          <GrafanaPanel
            dashboardUid={process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA || ''}
            panelId={1}
            height={400}
          />
        </div>
      </div>

      {/* Row 3: Operations View */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Operating State</h2>
          <GrafanaPanel
            dashboardUid={process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA || ''}
            panelId={13}
            height={300}
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Flow & ΔT Watch</h2>
          <GrafanaPanel
            dashboardUid={process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA || ''}
            panelId={12}
            height={300}
          />
        </div>
      </div>

      {/* Row 4: Morning Warm-Up Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Morning Warm-Up (04:00-09:00)</h2>
        <div className="grid gap-4 md:grid-cols-5">
          <MetricCard
            title="Energy Used"
            value={perf?.morning.energyUsed || 0}
            unit="kWh"
            subtitle="Morning consumption"
          />
          <MetricCard
            title="Temp Rise"
            value={perf?.morning.tempRise || 0}
            unit="°C"
            subtitle="Pool heating"
          />
          <MetricCard
            title="Avg COP"
            value={perf?.morning.avgCOP || 0}
            threshold={{ green: 3.8, yellow: 3.0 }}
            subtitle="Morning efficiency"
          />
          <MetricCard
            title="Cost"
            value={perf?.morning.cost || 0}
            unit="R"
            subtitle="Morning spend"
          />
          <MetricCard
            title="Specific Energy"
            value={perf?.morning.specificEnergy || 0}
            unit="kWh/(m³·°C)"
            subtitle="Warm-up efficiency"
          />
        </div>
      </div>

      {/* Row 5: Efficiency Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Thermal Lift"
          value={perf?.efficiency.avgThermalLift || 0}
          unit="°C"
          threshold={{ green: 10, yellow: 15, red: 20 }}
          subtitle="Pool - Ambient"
        />
        <MetricCard
          title="Defrost Rate"
          value={perf?.efficiency.defrostRate || 0}
          unit="/hr"
          threshold={{ green: 2, yellow: 4, red: 6 }}
          subtitle="Events per hour"
        />
        <MetricCard
          title="Setpoint Adherence"
          value={perf?.efficiency.setpointAdherence || 0}
          unit="%"
          threshold={{ green: 95, yellow: 90 }}
          subtitle="Within ±0.5°C"
        />
      </div>

      {/* Row 6: Daily Bars */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Daily Performance (7 Days)</h2>
        <GrafanaPanel
          dashboardUid={process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA || ''}
          panelId={11}
          from="now-7d"
          to="now"
          height={350}
        />
      </div>
    </div>
  );
}
```

---

## 🚀 Quick Implementation Commands

To complete the implementation:

```bash
cd /Users/jacques/DevFolder/aquatemp/pool-dashboard

# Already created:
# lib/queries/performance-metrics.ts ✅

# Create remaining files:
# 1. API endpoint
# 2. Performance hook  
# 3. Performance page

# Test the new endpoint
curl "http://localhost:3001/api/influx/performance?device=aloha_sensory_aquatics&flowRate=100&poolVolume=200"

# Access new dashboard
# http://localhost:3001/performance
```

---

## 📊 Key Features Implemented

### Calculations
- ✅ Heat output (kW-thermal)
- ✅ R/kWh-thermal (true cost)
- ✅ Time-weighted COP (24h, 7d)
- ✅ Morning warm-up analysis
- ✅ Specific energy
- ✅ Defrost rate tracking
- ✅ Setpoint adherence

### API
- ⏳ Performance endpoint (needs creation)
- ⏳ Returns all metrics in single call

### UI
- ⏳ Performance page with 6 rows
- ⏳ 16+ panels total
- ⏳ Interactive selectors

---

## 📝 Next Steps

1. **Create API endpoint** (`app/api/influx/performance/route.ts`)
2. **Create performance hook** (`hooks/use-performance-data.ts`)
3. **Create performance page** (`app/performance/page.tsx`)
4. **Test with real data**
5. **Add to navigation**
6. **Create documentation**

---

## 🎯 Testing Checklist

- [ ] Performance API returns valid data
- [ ] COP calculations match expected values
- [ ] Morning warm-up stats show 04:00-09:00 data
- [ ] R/kWh-thermal provides meaningful cost metric
- [ ] Defrost rate tracks correctly
- [ ] Setpoint adherence calculates properly
- [ ] Page loads without errors
- [ ] Selectors update data
- [ ] Grafana panels embed correctly
- [ ] Auto-refresh works

---

**Status**: Phase 1 complete (performance metrics library created). Ready for Phase 2-3 implementation.
