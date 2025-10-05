'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { DeviceStatusCard } from '@/components/dashboard/device-status-card';
import { GrafanaPanel } from '@/components/dashboard/grafana-panel';
import { useInfluxData } from '@/hooks/use-influx-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Zap,
  Battery,
  Gauge,
  Thermometer,
  TrendingUp,
  Timer,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { THRESHOLDS } from '@/lib/types/dashboard';
import { getCurrencyConfig, formatCurrency } from '@/lib/currency-manager';
import { getCurrencyIcon } from '@/lib/currency-icons';
import type { CurrencyConfig } from '@/lib/types/admin';
import type { CombinedMetrics } from '@/lib/types/devices';

interface InfluxData {
  metrics: {
    power?: number;
    energyToday?: number;
    poolTemp?: number;
    runtimeToday?: number;
    compressorFreq?: number;
    mode?: string;
    ambientTemp?: number;
    inletTemp?: number;
    outletTemp?: number;
  };
  calculated: {
    cop?: {
      cop?: number;
      deltaT?: number;
      heatOutputKW?: number;
    };
    costToday?: number;
    dutyCycle?: number;
    thermalLift?: number;
  };
  devices?: CombinedMetrics;
}

export default function DashboardPage() {
  const { data, loading, error, lastUpdate } = useInfluxData<InfluxData>(
    '/api/influx/current?device=aloha_sensory_aquatics&flowRate=100'
  );

  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig | null>(null);

  useEffect(() => {
    // Load currency config on mount
    setCurrencyConfig(getCurrencyConfig());

    // Listen for currency changes
    const handleCurrencyChange = () => {
      setCurrencyConfig(getCurrencyConfig());
    };

    window.addEventListener('currency-changed', handleCurrencyChange);
    return () => window.removeEventListener('currency-changed', handleCurrencyChange);
  }, []);

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

  // Get dynamic currency icon
  const CurrencyIcon = currencyConfig
    ? getCurrencyIcon(currencyConfig.code)
    : getCurrencyIcon('USD'); // Default to USD icon

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
          lastUpdated={lastUpdate}
        />
        
        <MetricCard
          title="COP"
          value={calculated.cop?.cop || 0}
          icon={TrendingUp}
          threshold={THRESHOLDS.cop}
          subtitle="Efficiency"
          lastUpdated={lastUpdate}
        />
        
        <MetricCard
          title="Energy Today"
          value={metrics.energyToday || 0}
          unit="kWh"
          icon={Battery}
          subtitle="Daily consumption"
          lastUpdated={lastUpdate}
        />
        
        <MetricCard
          title="Cost Today"
          value={currencyConfig ? formatCurrency(calculated.costToday || 0, currencyConfig) : `${calculated.costToday || 0}`}
          icon={CurrencyIcon}
          subtitle="Electricity cost"
          lastUpdated={lastUpdate}
        />
        
        <MetricCard
          title="Pool Temp"
          value={metrics.poolTemp || 0}
          unit="°C"
          icon={Thermometer}
          subtitle="Current temperature"
          lastUpdated={lastUpdate}
        />
        
        <MetricCard
          title="Runtime Today"
          value={metrics.runtimeToday || 0}
          unit="hrs"
          icon={Timer}
          subtitle={`${calculated.dutyCycle || 0}% duty cycle`}
          lastUpdated={lastUpdate}
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
          lastUpdated={lastUpdate}
        />

        <MetricCard
          title="Thermal Lift"
          value={calculated.thermalLift || 0}
          unit="°C"
          threshold={THRESHOLDS.thermalLift}
          subtitle="Pool - Ambient"
          lastUpdated={lastUpdate}
        />

        <MetricCard
          title="Compressor Freq"
          value={metrics.compressorFreq || 0}
          unit="Hz"
          subtitle="Current frequency"
          lastUpdated={lastUpdate}
        />

        <MetricCard
          title="Heat Output"
          value={calculated.cop?.heatOutputKW || 0}
          unit="kW"
          subtitle="Thermal power"
          lastUpdated={lastUpdate}
        />
      </div>

      {/* Device Status - only show if devices are configured */}
      {data?.devices && data.devices.devices.length > 0 && (
        <DeviceStatusCard
          combinedMetrics={data.devices}
          currency={currencyConfig?.symbol || 'R'}
        />
      )}

      {/* Grafana Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Power Consumption (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <GrafanaPanel
              dashboardUid={process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA || ''}
              panelId={7}
              height={350}
              vars={{
                flow_rate: '100',
                interval: '15m',
              }}
            />
          </CardContent>
          {lastUpdate && (
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </CardFooter>
          )}
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Temperature Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <GrafanaPanel
              dashboardUid={process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA || ''}
              panelId={8}
              height={350}
              vars={{
                interval: '5m',
              }}
            />
          </CardContent>
          {lastUpdate && (
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Daily Energy Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Energy - Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <GrafanaPanel
            dashboardUid={process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA || ''}
            panelId={11}
            from="now-7d"
            to="now"
            height={300}
          />
        </CardContent>
        {lastUpdate && (
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </CardFooter>
        )}
      </Card>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Operating Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.mode || 'Unknown'}</p>
          </CardContent>
          {lastUpdate && (
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </CardFooter>
          )}
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Ambient Temp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(metrics.ambientTemp || 0).toFixed(1)}°C</p>
          </CardContent>
          {lastUpdate && (
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </CardFooter>
          )}
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Inlet/Outlet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(metrics.inletTemp || 0).toFixed(1)}°C / {(metrics.outletTemp || 0).toFixed(1)}°C
            </p>
          </CardContent>
          {lastUpdate && (
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
