#!/usr/bin/env python3
"""
Quick check to verify InfluxDB has Heat Pump data
"""
import subprocess
import json
import sys

INFLUXDB_URL = "http://192.168.0.6:8086"
INFLUXDB_ORG = "81297bfe8c7b49bd"
INFLUXDB_BUCKET = "homeassistant"

print("=" * 70)
print("Heat Pump InfluxDB Data Verification")
print("=" * 70)
print()

# Get token from user
print("To check data, we need the InfluxDB token.")
print("Get it from Home Assistant:")
print("  ssh hassio@192.168.0.30")
print("  cat /config/influxdb.yaml | grep token")
print()
token = input("Enter InfluxDB Token (or press Enter to skip): ").strip()

if not token:
    print("\n⚠️  Skipping data check. Install dashboard manually.")
    sys.exit(0)

print("\n1. Checking InfluxDB health...")
try:
    result = subprocess.run(
        ["curl", "-s", f"{INFLUXDB_URL}/health"],
        capture_output=True,
        text=True,
        timeout=5
    )
    if "pass" in result.stdout:
        print("✅ InfluxDB is healthy")
    else:
        print("❌ InfluxDB health check failed")
        sys.exit(1)
except Exception as e:
    print(f"❌ Cannot reach InfluxDB: {e}")
    sys.exit(1)

print("\n2. Checking for heat pump sensors in last 5 minutes...")
query = f'''
from(bucket: "{INFLUXDB_BUCKET}")
  |> range(start: -5m)
  |> filter(fn: (r) => r["entity_id"] =~ /actual_power_z04|cumulative_power_consumption_z06|compressor_operational_time_z08/)
  |> filter(fn: (r) => r["_field"] == "value")
  |> group(columns: ["entity_id"])
  |> last()
'''

try:
    result = subprocess.run(
        [
            "curl", "-s", "-XPOST",
            f"{INFLUXDB_URL}/api/v2/query?org={INFLUXDB_ORG}",
            "-H", f"Authorization: Token {token}",
            "-H", "Content-Type: application/vnd.flux",
            "-d", query
        ],
        capture_output=True,
        text=True,
        timeout=10
    )
    
    if result.returncode == 0:
        output = result.stdout
        
        # Check for data
        if "actual_power_z04" in output:
            print("✅ Found Z04 (Actual Power) sensor data")
        else:
            print("⚠️  No Z04 sensor data in last 5 minutes")
        
        if "cumulative_power_consumption_z06" in output:
            print("✅ Found Z06 (Cumulative Power) sensor data")
        else:
            print("⚠️  No Z06 sensor data in last 5 minutes")
        
        if "compressor_operational_time_z08" in output:
            print("✅ Found Z08 (Compressor Runtime) sensor data")
        else:
            print("⚠️  No Z08 sensor data in last 5 minutes")
        
        # Count records
        record_count = output.count("_value")
        print(f"\n📊 Total data points found: {record_count}")
        
        if record_count > 0:
            print("\n✅ InfluxDB is receiving heat pump data!")
            print("   Dashboard should work correctly.")
        else:
            print("\n⚠️  No recent data found. Possible issues:")
            print("   1. Heat pump might be off")
            print("   2. InfluxDB integration not recording these entities")
            print("   3. Check Home Assistant InfluxDB config includes these sensors")
    else:
        print(f"❌ Query failed: {result.stderr}")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Error querying data: {e}")
    sys.exit(1)

print("\n" + "=" * 70)
print("Next Steps:")
print("=" * 70)
print("1. Run: ./setup_grafana_dashboard.sh")
print("2. Or manually import grafana_heat_pump_dashboard.json")
print("3. See GRAFANA_DASHBOARD_README.md for full instructions")
print("=" * 70)
