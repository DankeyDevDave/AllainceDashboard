'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Power, PowerOff, AlertCircle, CheckCircle } from 'lucide-react';
import type { SonoffDevice, DeviceType } from '@/lib/types/devices';
import { sonoffDeviceSchema } from '@/lib/types/devices';

interface DeviceSettingsProps {
  devices: SonoffDevice[];
  onSave: (devices: SonoffDevice[]) => void;
}

const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: 'pool_pump', label: 'Pool Pump' },
  { value: 'power_monitor', label: 'Power Monitor' },
  { value: 'filter', label: 'Filter System' },
  { value: 'heater', label: 'Heater' },
  { value: 'other', label: 'Other' },
];

export function DeviceSettings({ devices, onSave }: DeviceSettingsProps) {
  const [editingDevice, setEditingDevice] = useState<SonoffDevice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testingDevice, setTestingDevice] = useState<string | null>(null);

  const form = useForm<SonoffDevice>({
    resolver: zodResolver(sonoffDeviceSchema),
    defaultValues: {
      id: '',
      name: '',
      entityId: '',
      type: 'power_monitor',
      enabled: true,
      description: '',
    },
  });

  const handleAdd = () => {
    form.reset({
      id: crypto.randomUUID(),
      name: '',
      entityId: '',
      type: 'power_monitor',
      enabled: true,
      description: '',
      createdAt: new Date().toISOString(),
    });
    setEditingDevice(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (device: SonoffDevice) => {
    form.reset(device);
    setEditingDevice(device);
    setIsDialogOpen(true);
  };

  const handleDelete = (deviceId: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      const updated = devices.filter((d) => d.id !== deviceId);
      onSave(updated);
      toast.success('Device deleted');
    }
  };

  const handleToggleEnabled = (deviceId: string) => {
    const updated = devices.map((d) =>
      d.id === deviceId ? { ...d, enabled: !d.enabled } : d
    );
    onSave(updated);
    toast.success('Device status updated');
  };

  const handleTestConnection = async (device: SonoffDevice) => {
    setTestingDevice(device.id);
    try {
      const response = await fetch('/api/devices/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: device.entityId }),
      });

      const result = await response.json();

      if (result.connected && result.hasData) {
        toast.success(
          `Connected! Last value: ${result.lastValue}W at ${new Date(result.lastUpdate).toLocaleTimeString()}`
        );
      } else if (result.connected) {
        toast.warning('Connected but no recent data found');
      } else {
        toast.error(result.message || 'Connection failed');
      }
    } catch (error) {
      toast.error('Failed to test connection');
      console.error(error);
    } finally {
      setTestingDevice(null);
    }
  };

  const onSubmit = form.handleSubmit((data) => {
    const updated = editingDevice
      ? devices.map((d) => (d.id === editingDevice.id ? { ...data, updatedAt: new Date().toISOString() } : d))
      : [...devices, { ...data, createdAt: new Date().toISOString() }];

    onSave(updated);
    setIsDialogOpen(false);
    toast.success(editingDevice ? 'Device updated' : 'Device added');
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sonoff Devices</CardTitle>
              <CardDescription>
                Manage pool equipment monitoring via Home Assistant eWeLink integration
              </CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Power className="mx-auto h-12 w-12 opacity-50 mb-4" />
              <p>No devices configured</p>
              <p className="text-sm mt-2">Add your first Sonoff device to start monitoring</p>
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div>
                      {device.enabled ? (
                        <Power className="h-5 w-5 text-green-500" />
                      ) : (
                        <PowerOff className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{device.name}</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          {DEVICE_TYPES.find((t) => t.value === device.type)?.label}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Entity: {device.entityId}
                      </div>
                      {device.description && (
                        <div className="text-sm text-muted-foreground">
                          {device.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(device)}
                      disabled={testingDevice === device.id}
                    >
                      {testingDevice === device.id ? 'Testing...' : 'Test'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleEnabled(device.id)}
                    >
                      {device.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(device)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(device.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDevice ? 'Edit Device' : 'Add New Device'}
            </DialogTitle>
            <DialogDescription>
              Configure a Sonoff device for power monitoring via Home Assistant
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Device Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Pool Pump"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.name.message || "")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityId">Home Assistant Entity ID *</Label>
              <Input
                id="entityId"
                placeholder="e.g., sensor.sonoff_pool_pump_power"
                {...form.register('entityId')}
              />
              {form.formState.errors.entityId && (
                <p className="text-sm text-red-500">
                  {String(form.formState.errors.entityId.message || "")}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Find this in Home Assistant under Developer Tools → States
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Device Type *</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value: DeviceType) => form.setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Main pool circulation pump"
                {...form.register('description')}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingDevice ? 'Update Device' : 'Add Device'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
