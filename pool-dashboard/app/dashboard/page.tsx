'use client';

import { MetricCard } from '@/components/dashboard/metric-card';
import { GrafanaPanel } from '@/components/dashboard/grafana-panel';
import { useInfluxData } from '@/hooks/use-influx-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Zap, 
  Battery, 
  Gauge, 
  Thermometer, 
  TrendingUp, 
  DollarSign,
  Timer,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { THRESHOLDS } from '@/lib/types/dashboard';

export default function DashboardPage() {
  const { data, loading, error, lastUpdate } = useInfluxData<any>(
    '/api/influx/current?device=aloha_sensory_aquatics&flowRate=100'
  );

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load dashboard data. Please check your InfluxDB connection.
          <br />
          <code className="text-xs mt-2 block">{error.message}</code>
        </AlertDescription>
      </Alert>
    );
  }

  const metrics = data?.metrics || {};
  const calculated = data?.calculated || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pool Heat Pump Dashboard</h1>
          <p className="text-muted-foreground">
            Aloha Sensory Aquatics - Real-time monitoring
          </p>
        </div>
        {lastUpdate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Power Now"
          value={metrics.power || 0}
          unit="kW"
          icon={Zap}
          threshold={THRESHOLDS.power}
          subtitle="Current draw"
        />
        
        <MetricCard
          title="COP"
          value={calculated.cop?.cop || 0}
          icon={TrendingUp}
          threshold={THRESHOLDS.cop}
          subtitle="Efficiency"
        />
        
        <MetricCard
          title="Energy Today"
          value={metrics.energyToday || 0}
          unit="kWh"
          icon={Battery}
          subtitle="Daily consumption"
        />
        
        <MetricCard
          title="Cost Today"
          value={calculated.costToday || 0}
          unit="R"
          icon={DollarSign}
          subtitle="Electricity cost"
        />
        
        <MetricCard
          title="Pool Temp"
          value={metrics.poolTemp || 0}
          unit="°C"
          icon={Thermometer}
          subtitle="Current temperature"
        />
        
        <MetricCard
          title="Runtime Today"
          value={metrics.runtimeToday || 0}
          unit="hrs"
          icon={Timer}
          subtitle={`${calculated.dutyCycle || 0}% duty cycle`}
        />
      </div>

      {/* Performance Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Water ΔT"
          value={calculated.cop?.deltaT || 0}
          unit="°C"
          icon={Gauge}
          threshold={THRESHOLDS.deltaT}
          subtitle="Heating effectiveness"
        />
        
        <MetricCard
          title="Thermal Lift"
          value={calculated.thermalLift || 0}
          unit="°C"
          threshold={THRESHOLDS.thermalLift}
          subtitle="Pool - Ambient"
        />
        
        <MetricCard
          title="Compressor Freq"
          value={metrics.compressorFreq || 0}
          unit="Hz"
          subtitle="Current frequency"
        />
        
        <MetricCard
          title="Heat Output"
          value={calculated.cop?.heatOutputKW || 0}
          unit="kW"
          subtitle="Thermal power"
        />
      </div>

      {/* Grafana Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Power Consumption (24h)</h2>
          <GrafanaPanel
            dashboardUid={process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA || ''}
            panelId={7}
            height={350}
            vars={{
              flow_rate: '100',
              interval: '15m',
            }}
          />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Temperature Monitoring</h2>
          <GrafanaPanel
            dashboardUid={process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA || ''}
            panelId={8}
            height={350}
            vars={{
              interval: '5m',
            }}
          />
        </div>
      </div>

      {/* Daily Energy Chart */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Daily Energy - Last 7 Days</h2>
        <GrafanaPanel
          dashboardUid={process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA || ''}
          panelId={11}
          from="now-7d"
          to="now"
          height={300}
        />
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Operating Mode</h3>
          <p className="text-2xl font-bold">{metrics.mode || 'Unknown'}</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Ambient Temp</h3>
          <p className="text-2xl font-bold">{(metrics.ambientTemp || 0).toFixed(1)}°C</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Inlet/Outlet</h3>
          <p className="text-2xl font-bold">
            {(metrics.inletTemp || 0).toFixed(1)}°C / {(metrics.outletTemp || 0).toFixed(1)}°C
          </p>
        </div>
      </div>
    </div>
  );
}
