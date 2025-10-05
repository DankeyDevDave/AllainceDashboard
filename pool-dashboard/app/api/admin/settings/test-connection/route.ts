import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { testInfluxConnection, testGrafanaConnection } from '@/lib/settings-server';
import { externalServicesSchema } from '@/lib/types/admin';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const service = body.service as 'influx' | 'grafana' | 'all';

    if (service === 'influx' || service === 'all') {
      const influxSettings = externalServicesSchema.parse(body.settings);
      const influxOk = await testInfluxConnection(influxSettings);

      if (service === 'influx') {
        return NextResponse.json({
          service: 'influx',
          connected: influxOk,
          message: influxOk ? 'InfluxDB connection successful' : 'Failed to connect to InfluxDB',
        });
      }
    }

    if (service === 'grafana' || service === 'all') {
      const grafanaUrl = body.settings?.grafanaUrl;
      if (!grafanaUrl) {
        return NextResponse.json(
          { error: 'Grafana URL is required' },
          { status: 400 }
        );
      }

      const grafanaOk = await testGrafanaConnection(grafanaUrl);

      if (service === 'grafana') {
        return NextResponse.json({
          service: 'grafana',
          connected: grafanaOk,
          message: grafanaOk ? 'Grafana connection successful' : 'Failed to connect to Grafana',
        });
      }
    }

    // Test all services
    if (service === 'all') {
      const settings = externalServicesSchema.parse(body.settings);
      const [influxOk, grafanaOk] = await Promise.all([
        testInfluxConnection(settings),
        testGrafanaConnection(settings.grafanaUrl),
      ]);

      return NextResponse.json({
        influx: {
          connected: influxOk,
          message: influxOk ? 'Connected' : 'Failed to connect',
        },
        grafana: {
          connected: grafanaOk,
          message: grafanaOk ? 'Connected' : 'Failed to connect',
        },
        allConnected: influxOk && grafanaOk,
      });
    }

    return NextResponse.json(
      { error: 'Invalid service specified' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error testing connection:', error);
    return NextResponse.json(
      { error: 'Failed to test connection' },
      { status: 500 }
    );
  }
}