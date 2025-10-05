'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  getCurrencyConfig,
  saveCurrencyConfig,
  formatCurrency,
  AVAILABLE_CURRENCIES,
  DEFAULT_CURRENCY,
} from '@/lib/currency-manager';
import { getCurrencyIcon } from '@/lib/currency-icons';
import type { CurrencyConfig } from '@/lib/types/admin';
import { currencyConfigSchema } from '@/lib/types/admin';
import { Check } from 'lucide-react';

export function CurrencySettings() {
  const [config, setConfig] = useState<CurrencyConfig>(DEFAULT_CURRENCY);
  const [previewAmount] = useState(1234.56);

  useEffect(() => {
    setConfig(getCurrencyConfig());
  }, []);

  const form = useForm<CurrencyConfig>({
    resolver: zodResolver(currencyConfigSchema),
    values: config,
  });

  const handleSave = (values: CurrencyConfig) => {
    try {
      saveCurrencyConfig(values);
      setConfig(values);
      toast.success('Currency configuration saved');

      // Trigger page refresh to update all currency displays
      window.dispatchEvent(new CustomEvent('currency-changed'));
    } catch (error) {
      toast.error('Failed to save currency configuration');
      console.error(error);
    }
  };

  const handleCurrencySelect = (code: string) => {
    const selected = AVAILABLE_CURRENCIES.find(c => c.code === code);
    if (selected) {
      form.setValue('code', selected.code);
      form.setValue('symbol', selected.symbol);
      form.setValue('decimals', selected.defaultDecimals);
    }
  };

  const watchedValues = form.watch();
  const formattedPreview = React.useMemo(() => {
    try {
      return formatCurrency(previewAmount, watchedValues);
    } catch {
      return 'Invalid configuration';
    }
  }, [watchedValues, previewAmount]);

  // Get dynamic currency icon based on current config
  const CurrencyIcon = getCurrencyIcon(config.code);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CurrencyIcon className="h-5 w-5" />
          <CardTitle>Currency Configuration</CardTitle>
        </div>
        <CardDescription>
          Configure currency display and formatting for all cost calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          {/* Quick Currency Selection */}
          <div className="space-y-2">
            <Label>Quick Select Currency</Label>
            <Select onValueChange={handleCurrencySelect} value={form.watch('code')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_CURRENCIES.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Preview</div>
              <div className="text-2xl font-bold mt-2">{formattedPreview}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Sample amount: {previewAmount}
              </div>
            </AlertDescription>
          </Alert>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Advanced Formatting</h4>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="symbol">Currency Symbol</Label>
                <Input
                  id="symbol"
                  {...form.register('symbol')}
                  placeholder="$"
                />
                {form.formState.errors.symbol && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.symbol.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Symbol Position</Label>
                <Select
                  onValueChange={(value) => form.setValue('position', value as 'before' | 'after')}
                  value={form.watch('position')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before ($100)</SelectItem>
                    <SelectItem value="after">After (100€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decimals">Decimal Places</Label>
                <Input
                  id="decimals"
                  type="number"
                  min="0"
                  max="4"
                  {...form.register('decimals', { valueAsNumber: true })}
                />
                {form.formState.errors.decimals && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.decimals.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="thousandSeparator">Thousand Separator</Label>
                <Input
                  id="thousandSeparator"
                  {...form.register('thousandSeparator')}
                  placeholder=","
                  maxLength={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="decimalSeparator">Decimal Separator</Label>
                <Input
                  id="decimalSeparator"
                  {...form.register('decimalSeparator')}
                  placeholder="."
                  maxLength={1}
                />
              </div>
            </div>
          </div>

          <Button type="submit">Save Currency Configuration</Button>
        </form>
      </CardContent>
    </Card>
  );
}
