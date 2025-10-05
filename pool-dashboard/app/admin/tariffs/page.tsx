'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  getTariffConfig,
  saveTariffConfig,
  resetTariffConfig,
  getCurrentTariff,
  DEFAULT_TARIFF_CONFIG,
} from '@/lib/settings-storage';
import type { TariffConfig, TariffPeriod } from '@/lib/types/admin';
import { tariffPeriodSchema } from '@/lib/types/admin';
import { getCurrencyConfig } from '@/lib/currency-manager';
import { getCurrencyIcon } from '@/lib/currency-icons';
import {
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TariffsPage() {
  const [config, setConfig] = useState<TariffConfig>(DEFAULT_TARIFF_CONFIG);
  const [currentRate, setCurrentRate] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get currency icon based on configured currency
  const currencyConfig = getCurrencyConfig();
  const CurrencyIcon = getCurrencyIcon(currencyConfig.code);

  useEffect(() => {
    const loaded = getTariffConfig();
    setConfig(loaded);
    setCurrentRate(getCurrentTariff(loaded));
  }, []);

  const handleSave = () => {
    try {
      setLoading(true);
      saveTariffConfig(config);
      setCurrentRate(getCurrentTariff(config));
      toast.success('Tariff configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save tariff configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all tariff settings to defaults?')) {
      resetTariffConfig();
      setConfig(DEFAULT_TARIFF_CONFIG);
      setCurrentRate(getCurrentTariff(DEFAULT_TARIFF_CONFIG));
      toast.success('Tariff configuration reset to defaults');
    }
  };

  const handleAddPeriod = () => {
    const newPeriod: TariffPeriod = {
      id: `period-${Date.now()}`,
      name: 'New Period',
      pricePerKwh: 1.50,
      startTime: '00:00',
      endTime: '06:00',
      daysOfWeek: [1, 2, 3, 4, 5],
      isActive: true,
    };

    setConfig({
      ...config,
      periods: [...config.periods, newPeriod],
    });
  };

  const handleDeletePeriod = (id: string) => {
    if (confirm('Delete this tariff period?')) {
      setConfig({
        ...config,
        periods: config.periods.filter(p => p.id !== id),
      });
    }
  };

  const handleUpdatePeriod = (id: string, updates: Partial<TariffPeriod>) => {
    setConfig({
      ...config,
      periods: config.periods.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    });
  };

  const handleToggleDay = (periodId: string, day: number) => {
    const period = config.periods.find(p => p.id === periodId);
    if (!period) return;

    const newDays = period.daysOfWeek.includes(day)
      ? period.daysOfWeek.filter(d => d !== day)
      : [...period.daysOfWeek, day].sort();

    handleUpdatePeriod(periodId, { daysOfWeek: newDays });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tariff Configuration</h2>
          <p className="text-muted-foreground mt-2">
            Configure electricity pricing periods and schedules
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save All
          </Button>
        </div>
      </div>

      {/* Current Rate */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500 p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Tariff Rate</p>
                <p className="text-3xl font-bold">
                  {config.currency}{currentRate.toFixed(config.decimalPlaces)}
                  <span className="text-lg text-muted-foreground ml-1">/kWh</span>
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Active now</p>
              <p className="font-medium">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>Configure currency symbol and precision</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency Symbol</Label>
              <Input
                id="currency"
                value={config.currency}
                onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                maxLength={3}
                placeholder="R, $, €, £"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="decimal">Decimal Places</Label>
              <Input
                id="decimal"
                type="number"
                min={0}
                max={4}
                value={config.decimalPlaces}
                onChange={(e) =>
                  setConfig({ ...config, decimalPlaces: parseInt(e.target.value) || 2 })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tariff Periods */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tariff Periods</h3>
          <Button onClick={handleAddPeriod} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Period
          </Button>
        </div>

        {config.periods.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No tariff periods configured. Add at least one period to calculate costs.
            </AlertDescription>
          </Alert>
        )}

        {config.periods.map((period, index) => (
          <Card key={period.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      period.isActive ? 'bg-green-500/10' : 'bg-gray-500/10'
                    }`}
                  >
                    {period.isActive ? (
                      <Clock className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <Input
                      value={period.name}
                      onChange={(e) => handleUpdatePeriod(period.id, { name: e.target.value })}
                      className="font-semibold text-base border-none p-0 h-auto focus-visible:ring-0"
                    />
                    <p className="text-sm text-muted-foreground">
                      {period.startTime} - {period.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpdatePeriod(period.id, { isActive: !period.isActive })}
                  >
                    {period.isActive ? 'Active' : 'Inactive'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDeletePeriod(period.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Price per kWh</Label>
                  <div className="flex items-center gap-2">
                    <CurrencyIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      value={period.pricePerKwh}
                      onChange={(e) =>
                        handleUpdatePeriod(period.id, {
                          pricePerKwh: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={period.startTime}
                    onChange={(e) => handleUpdatePeriod(period.id, { startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={period.endTime}
                    onChange={(e) => handleUpdatePeriod(period.id, { endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Active Days</Label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map((day, index) => (
                    <Button
                      key={index}
                      variant={period.daysOfWeek.includes(index) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleDay(period.id, index)}
                      className="w-12"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
