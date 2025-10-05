import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getServerSettings,
  saveServerSettings,
  testInfluxConnection,
  testGrafanaConnection
} from '@/lib/settings-server';
import {
  poolConfigSchema,
  displayThresholdsSchema,
  dashboardPreferencesSchema,
  externalServicesSchema,
  currencyConfigSchema,
  billProviderSchema,
  heatPumpModelSchema
} from '@/lib/types/admin';
import { z } from 'zod';

// Combined validation schema
const settingsUpdateSchema = z.object({
  poolConfig: poolConfigSchema.optional(),
  displayThresholds: displayThresholdsSchema.optional(),
  dashboardPreferences: dashboardPreferencesSchema.optional(),
  externalServices: externalServicesSchema.optional(),
  currency: currencyConfigSchema.optional(),
  billProvider: billProviderSchema.optional(),
  models: z.object({
    selected: z.string().optional(),
    available: z.array(heatPumpModelSchema).optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getServerSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = settingsUpdateSchema.parse(body);

    // If external services are being updated, test connections first
    if (validatedData.externalServices) {
      const testConnections = request.nextUrl.searchParams.get('testConnections') === 'true';

      if (testConnections) {
        const influxOk = await testInfluxConnection(validatedData.externalServices);
        const grafanaOk = await testGrafanaConnection(validatedData.externalServices.grafanaUrl);

        if (!influxOk || !grafanaOk) {
          return NextResponse.json({
            error: 'Connection test failed',
            details: {
              influx: influxOk,
              grafana: grafanaOk,
            }
          }, { status: 400 });
        }
      }

      // TODO: Clear InfluxDB client cache when settings change
      // clearClientCache();
    }

    // Save settings
    await saveServerSettings(validatedData as any);

    // Return updated settings
    const updatedSettings = await getServerSettings();
    return NextResponse.json(updatedSettings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reset to defaults (this will use env vars as fallback)
    await saveServerSettings({});
    // TODO: clearClientCache();

    return NextResponse.json({ message: 'Settings reset to defaults' });
  } catch (error) {
    console.error('Error resetting settings:', error);
    return NextResponse.json(
      { error: 'Failed to reset settings' },
      { status: 500 }
    );
  }
}