# ✅ Grafana Dashboard Successfully Installed!

## Dashboard Information

**Dashboard URL:** http://192.168.0.6:3000/d/88495143-b01e-484a-9a04-3ef230fa5d25/heat-pump-energy-and-performance-monitor

**Dashboard Title:** Heat Pump Energy & Performance Monitor

**Status:** ✅ Successfully created and configured

---

## Quick Access

1. **Open Grafana:** http://192.168.0.6:3000
2. **Login:** admin / admin
3. **Navigate to:** Dashboards → Heat Pump Energy & Performance Monitor

Or use the direct link above.

---

## Dashboard Features

### 📊 12 Monitoring Panels Included:

#### Real-Time Monitoring (Top Row)
1. **Current Power Consumption** - Live power usage with color thresholds
   - 🟢 Green: 0-1000W
   - 🟡 Yellow: 1000-2500W  
   - 🔴 Red: >2500W

2. **Today's Energy Consumption** - Daily kWh tracking

3. **Compressor Runtime Today** - Hours of operation
   - 🟢 Green: 0-12h
   - 🟡 Yellow: 12-20h
   - 🔴 Red: >20h

4. **System Status** - On/Off indicator

#### Performance Analysis
5. **Power Consumption Timeline** - 24-hour power graph (Z04 sensor)

6. **Temperature Monitoring** - Inlet, outlet, and ambient temperatures

7. **Daily Energy Bars** - 7-day energy comparison (Z06 sensor)

8. **Temperature Delta** - Heating effectiveness calculation
   - 🔴 Red: <2°C (poor)
   - 🟡 Yellow: 2-4°C (moderate)
   - 🟢 Green: >4°C (good)

#### Energy & Maintenance
9. **Hourly Energy Gauge** - Current hour consumption (Z07 sensor)

10. **Total Compressor Runtime** - Lifetime hours with service alerts
    - 🟢 Green: 0-2000h
    - 🟡 Yellow: 2000-4000h (service soon)
    - 🟠 Orange: >4000h (service recommended)

11. **Energy by Tariff** - Regular vs low-tariff breakdown (Z06 + Z06_L)

12. **Mode Timeline** - Heat/Cool/Auto/Off status over 24 hours

---

## Dashboard Variables

### Device Filter
Select which heat pump to monitor:
- **All Devices** (default) - Shows all heat pumps
- **Aloha Sensory Aquatics** - Pool heat pump
- **House Levy Heatpump** - House heating
- **Heat Pump** - Third unit

### Time Range
Use Grafana's time picker (top right):
- Last 1 hour
- Last 6 hours
- Last 24 hours (default)
- Last 7 days
- Last 30 days
- Custom range

### Aggregation Interval
Auto-adjusts based on time range:
- Auto (recommended)
- 1 minute
- 5 minutes
- 15 minutes
- 1 hour

---

## Data Sources

All panels are connected to:
- **InfluxDB Datasource:** `ce1ttjampzta8a`
- **Bucket:** `homeassistant`
- **Organization:** `81297bfe8c7b49bd`

### Sensors Used
- **Z04** - Actual Power (W)
- **Z06** - Cumulative Power Consumption (kWh)
- **Z06_L** - Cumulative Power Consumption Low Tariff (kWh)
- **Z07** - Electricity Consumption per Hour (kWh)
- **Z08** - Compressor Operational Time (hours)
- **T02** - Inlet Water Temperature (°C)
- **T03** - Outlet Water Temperature (°C)
- **T05** - Ambient Temperature (°C)

---

## Next Steps

### 1. Verify Data is Flowing
Open the dashboard and check if panels are showing data. If panels are empty:

**Check InfluxDB has data:**
```bash
# SSH into HA
ssh hassio@192.168.0.30

# Check for heat pump sensors
ha core logs | grep -i "influxdb"
```

**Or check directly in InfluxDB UI:**
1. Go to http://192.168.0.6:8086
2. Login with admin credentials
3. Navigate to Data Explorer
4. Query: `from(bucket:"homeassistant") |> range(start: -1h)`
5. Look for entity_id fields with `actual_power_z04`, `cumulative_power_consumption_z06`, etc.

### 2. Customize the Dashboard

**Add More Panels:**
1. Click "Add" → "Visualization" 
2. Select InfluxDB datasource
3. Write Flux query
4. Configure visualization
5. Save dashboard

**Modify Thresholds:**
1. Click panel title → Edit
2. Go to "Field" tab
3. Adjust "Thresholds" values
4. Save

**Change Colors/Styles:**
1. Edit panel
2. Adjust "Field config" settings
3. Modify visualization options

### 3. Set Up Alerts (Optional)

**Create Alert for High Power Usage:**
1. Edit "Current Power Consumption" panel
2. Go to "Alert" tab
3. Create alert rule:
   - Condition: Power > 3000W for 30 minutes
   - Contact point: Email/Slack/Telegram
4. Save

**Create Maintenance Alert:**
1. Edit "Total Compressor Runtime" panel
2. Set alert for runtime > 4000 hours
3. Configure notification channel

### 4. Dashboard Sharing

**Create Snapshot:**
```bash
# From dashboard, click Share → Snapshot
# Choose expiration time
# Copy snapshot URL
```

**Add to Home Assistant:**
Create an iframe card in HA:
```yaml
type: iframe
url: http://192.168.0.6:3000/d/88495143-b01e-484a-9a04-3ef230fa5d25/heat-pump-energy-and-performance-monitor?kiosk
aspect_ratio: 100%
```

---

## Troubleshooting

### No Data Showing

**1. Check InfluxDB Integration in Home Assistant:**
```bash
# Check config
cat /config/configuration.yaml | grep influxdb
```

Should see:
```yaml
influxdb:
  api_version: 2
  host: 192.168.0.6
  port: 8086
  token: !secret influxdb_token
  organization: 81297bfe8c7b49bd
  bucket: homeassistant
  include:
    entities:
      - sensor.*actual_power*
      - sensor.*cumulative_power*
      - sensor.*compressor_operational*
      - sensor.*electricity_consumption*
```

**2. Restart Home Assistant:**
```bash
ssh hassio@192.168.0.30
ha core restart
```

**3. Verify Sensors Exist:**
```bash
# In Home Assistant, go to:
# Developer Tools → States
# Search for: actual_power_z04
```

### Queries Timing Out

1. Reduce time range (use last 6h instead of 7d)
2. Increase aggregation interval
3. Add more specific device filter
4. Check InfluxDB performance:
   ```bash
   docker stats influxdb
   ```

### Dashboard Not Updating

1. Check auto-refresh is enabled (top right)
2. Verify time range includes current time
3. Check InfluxDB is writing data:
   ```bash
   curl "http://192.168.0.6:8086/health"
   ```

---

## Advanced Customization

### Add COP (Coefficient of Performance) Calculation

Create a new panel with this Flux query:
```flux
import "math"

// Get power consumption
power = from(bucket: "homeassistant")
  |> range(start: -1h)
  |> filter(fn: (r) => r["entity_id"] =~ /actual_power_z04/)
  |> filter(fn: (r) => r["_field"] == "value")
  |> mean()

// Get temperature delta
inlet = from(bucket: "homeassistant")
  |> range(start: -1h)
  |> filter(fn: (r) => r["entity_id"] =~ /inlet_water_temp/)
  |> mean()

outlet = from(bucket: "homeassistant")
  |> range(start: -1h)
  |> filter(fn: (r) => r["entity_id"] =~ /outlet_water_temp/)
  |> mean()

// COP = (Flow_rate × Delta_T × 4.186) / (Power / 1000)
// Assuming 60 L/min flow rate
// COP = (60 × Delta_T × 4.186 × 60) / (Power / 1000) / 3600
```

### Add Cost Tracking

Create a panel to calculate electricity costs:
```flux
from(bucket: "homeassistant")
  |> range(start: -1d)
  |> filter(fn: (r) => r["entity_id"] =~ /cumulative_power_consumption_z06/)
  |> aggregateWindow(every: 1d, fn: spread)
  |> map(fn: (r) => ({ 
      r with 
      _value: r._value * 1.50  // R1.50 per kWh - adjust your tariff
  }))
```

Add low-tariff cost:
```flux
// Regular tariff cost
regular = from(bucket: "homeassistant")
  |> range(start: -1d)
  |> filter(fn: (r) => r["entity_id"] =~ /cumulative_power_consumption_z06/)
  |> aggregateWindow(every: 1d, fn: spread)
  |> map(fn: (r) => ({ r with _value: r._value * 1.50 }))

// Low tariff cost
low = from(bucket: "homeassistant")
  |> range(start: -1d)
  |> filter(fn: (r) => r["entity_id"] =~ /cumulative_power_consumption_low_z06_l/)
  |> aggregateWindow(every: 1d, fn: spread)
  |> map(fn: (r) => ({ r with _value: r._value * 0.80 }))  // R0.80 for low tariff

union(tables: [regular, low])
  |> sum()
```

---

## Support & Documentation

- **Full Documentation:** See `GRAFANA_DASHBOARD_README.md`
- **Setup Scripts:** 
  - `./check_influxdb.py` - Verify data flow
  - `./setup_grafana_dashboard.sh` - Automated setup
- **Integration Repo:** https://github.com/jlwainwright/aquatemp
- **Home Assistant Version:** 2025.8.3
- **AquaTemp Integration:** v3.1.0

---

## Summary

✅ **Dashboard Created:** Heat Pump Energy & Performance Monitor  
✅ **12 Panels:** Real-time monitoring, energy analysis, temperature tracking  
✅ **Data Source:** Connected to InfluxDB (homeassistant bucket)  
✅ **Sensors:** Z04, Z06, Z06_L, Z07, Z08, T02, T03, T05  
✅ **Variables:** Device filter, time range, aggregation interval  
✅ **Auto-refresh:** 30 seconds  
✅ **Timezone:** Africa/Johannesburg  

**Access:** http://192.168.0.6:3000/d/88495143-b01e-484a-9a04-3ef230fa5d25/heat-pump-energy-and-performance-monitor

Enjoy your comprehensive heat pump monitoring! 🎉
