#!/bin/bash
# Setup script for Heat Pump Grafana Dashboard

set -e

echo "========================================================================"
echo "Heat Pump Energy & Performance Dashboard Setup"
echo "========================================================================"
echo ""

# Configuration
GRAFANA_URL="http://192.168.0.6:3000"
GRAFANA_USER="admin"
GRAFANA_PASS="admin"
INFLUXDB_URL="http://192.168.0.6:8086"
INFLUXDB_ORG="81297bfe8c7b49bd"
INFLUXDB_BUCKET="homeassistant"

echo "Step 1: Checking Grafana availability..."
if curl -s "$GRAFANA_URL/api/health" > /dev/null; then
    echo "✅ Grafana is accessible"
else
    echo "❌ Cannot reach Grafana at $GRAFANA_URL"
    echo "   Please ensure Grafana container is running"
    exit 1
fi

echo ""
echo "Step 2: Checking InfluxDB availability..."
if curl -s "$INFLUXDB_URL/health" > /dev/null; then
    echo "✅ InfluxDB is accessible"
else
    echo "❌ Cannot reach InfluxDB at $INFLUXDB_URL"
    exit 1
fi

echo ""
echo "Step 3: Get InfluxDB Token"
echo "-------------------------------------------"
echo "You need the InfluxDB token from Home Assistant config."
echo ""
echo "Option 1: Get from Home Assistant"
echo "  ssh hassio@192.168.0.30"
echo "  cat /config/influxdb.yaml | grep token"
echo ""
echo "Option 2: Get from InfluxDB UI"
echo "  1. Open http://192.168.0.6:8086"
echo "  2. Login: admin / your_secure_password"
echo "  3. Go to Data → API Tokens"
echo "  4. Copy the homeassistant token"
echo ""
read -p "Enter InfluxDB Token: " INFLUXDB_TOKEN

if [ -z "$INFLUXDB_TOKEN" ]; then
    echo "❌ Token is required"
    exit 1
fi

echo ""
echo "Step 4: Creating InfluxDB Data Source in Grafana..."
DATASOURCE_JSON=$(cat <<EOF
{
  "name": "Home Assistant InfluxDB",
  "type": "influxdb",
  "access": "proxy",
  "url": "$INFLUXDB_URL",
  "jsonData": {
    "version": "Flux",
    "organization": "$INFLUXDB_ORG",
    "defaultBucket": "$INFLUXDB_BUCKET",
    "tlsSkipVerify": true
  },
  "secureJsonData": {
    "token": "$INFLUXDB_TOKEN"
  }
}
EOF
)

DS_RESPONSE=$(curl -s -X POST "$GRAFANA_URL/api/datasources" \
  -H "Content-Type: application/json" \
  -u "$GRAFANA_USER:$GRAFANA_PASS" \
  -d "$DATASOURCE_JSON")

if echo "$DS_RESPONSE" | grep -q '"id"'; then
    DS_ID=$(echo "$DS_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "✅ Data source created with ID: $DS_ID"
else
    if echo "$DS_RESPONSE" | grep -q "already exists"; then
        echo "ℹ️  Data source already exists"
        DS_ID=$(curl -s "$GRAFANA_URL/api/datasources/name/Home%20Assistant%20InfluxDB" \
          -u "$GRAFANA_USER:$GRAFANA_PASS" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    else
        echo "⚠️  Response: $DS_RESPONSE"
    fi
fi

echo ""
echo "Step 5: Importing Dashboard..."
DASHBOARD_FILE="./grafana_heat_pump_dashboard.json"

if [ ! -f "$DASHBOARD_FILE" ]; then
    echo "❌ Dashboard file not found: $DASHBOARD_FILE"
    exit 1
fi

# Update datasource UID in dashboard JSON
TEMP_DASHBOARD=$(mktemp)
jq ".dashboard.panels[].datasource.uid = \"$DS_ID\"" "$DASHBOARD_FILE" > "$TEMP_DASHBOARD"

IMPORT_RESPONSE=$(curl -s -X POST "$GRAFANA_URL/api/dashboards/db" \
  -H "Content-Type: application/json" \
  -u "$GRAFANA_USER:$GRAFANA_PASS" \
  -d @"$TEMP_DASHBOARD")

rm "$TEMP_DASHBOARD"

if echo "$IMPORT_RESPONSE" | grep -q '"url"'; then
    DASHBOARD_URL=$(echo "$IMPORT_RESPONSE" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Dashboard imported successfully!"
    echo ""
    echo "========================================================================"
    echo "✅ SETUP COMPLETE!"
    echo "========================================================================"
    echo ""
    echo "Dashboard URL: $GRAFANA_URL$DASHBOARD_URL"
    echo ""
    echo "Next steps:"
    echo "1. Open the dashboard in your browser"
    echo "2. Select a device from the dropdown"
    echo "3. Adjust time range as needed"
    echo "4. Customize panels to your liking"
    echo ""
else
    echo "⚠️  Response: $IMPORT_RESPONSE"
    echo ""
    echo "Manual import:"
    echo "1. Open $GRAFANA_URL"
    echo "2. Go to Dashboards → Import"
    echo "3. Upload grafana_heat_pump_dashboard.json"
fi

echo ""
echo "========================================================================"
echo "Useful Links:"
echo "========================================================================"
echo "Grafana: $GRAFANA_URL"
echo "InfluxDB: $INFLUXDB_URL"
echo "Home Assistant: http://192.168.0.30:8123"
echo ""
echo "Documentation: See GRAFANA_DASHBOARD_README.md"
echo "========================================================================"
