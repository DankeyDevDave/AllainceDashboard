# Heat Pump Energy & Performance Grafana Dashboard

## Overview
Comprehensive Grafana dashboard for monitoring AquaTemp heat pump energy consumption, heating performance, and operational metrics.

## Features

### Real-Time Monitoring
- **Current Power Consumption** - Live power usage with color-coded thresholds
- **Today's Energy** - Daily energy consumption tracking
- **Compressor Runtime** - Hours of operation today
- **System Status** - On/Off indicator

### Energy Analysis
- **24-Hour Power Timeline** - Detailed power consumption over last day
- **7-Day Energy Bars** - Daily energy comparison
- **Hourly Consumption Gauge** - Current hour usage
- **Cumulative Energy by Tariff** - Regular vs low-tariff split

### Temperature & Performance
- **Temperature Monitoring** - Inlet, outlet, and ambient temperatures
- **Temperature Delta** - Heating effectiveness (outlet - inlet)
- **Mode Timeline** - Heat/Cool/Auto/Off status over time

### Maintenance
- **Total Compressor Runtime** - Lifetime hours with service alerts
- **Mode History** - Operating mode timeline

## Installation Instructions

### Step 1: Add InfluxDB Data Source to Grafana

1. Open Grafana: **http://192.168.0.6:3000**
2. Login: `admin` / `admin`
3. Go to **Configuration → Data Sources → Add data source**
4. Select **InfluxDB**
5. Configure:
   ```
   Name: Home Assistant InfluxDB
   Query Language: Flux
   URL: http://192.168.0.6:8086
   Organization: 81297bfe8c7b49bd
   Token: [Use the full token from /config/influxdb.yaml on HA]
   Default Bucket: homeassistant
   ```
6. Click **Save & Test**

### Step 2: Import the Dashboard

#### Method 1: Via Grafana UI
1. Go to **Dashboards → Import**
2. Click **Upload JSON file**
3. Select `grafana_heat_pump_dashboard.json`
4. Select data source: **Home Assistant InfluxDB**
5. Click **Import**

#### Method 2: Via API
```bash
curl -X POST http://192.168.0.6:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -u admin:admin \
  -d @grafana_heat_pump_dashboard.json
```

#### Method 3: Copy to Grafana Container
```bash
# From your Mac
scp grafana_heat_pump_dashboard.json root@192.168.0.6:/root/

# On the Grafana server
docker cp /root/grafana_heat_pump_dashboard.json grafana:/tmp/
```

### Step 3: Get the InfluxDB Token

SSH into Home Assistant:
```bash
ssh hassio@192.168.0.30
cat /config/influxdb.yaml | grep token
```

Or create a new read token in InfluxDB UI:
1. Go to http://192.168.0.6:8086
2. Login: `admin` / `your_secure_password`
3. Go to **Data → API Tokens**
4. Create **Read Token** for bucket `homeassistant`
5. Copy token and use in Grafana data source

## Dashboard Variables

### Device Selection
Filter by specific heat pump:
- **All Devices** - Shows all heat pumps
- **Aloha Sensory Aquatics** - Pool heat pump
- **House Levy Heatpump** - House heating
- **Heat Pump** - Third unit

### Time Range
Quick selectors:
- Last 1 hour
- Last 6 hours
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom range

### Aggregation Interval
- Auto (adjusts based on time range)
- 1 minute
- 5 minutes
- 15 minutes
- 1 hour

## Panel Descriptions

| Panel | Description | Data Source |
|-------|-------------|-------------|
| Current Power | Real-time power consumption | Z04 sensor |
| Today's Energy | Energy consumed today | Z06 sensor (daily delta) |
| Compressor Runtime Today | Hours run today | Z08 sensor (daily delta) |
| System Status | On/Off status | Power sensor |
| Power Timeline | 24-hour power graph | Z04 sensor |
| Temperature Monitoring | Multi-line temp graph | T02, T03, T05 sensors |
| Daily Energy Bars | 7-day energy comparison | Z06 sensor |
| Temperature Delta | Heating effectiveness | T03 - T02 calculation |
| Hourly Gauge | Current hour consumption | Z07 sensor |
| Total Runtime | Lifetime compressor hours | Z08 sensor |
| Energy by Tariff | Regular vs low tariff | Z06 + Z06_L sensors |
| Mode Timeline | Operating mode history | Mode sensor |

## Threshold Alerts (Color Coding)

### Power Consumption
- 🟢 Green: 0 - 1000W (Normal)
- 🟡 Yellow: 1000 - 2500W (Moderate)
- 🔴 Red: >2500W (High)

### Temperature Delta
- 🔴 Red: <2°C (Poor heating)
- 🟡 Yellow: 2-4°C (Moderate)
- 🟢 Green: >4°C (Good heating)

### Compressor Runtime
- 🟢 Green: 0 - 2000h
- 🟡 Yellow: 2000 - 4000h (Service soon)
- 🟠 Orange: >4000h (Service recommended)

## Customization

### Adding New Panels
1. Click **Add Panel** in dashboard
2. Select **InfluxDB** as data source
3. Use Flux query builder or write custom query
4. Example query for new sensor:
   ```flux
   from(bucket: "homeassistant")
     |> range(start: -24h)
     |> filter(fn: (r) => r["entity_id"] =~ /your_sensor_name/)
     |> filter(fn: (r) => r["_field"] == "value")
   ```

### Modifying Thresholds
1. Click panel title → **Edit**
2. Go to **Field** tab
3. Adjust **Thresholds** values
4. **Save** dashboard

### Adding Alerts
1. Edit panel
2. Go to **Alert** tab
3. Create alert rule:
   - Condition: Power > 3000W for 30 minutes
   - Notification: Email/Slack/Telegram
4. Save alert

## Troubleshooting

### No Data Showing
1. **Check InfluxDB connection**: 
   ```bash
   curl http://192.168.0.6:8086/health
   ```

2. **Verify data in InfluxDB**:
   ```bash
   curl -XPOST "http://192.168.0.6:8086/api/v2/query?org=81297bfe8c7b49bd" \
     -H "Authorization: Token YOUR_TOKEN" \
     -H "Content-Type: application/vnd.flux" \
     -d 'from(bucket:"homeassistant") |> range(start: -5m) |> limit(n: 5)'
   ```

3. **Check Home Assistant InfluxDB integration**:
   - Settings → System → Logs
   - Search for "influxdb"
   - Look for errors

### Queries Timing Out
1. Reduce time range
2. Increase aggregation interval
3. Add more specific filters
4. Check InfluxDB performance

### Wrong Device Showing
1. Check variable `$device` value
2. Ensure entity_id matches pattern
3. Use regex tester: `entity_id =~ /pattern/`

## Advanced Features

### COP (Coefficient of Performance) Calculation
To add COP metric (requires flow rate sensor):

```flux
inlet = from(bucket: "homeassistant")
  |> range(start: -1h)
  |> filter(fn: (r) => r["entity_id"] =~ /inlet_water_temp/)

outlet = from(bucket: "homeassistant")
  |> range(start: -1h)
  |> filter(fn: (r) => r["entity_id"] =~ /outlet_water_temp/)

power = from(bucket: "homeassistant")
  |> range(start: -1h)
  |> filter(fn: (r) => r["entity_id"] =~ /actual_power/)

// Join and calculate COP
// COP = (Flow × Delta T × 4.186) / (Power / 1000)
```

### Cost Calculation
Add tariff rates to calculate costs:

```flux
from(bucket: "homeassistant")
  |> range(start: -1d)
  |> filter(fn: (r) => r["entity_id"] =~ /cumulative_power_consumption/)
  |> aggregateWindow(every: 1d, fn: spread)
  |> map(fn: (r) => ({ r with _value: r._value * 1.50 })) // R1.50 per kWh
```

## Maintenance Schedule

Based on compressor runtime (Z08):
- **Every 2000h**: Filter check
- **Every 4000h**: Full service
- **Every 6000h**: Major service

Set up alerts in Grafana at these intervals.

## Support

For issues or questions:
- GitHub: https://github.com/jlwainwright/aquatemp
- Home Assistant Community Forums
- Grafana Community Forums

## Version
Dashboard Version: 1.0.0
Compatible with:
- Home Assistant: 2025.8.3+
- InfluxDB: 2.7.12+
- Grafana: Latest
- AquaTemp Integration: 3.1.0+
