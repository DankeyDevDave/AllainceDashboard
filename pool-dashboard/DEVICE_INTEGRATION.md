# eWeLink/Sonoff Device Integration Guide

This guide explains how to integrate Sonoff smart devices (pool pumps, power monitors, etc.) into the Pool Dashboard using the eWeLink integration in Home Assistant.

## Overview

The Pool Dashboard integrates with Sonoff devices through the following data flow:

```
Sonoff Device → eWeLink → Home Assistant → InfluxDB → Pool Dashboard
```

This approach leverages your existing Home Assistant infrastructure and provides a unified data source through InfluxDB.

## Prerequisites

1. **Home Assistant** installed and running
2. **InfluxDB** integration configured in Home Assistant
3. **eWeLink integration** installed in Home Assistant
4. **Sonoff devices** paired with eWeLink app and added to Home Assistant

## Step 1: Install eWeLink Integration in Home Assistant

### Option A: HACS Installation (Recommended)

1. Open Home Assistant
2. Go to **HACS** → **Integrations**
3. Search for "Sonoff LAN" or "eWeLink"
4. Click **Download** and restart Home Assistant

### Option B: Manual Installation

1. Add the eWeLink integration from the Home Assistant integrations page
2. Follow the setup wizard to connect your eWeLink account
3. Your Sonoff devices should appear automatically

## Step 2: Verify Device Entity IDs

1. In Home Assistant, go to **Settings** → **Devices & Services** → **Entities**
2. Find your Sonoff devices (they will have entity IDs like `sensor.pool_pump_power`)
3. Note down the entity IDs for:
   - Power sensors (e.g., `sensor.pool_pump_power`)
   - Energy sensors (e.g., `sensor.pool_pump_energy`)
   - State sensors (e.g., `switch.pool_pump`)

**Example Entity IDs:**
```
sensor.pool_pump_power          # Current power draw (W)
sensor.pool_pump_energy_total   # Total energy consumed (kWh)
sensor.filter_power_monitor     # Filter power consumption
sensor.pool_heater_power        # Heater power consumption
```

## Step 3: Configure InfluxDB Integration

Ensure your Home Assistant InfluxDB integration is configured to send device data:

1. Go to **Settings** → **Devices & Services** → **InfluxDB**
2. Verify the following settings:
   - **Host**: Your InfluxDB server IP (e.g., `192.168.0.6`)
   - **Port**: `8086`
   - **Bucket**: `homeassistant`
   - **Organization**: Your InfluxDB org ID
   - **Token**: Your InfluxDB token

3. Check that your Sonoff device entities are included in the InfluxDB integration:
   - By default, all entities are included
   - You can filter entities in the InfluxDB configuration if needed

## Step 4: Configure Devices in Pool Dashboard

### Access Admin Settings

1. Log in to the Pool Dashboard
2. Navigate to **Admin** → **Settings**
3. Click on the **Devices** tab

### Add a Device

1. Click **Add Device**
2. Fill in the device information:

   | Field | Description | Example |
   |-------|-------------|---------|
   | **Device Name** | Friendly name for the device | Pool Pump |
   | **Entity ID** | Home Assistant entity ID | `sensor.pool_pump_power` |
   | **Device Type** | Type of device | Pool Pump |
   | **Description** | Optional description | Main filtration pump |
   | **Enabled** | Enable/disable monitoring | ✓ Checked |

3. Click **Test Connection** to verify the device is accessible in InfluxDB
   - This will check if data exists for the entity ID
   - Shows the last recorded value and timestamp

4. Click **Save** to add the device

### Device Types

- **Pool Pump**: Main pool circulation pump
- **Power Monitor**: Generic power monitoring device
- **Filter**: Pool filter system
- **Heater**: Pool heating equipment
- **Other**: Any other pool-related device

## Step 5: Verify Data Flow

### Check InfluxDB Data

1. Access InfluxDB UI (usually `http://your-influxdb-ip:8086`)
2. Go to **Data Explorer**
3. Query for your device entity:

```flux
from(bucket: "homeassistant")
  |> range(start: -1h)
  |> filter(fn: (r) => r["entity_id"] == "sensor.pool_pump_power")
  |> filter(fn: (r) => r["_field"] == "value")
```

4. Verify data points are being recorded

### Check Dashboard Display

1. Navigate to the main **Dashboard** page
2. Look for the **Pool System Power** section
3. Verify your devices appear with current power readings
4. Check the **Cost Breakdown** and **Device Status** cards

## Expected Dashboard Output

Once configured, you'll see:

### Summary Metrics
- **Total Power**: Combined power draw from heat pump and all devices
- **Energy Today**: Total energy consumed by all devices
- **Cost Today**: Combined electricity cost

### Cost Breakdown
- Heat Pump contribution (%)
- Pool Pump contribution (%)
- Other Devices contribution (%)

### Individual Device Cards
Each device shows:
- Current power draw (kW)
- Energy consumed today (kWh)
- Cost today (R/$/€)
- Online/offline status

## Troubleshooting

### Device Not Showing Data

1. **Check Home Assistant entity**:
   ```bash
   # In Home Assistant Developer Tools → States
   # Search for your entity ID
   ```
   - Verify the entity exists
   - Check if it has a current value

2. **Check InfluxDB data**:
   - Use the Data Explorer query above
   - Ensure data is being written to InfluxDB
   - Check timestamp is recent (< 5 minutes)

3. **Check entity ID spelling**:
   - Entity IDs are case-sensitive
   - Format: `sensor.device_name_power`

4. **Verify InfluxDB integration**:
   - Check Home Assistant logs for InfluxDB errors
   - Ensure network connectivity between HA and InfluxDB

### Connection Test Fails

If the "Test Connection" button shows an error:

1. **Check InfluxDB configuration**:
   - Verify INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET in `.env`
   - Ensure the pool dashboard can reach InfluxDB

2. **Check entity ID format**:
   - Must match exactly as shown in Home Assistant
   - Common format: `sensor.device_name_attribute`

3. **Wait for data**:
   - New devices may take 5-10 minutes for first data point
   - Ensure device is powered on and reporting

### Device Shows as "Unknown" State

The dashboard determines device state based on power draw:
- **On**: Power > 5W
- **Off**: Power ≤ 5W
- **Unknown**: No recent data (> 5 minutes old)
- **Error**: Negative power value (sensor issue)

If a device shows "Unknown":
1. Check if device is reporting to Home Assistant
2. Verify data is flowing to InfluxDB
3. Check dashboard refresh interval (default: 30 seconds)

## Data Requirements

For accurate monitoring, ensure your Sonoff devices provide:

### Required Sensors
- **Power (W)**: Current power consumption
  - Entity example: `sensor.device_power`
  - Used for: Real-time power display, state detection

### Recommended Sensors
- **Energy (kWh)**: Cumulative energy consumption
  - Entity example: `sensor.device_energy_total`
  - Used for: Daily energy calculations, cost tracking

### Optional Sensors
- **State**: On/off switch state
  - Entity example: `switch.device`
  - Used for: Manual state override (not currently used)

## Entity ID Naming Conventions

Home Assistant typically creates entities with these patterns:

**Power Sensors:**
```
sensor.{device_name}_power
sensor.sonoff_{device_id}_power
sensor.{friendly_name}_current_consumption
```

**Energy Sensors:**
```
sensor.{device_name}_energy
sensor.{device_name}_energy_total
sensor.sonoff_{device_id}_total_energy
```

**Check your actual entities** in Home Assistant to confirm the exact format.

## Cost Calculation

The dashboard calculates costs using:

1. **Energy consumed today** (kWh) from InfluxDB
2. **Current tariff** from admin settings (per kWh rate)
3. **Cost = Energy × Tariff**

Costs are broken down by:
- Heat pump cost
- Pool pump cost
- Other devices cost
- Total system cost

## Performance Considerations

- **Refresh Rate**: Dashboard updates every 30 seconds (configurable)
- **InfluxDB Queries**: Optimized to query only recent data (last 5 minutes for current values)
- **Multiple Devices**: System is designed to handle 10-20 devices efficiently
- **Data Retention**: Uses InfluxDB's default retention policy

## Security Notes

- Device configuration is stored in browser localStorage
- No device credentials are stored in the dashboard
- All authentication happens through Home Assistant/eWeLink
- InfluxDB token should be read-only for security

## Advanced Configuration

### Custom Power Thresholds

Edit `lib/queries/device-metrics.ts` to adjust the power threshold for on/off detection:

```typescript
// Default: Device is "on" if drawing more than 5W
return power > 5 ? 'on' : 'off';

// Adjust for sensitive devices:
return power > 1 ? 'on' : 'off';
```

### Custom Refresh Intervals

Configure per-device refresh rates in `lib/settings-storage.ts`:

```typescript
deviceManagement: {
  autoRefreshInterval: 30, // seconds
  // ...
}
```

## Support

For issues:
1. Check Home Assistant logs: **Settings** → **System** → **Logs**
2. Check browser console (F12) for dashboard errors
3. Verify InfluxDB data using Data Explorer
4. Review this guide's troubleshooting section

## Summary

This integration provides:
- ✅ Real-time power monitoring
- ✅ Daily energy tracking
- ✅ Cost calculations with breakdowns
- ✅ Device state monitoring
- ✅ Unified dashboard view
- ✅ No additional credentials needed
- ✅ Leverages existing infrastructure
