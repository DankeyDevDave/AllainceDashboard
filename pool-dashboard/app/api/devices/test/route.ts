import { NextRequest, NextResponse } from 'next/server';
import { testDeviceConnection } from '@/lib/queries/device-metrics';

/**
 * POST /api/devices/test
 *
 * Test connection to a Home Assistant entity via InfluxDB
 * Used by the device settings UI to validate entity IDs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityId } = body;

    if (!entityId || typeof entityId !== 'string') {
      return NextResponse.json(
        {
          connected: false,
          hasData: false,
          message: 'Entity ID is required',
        },
        { status: 400 }
      );
    }

    // Test the connection
    const result = await testDeviceConnection(entityId);

    return NextResponse.json(result, {
      status: result.connected ? 200 : 503,
    });
  } catch (error) {
    console.error('Device test error:', error);

    return NextResponse.json(
      {
        connected: false,
        hasData: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
