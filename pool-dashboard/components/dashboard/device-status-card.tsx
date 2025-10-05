'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, PowerOff, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import type { CombinedMetrics } from '@/lib/types/devices';
import { formatCost, formatPower, formatEnergy } from '@/lib/queries/device-calculations';

interface DeviceStatusCardProps {
  combinedMetrics: CombinedMetrics;
  currency?: string;
}

export function DeviceStatusCard({ combinedMetrics, currency = 'R' }: DeviceStatusCardProps) {
  const { totalPower, totalEnergyToday, totalCost, devices, costBreakdown, powerBreakdown } = combinedMetrics;

  // Count active devices
  const activeDevices = devices.filter(d => d.state === 'on').length;
  const totalDevices = devices.length;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pool System Power</CardTitle>
              <CardDescription>
                {activeDevices} of {totalDevices} devices active
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {activeDevices > 0 ? (
                <Power className="h-5 w-5 text-green-500" />
              ) : (
                <PowerOff className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-2xl font-bold">{formatPower(totalPower)}</div>
              <p className="text-xs text-muted-foreground">Total Power</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatEnergy(totalEnergyToday)}</div>
              <p className="text-xs text-muted-foreground">Energy Today</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCost(totalCost, currency)}</div>
              <p className="text-xs text-muted-foreground">Cost Today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>Daily energy costs by component</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Heat Pump</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{formatCost(costBreakdown.heatPump, currency)}</span>
                <span className="text-xs text-muted-foreground">
                  ({powerBreakdown.heatPumpPercent.toFixed(0)}%)
                </span>
              </div>
            </div>

            {combinedMetrics.poolPump && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-sm">Pool Pump</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatCost(costBreakdown.poolPump, currency)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({powerBreakdown.poolPumpPercent.toFixed(0)}%)
                  </span>
                </div>
              </div>
            )}

            {costBreakdown.otherDevices > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm">Other Devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatCost(costBreakdown.otherDevices, currency)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({powerBreakdown.otherDevicesPercent.toFixed(0)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual Devices */}
      {devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
            <CardDescription>Individual device power and cost</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      {device.state === 'on' ? (
                        <Power className="h-4 w-4 text-green-500" />
                      ) : device.state === 'error' ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <PowerOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{device.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {device.type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatPower(device.power)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatEnergy(device.energyToday)} • {formatCost(device.cost, currency)}
                    </div>
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
