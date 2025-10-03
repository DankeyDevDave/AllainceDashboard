#!/usr/bin/env python3
"""
Script to check which version of Aqua Temp integration is installed in Home Assistant
"""
import requests
import sys
import os

# Configuration
HA_URL = os.environ.get("HA_URL", "http://192.168.0.30:8123")
HA_TOKEN = os.environ.get("HA_TOKEN", "")

def check_integration_version():
    """Check if Aqua Temp integration is loaded and get its version"""
    
    if not HA_TOKEN:
        print("❌ Error: HA_TOKEN environment variable not set")
        print("\nUsage:")
        print("  export HA_TOKEN='your_long_lived_access_token'")
        print("  python3 check_ha_version.py")
        print("\nOr:")
        print("  HA_TOKEN='your_token' python3 check_ha_version.py")
        print("\nTo create a token:")
        print("  1. Open Home Assistant")
        print("  2. Go to Profile → Security → Long-lived access tokens")
        print("  3. Click 'Create Token'")
        print("  4. Copy the token and use it with this script")
        sys.exit(1)
    
    headers = {
        "Authorization": f"Bearer {HA_TOKEN}",
        "Content-Type": "application/json",
    }
    
    print(f"🔍 Checking Home Assistant at: {HA_URL}")
    print("-" * 60)
    
    # Check if HA is accessible
    try:
        response = requests.get(f"{HA_URL}/api/", headers=headers, timeout=5)
        response.raise_for_status()
        print("✅ Connected to Home Assistant")
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to Home Assistant: {e}")
        print("\nTroubleshooting:")
        print("1. Check if Home Assistant is running")
        print("2. Verify the URL (try http://localhost:8123 or your HA IP)")
        print("3. Check if token is valid")
        sys.exit(1)
    
    # Check entities first to determine if integration is loaded
    print("ℹ️  Checking entities to determine version...")
    
    # Check for entities with new sensors
    print("\n" + "-" * 60)
    print("🔍 Checking for power monitoring entities...")
    print("-" * 60)
    
    try:
        response = requests.get(f"{HA_URL}/api/states", headers=headers, timeout=5)
        response.raise_for_status()
        
        entities = response.json()
        aqua_temp_entities = [e for e in entities if e.get("entity_id", "").startswith("sensor.") and "aqua_temp" in e.get("entity_id", "")]
        
        # Look for new power monitoring sensors
        power_sensors = {
            "z04": "Actual Power [Z04]",
            "z06": "Cumulative Power Consumption [Z06]",
            "z06_l": "Cumulative Power Consumption Low [Z06_L]",
            "z07": "Electricity Consumption per Hour [Z07]",
            "z08": "Compressor Operational Time [Z08]"
        }
        
        found_power_sensors = []
        for entity in aqua_temp_entities:
            entity_id = entity.get("entity_id", "")
            for key, name in power_sensors.items():
                if key in entity_id.lower():
                    found_power_sensors.append({
                        "entity_id": entity_id,
                        "name": entity.get("attributes", {}).get("friendly_name", name),
                        "state": entity.get("state"),
                        "unit": entity.get("attributes", {}).get("unit_of_measurement", "")
                    })
        
        if found_power_sensors:
            print("\n" + "=" * 60)
            print("✅ VERSION 3.1.0 DETECTED (NEW VERSION)")
            print("=" * 60)
            print(f"\nFound {len(found_power_sensors)} power monitoring sensor(s):")
            for sensor in found_power_sensors:
                print(f"   ✓ {sensor['name']}")
                print(f"     Entity: {sensor['entity_id']}")
                print(f"     Value: {sensor['state']} {sensor['unit']}")
            print("\n🎉 Your modified version with power monitoring is installed!")
        else:
            print("\n" + "=" * 60)
            print("🔴 VERSION 3.0.37 DETECTED (OLD VERSION)")
            print("=" * 60)
            print("\n❌ No power monitoring sensors found")
            print("   This indicates the original version is installed.")
            print("\n📋 To install version 3.1.0 with power monitoring:")
            print("   1. Copy updated files to /config/custom_components/aqua_temp")
            print("   2. Restart Home Assistant")
            print("   3. Check again with this script")
    
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Could not fetch entities: {e}")

if __name__ == "__main__":
    check_integration_version()
