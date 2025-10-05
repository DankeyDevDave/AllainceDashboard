'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  getSettings,
  saveSettings,
  resetSettings,
  DEFAULT_SETTINGS,
} from '@/lib/settings-storage';
import type { AppSettings } from '@/lib/types/admin';
import {
  poolConfigSchema,
  displayThresholdsSchema,
  dashboardPreferencesSchema,
  externalServicesSchema,
} from '@/lib/types/admin';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import { CurrencySettings } from '@/components/admin/currency-settings';
import { BillSettings } from '@/components/admin/bill-settings';
import { ModelSettings } from '@/components/admin/model-settings';
import { DeviceSettings } from '@/components/admin/device-settings';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSaveAll = () => {
    try {
      setLoading(true);
      console.log('Saving all settings:', settings);
      saveSettings(settings);
      console.log('Settings saved successfully');
      toast.success('All settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      console.log('Resetting settings to defaults');
      resetSettings();
      setSettings(DEFAULT_SETTINGS);
      console.log('Settings reset complete');
      toast.success('Settings reset to defaults');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings Management</h2>
          <p className="text-muted-foreground mt-2">
            Configure dashboard preferences, pool settings, and thresholds
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveAll} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pool" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="pool">Pool</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="pool" className="space-y-4">
          <PoolConfigForm
            data={settings.poolConfig}
            onSave={(data) => {
              setSettings({ ...settings, poolConfig: data });
              saveSettings({ ...settings, poolConfig: data });
              toast.success('Pool configuration saved');
            }}
          />
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <ThresholdsForm
            data={settings.displayThresholds}
            onSave={(data) => {
              setSettings({ ...settings, displayThresholds: data });
              saveSettings({ ...settings, displayThresholds: data });
              toast.success('Display thresholds saved');
            }}
          />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <PreferencesForm
            data={settings.dashboardPreferences}
            onSave={(data) => {
              setSettings({ ...settings, dashboardPreferences: data });
              saveSettings({ ...settings, dashboardPreferences: data });
              toast.success('Dashboard preferences saved');
            }}
          />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ExternalServicesForm
            data={settings.externalServices}
            onSave={(data) => {
              setSettings({ ...settings, externalServices: data });
              saveSettings({ ...settings, externalServices: data });
              toast.success('External services configuration saved');
            }}
          />
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <DeviceSettings
            devices={settings.deviceManagement?.devices || []}
            onSave={(devices) => {
              const updated = {
                ...settings,
                deviceManagement: {
                  ...settings.deviceManagement,
                  devices,
                },
              };
              setSettings(updated);
              saveSettings(updated);
              toast.success('Device configuration saved');
            }}
          />
        </TabsContent>

        <TabsContent value="currency" className="space-y-4">
          <CurrencySettings />
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          <BillSettings />
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <ModelSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PoolConfigForm({ data, onSave }: { data: any; onSave: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(poolConfigSchema),
    defaultValues: data,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pool Configuration</CardTitle>
        <CardDescription>
          Basic pool settings used for calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="poolVolume">Pool Volume (m³)</Label>
              <Input
                id="poolVolume"
                type="number"
                {...form.register('poolVolume', { valueAsNumber: true })}
              />
              {form.formState.errors.poolVolume && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.poolVolume.message || '')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="flowRate">Flow Rate (L/min)</Label>
              <Input
                id="flowRate"
                type="number"
                {...form.register('flowRate', { valueAsNumber: true })}
              />
              {form.formState.errors.flowRate && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.flowRate.message || "")}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deviceId">Device ID</Label>
              <Input
                id="deviceId"
                type="text"
                {...form.register('deviceId')}
              />
              {form.formState.errors.deviceId && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.deviceId.message || "")}
                </p>
              )}
            </div>
          </div>

          <Button type="submit">Save Pool Configuration</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ThresholdsForm({ data, onSave }: { data: any; onSave: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(displayThresholdsSchema),
    defaultValues: data,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Thresholds</CardTitle>
        <CardDescription>
          Configure warning levels for various metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Green = Good, Yellow = Warning, Red = Critical
            </AlertDescription>
          </Alert>

          {['cop', 'power', 'deltaT', 'thermalLift', 'dutyCycle'].map((metric) => (
            <div key={metric} className="space-y-3">
              <h4 className="font-medium capitalize">{metric.replace(/([A-Z])/g, ' $1')}</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <Label>Green (&gt;=)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register(`${metric}.green` as any, { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label>Yellow (&gt;=)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register(`${metric}.yellow` as any, { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label>Red (&lt;)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    {...form.register(`${metric}.red` as any, { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="submit">Save Thresholds</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PreferencesForm({ data, onSave }: { data: any; onSave: (data: any) => void }) {
  const form = useForm({
    resolver: zodResolver(dashboardPreferencesSchema),
    defaultValues: data,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Preferences</CardTitle>
        <CardDescription>
          Customize dashboard behavior and appearance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refreshInterval">Refresh Interval (ms)</Label>
            <Input
              id="refreshInterval"
              type="number"
              step="1000"
              {...form.register('refreshInterval', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              How often to refresh dashboard data (minimum 5000ms)
            </p>
          </div>

          <Button type="submit">Save Preferences</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ExternalServicesForm({ data, onSave }: { data: any; onSave: (data: any) => void }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResults, setTestResults] = React.useState<any>(null);

  const form = useForm({
    resolver: zodResolver(externalServicesSchema),
    defaultValues: data,
  });

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      const response = await fetch('/api/admin/settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'all',
          settings: form.getValues(),
        }),
      });

      const result = await response.json();
      setTestResults(result);

      if (result.allConnected) {
        toast.success('All services connected successfully');
      } else {
        toast.error('Some services failed to connect');
      }
    } catch (error) {
      toast.error('Failed to test connections');
      console.error(error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // Test connections before saving
      const testResponse = await fetch('/api/admin/settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'all',
          settings: values,
        }),
      });

      const testResult = await testResponse.json();

      if (!testResult.allConnected) {
        const confirmSave = window.confirm(
          'Some connections failed. Do you want to save anyway?'
        );
        if (!confirmSave) return;
      }

      // Save settings
      onSave(values);
      setIsEditing(false);
      toast.success('External services configuration saved');
    } catch (error) {
      toast.error('Failed to save configuration');
      console.error(error);
    }
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>External Services</CardTitle>
            <CardDescription>
              InfluxDB and Grafana connection settings
            </CardDescription>
          </div>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit Configuration
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults && (
              <Alert className={testResults.allConnected ? 'border-green-500' : 'border-red-500'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span>InfluxDB:</span>
                      <span className={testResults.influx?.connected ? 'text-green-600' : 'text-red-600'}>
                        {testResults.influx?.message}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Grafana:</span>
                      <span className={testResults.grafana?.connected ? 'text-green-600' : 'text-red-600'}>
                        {testResults.grafana?.message}
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-3">
              <div className="grid gap-1">
                <span className="text-sm font-medium">InfluxDB URL</span>
                <span className="text-sm text-muted-foreground">{data.influxDbUrl}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-sm font-medium">InfluxDB Organization</span>
                <span className="text-sm text-muted-foreground">{data.influxDbOrg}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-sm font-medium">InfluxDB Bucket</span>
                <span className="text-sm text-muted-foreground">{data.influxDbBucket}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-sm font-medium">Grafana URL</span>
                <span className="text-sm text-muted-foreground">{data.grafanaUrl}</span>
              </div>
            </div>
            <Button
              onClick={handleTestConnection}
              disabled={isTesting}
              variant="secondary"
              className="w-full"
            >
              {isTesting ? 'Testing...' : 'Test Connections'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>External Services</CardTitle>
        <CardDescription>
          Configure InfluxDB and Grafana connections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="influxDbUrl">InfluxDB URL</Label>
              <Input
                id="influxDbUrl"
                placeholder="http://localhost:8086"
                {...form.register('influxDbUrl')}
              />
              {form.formState.errors.influxDbUrl && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.influxDbUrl.message || "")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="influxDbToken">InfluxDB Token</Label>
              <Input
                id="influxDbToken"
                type="password"
                placeholder="Enter your InfluxDB token"
                {...form.register('influxDbToken')}
              />
              {form.formState.errors.influxDbToken && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.influxDbToken.message || "")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="influxDbOrg">InfluxDB Organization</Label>
              <Input
                id="influxDbOrg"
                placeholder="Organization ID"
                {...form.register('influxDbOrg')}
              />
              {form.formState.errors.influxDbOrg && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.influxDbOrg.message || "")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="influxDbBucket">InfluxDB Bucket</Label>
              <Input
                id="influxDbBucket"
                placeholder="homeassistant"
                {...form.register('influxDbBucket')}
              />
              {form.formState.errors.influxDbBucket && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.influxDbBucket.message || "")}
                </p>
              )}
            </div>

            <div className="w-full h-px bg-border my-4" />

            <div className="space-y-2">
              <Label htmlFor="grafanaUrl">Grafana URL</Label>
              <Input
                id="grafanaUrl"
                placeholder="http://localhost:3000"
                {...form.register('grafanaUrl')}
              />
              {form.formState.errors.grafanaUrl && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.grafanaUrl.message || "")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grafanaDashboardUidAloha">Grafana Dashboard UID (Aloha)</Label>
              <Input
                id="grafanaDashboardUidAloha"
                placeholder="Dashboard UID for Aloha"
                {...form.register('grafanaDashboardUidAloha')}
              />
              {form.formState.errors.grafanaDashboardUidAloha && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.grafanaDashboardUidAloha.message || "")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grafanaDashboardUidGeneral">Grafana Dashboard UID (General)</Label>
              <Input
                id="grafanaDashboardUidGeneral"
                placeholder="Dashboard UID for General"
                {...form.register('grafanaDashboardUidGeneral')}
              />
              {form.formState.errors.grafanaDashboardUidGeneral && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.grafanaDashboardUidGeneral.message || "")}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save Configuration</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
