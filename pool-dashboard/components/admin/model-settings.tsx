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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  getAvailableModels,
  getSelectedModel,
  selectModel,
  addCustomModel,
  deleteCustomModel,
  calculateModelCOP,
  getPerformanceCurve,
} from '@/lib/model-manager';
import type { HeatPumpModel } from '@/lib/types/admin';
import { heatPumpModelSchema } from '@/lib/types/admin';
import { Settings, Plus, Trash2, TrendingUp, AlertCircle, Check } from 'lucide-react';
import { z } from 'zod';

// Schema for the add model form (without id and isCustom)
const addModelSchema = heatPumpModelSchema.omit({ id: true, isCustom: true });

export function ModelSettings() {
  const [models, setModels] = useState<HeatPumpModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = () => {
    const availableModels = getAvailableModels();
    setModels(availableModels);

    const selected = getSelectedModel();
    if (selected) {
      setSelectedModelId(selected.id);
    }
  };

  const handleSelectModel = (modelId: string) => {
    try {
      selectModel(modelId);
      setSelectedModelId(modelId);
      toast.success('Model selected successfully');
    } catch (error) {
      toast.error('Failed to select model');
      console.error(error);
    }
  };

  const handleDeleteModel = (modelId: string) => {
    if (!confirm('Are you sure you want to delete this custom model?')) return;

    try {
      deleteCustomModel(modelId);
      toast.success('Custom model deleted');
      loadModels();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete model');
      console.error(error);
    }
  };

  const selectedModel = models.find(m => m.id === selectedModelId);

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Heat Pump Model</CardTitle>
            </div>
            <AddModelDialog onModelAdded={loadModels} />
          </div>
          <CardDescription>
            Select your heat pump model for accurate COP calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Model</Label>
            <Select value={selectedModelId} onValueChange={handleSelectModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.manufacturer} {model.model}
                    {model.isCustom && ' (Custom)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedModel && (
            <div className="mt-4 p-4 rounded-lg border bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {selectedModel.manufacturer} {selectedModel.model}
                </h4>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {selectedModel.type.replace('-', ' ')}
                  </Badge>
                  {selectedModel.isCustom && (
                    <Badge variant="outline">Custom</Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Rated Power:</span>
                  <div className="font-medium">{selectedModel.specifications.ratedPower} kW</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Rated COP:</span>
                  <div className="font-medium">{selectedModel.specifications.ratedCop}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Operating Range:</span>
                  <div className="font-medium">
                    {selectedModel.specifications.minOperatingTemp}°C to{' '}
                    {selectedModel.specifications.maxOperatingTemp}°C
                  </div>
                </div>
              </div>

              {selectedModel.isCustom && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteModel(selectedModel.id)}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Custom Model
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Curve Preview */}
      {selectedModel && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>Performance Curve</CardTitle>
            </div>
            <CardDescription>
              COP vs Ambient Temperature for {selectedModel.manufacturer} {selectedModel.model}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Performance curve visualization will be displayed here.
                The model calculates COP based on ambient temperature using linear interpolation.
              </AlertDescription>
            </Alert>

            {/* Simple text representation of curve */}
            <div className="mt-4 space-y-2">
              <h5 className="font-medium text-sm">Key Performance Points:</h5>
              {selectedModel.specifications.copCurve?.slice(0, 5).map((point, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {point.ambientTemp}°C
                  </span>
                  <span className="font-medium">COP: {point.cop}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Models List */}
      {models.some(m => m.isCustom) && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Models</CardTitle>
            <CardDescription>
              Your custom heat pump models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {models.filter(m => m.isCustom).map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">
                      {model.manufacturer} {model.model}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {model.specifications.ratedPower} kW, COP {model.specifications.ratedCop}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedModelId === model.id && (
                      <Badge variant="default">
                        <Check className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModel(model.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AddModelDialog({ onModelAdded }: { onModelAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(addModelSchema),
    defaultValues: {
      manufacturer: '',
      model: '',
      type: 'air-source' as const,
      specifications: {
        ratedPower: 10,
        minPower: 2,
        maxPower: 12,
        ratedCop: 4.5,
        minOperatingTemp: -5,
        maxOperatingTemp: 45,
        flowRateMin: 50,
        flowRateMax: 200,
        copCurve: [
          { ambientTemp: -5, cop: 2.5 },
          { ambientTemp: 20, cop: 4.5 },
          { ambientTemp: 40, cop: 3.8 },
        ],
      },
    },
  });

  const handleSubmit = (values: z.infer<typeof addModelSchema>) => {
    try {
      addCustomModel(values);
      toast.success('Custom model added successfully');
      form.reset();
      setIsOpen(false);
      onModelAdded();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add model');
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Model
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Custom Heat Pump Model</DialogTitle>
          <DialogDescription>
            Enter specifications for your custom heat pump model
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                {...form.register('manufacturer')}
                placeholder="AquaTemp"
              />
              {form.formState.errors.manufacturer && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.manufacturer.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                {...form.register('model')}
                placeholder="X100"
              />
              {form.formState.errors.model && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.model.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="type">Type</Label>
              <Select
                onValueChange={(value) => form.setValue('type', value as any)}
                value={form.watch('type')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="air-source">Air Source</SelectItem>
                  <SelectItem value="water-source">Water Source</SelectItem>
                  <SelectItem value="ground-source">Ground Source</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ratedPower">Rated Power (kW)</Label>
              <Input
                id="ratedPower"
                type="number"
                step="0.1"
                {...form.register('specifications.ratedPower', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ratedCop">Rated COP</Label>
              <Input
                id="ratedCop"
                type="number"
                step="0.1"
                {...form.register('specifications.ratedCop', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPower">Min Power (kW)</Label>
              <Input
                id="minPower"
                type="number"
                step="0.1"
                {...form.register('specifications.minPower', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPower">Max Power (kW)</Label>
              <Input
                id="maxPower"
                type="number"
                step="0.1"
                {...form.register('specifications.maxPower', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOperatingTemp">Min Operating Temp (°C)</Label>
              <Input
                id="minOperatingTemp"
                type="number"
                {...form.register('specifications.minOperatingTemp', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxOperatingTemp">Max Operating Temp (°C)</Label>
              <Input
                id="maxOperatingTemp"
                type="number"
                {...form.register('specifications.maxOperatingTemp', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flowRateMin">Min Flow Rate (L/min)</Label>
              <Input
                id="flowRateMin"
                type="number"
                {...form.register('specifications.flowRateMin', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flowRateMax">Max Flow Rate (L/min)</Label>
              <Input
                id="flowRateMax"
                type="number"
                {...form.register('specifications.flowRateMax', { valueAsNumber: true })}
              />
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              COP curve values are pre-filled with default values. You can customize these
              after initial creation by editing the model configuration.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button type="submit">Add Model</Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
