#!/bin/bash
# Deploy updated Aqua Temp integration to Home Assistant

set -e

HA_HOST="192.168.0.30"
HA_USER="root"
SOURCE_DIR="/Users/jacques/DevFolder/aquatemp/custom_components/aqua_temp"
TARGET_DIR="/config/custom_components/aqua_temp"

echo "🚀 Deploying Aqua Temp v3.1.0 to Home Assistant"
echo "================================================"
echo ""
echo "Host: $HA_HOST"
echo "Source: $SOURCE_DIR"
echo "Target: $TARGET_DIR"
echo ""

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source directory not found: $SOURCE_DIR"
    exit 1
fi

echo "📦 Step 1: Creating backup of existing installation..."
ssh $HA_USER@$HA_HOST "if [ -d $TARGET_DIR ]; then cp -r $TARGET_DIR ${TARGET_DIR}.backup.$(date +%Y%m%d_%H%M%S); echo '✓ Backup created'; else echo 'ℹ️  No existing installation found'; fi"

echo ""
echo "📁 Step 2: Creating target directory..."
ssh $HA_USER@$HA_HOST "mkdir -p /config/custom_components"

echo ""
echo "📤 Step 3: Copying files to Home Assistant..."
# Use rsync for efficient transfer
rsync -avz --delete \
    --exclude='*.pyc' \
    --exclude='__pycache__' \
    --exclude='.git' \
    "$SOURCE_DIR/" \
    "$HA_USER@$HA_HOST:$TARGET_DIR/"

echo ""
echo "✅ Files copied successfully!"

echo ""
echo "📋 Step 4: Verifying installation..."
VERSION=$(ssh $HA_USER@$HA_HOST "cat $TARGET_DIR/manifest.json | grep version" | grep -o '[0-9.]*')
echo "   Installed version: $VERSION"

if [ "$VERSION" = "3.1.0" ]; then
    echo "   ✅ Version 3.1.0 confirmed!"
else
    echo "   ⚠️  Expected version 3.1.0, got $VERSION"
fi

echo ""
echo "📂 Step 5: Listing installed files..."
ssh $HA_USER@$HA_HOST "ls -lh $TARGET_DIR/*.py | wc -l | xargs echo '   Python files:'"
ssh $HA_USER@$HA_HOST "ls -lh $TARGET_DIR/parameters/*.json | wc -l | xargs echo '   Parameter files:'"

echo ""
echo "🔄 Step 6: Home Assistant restart required!"
echo ""
echo "================================================"
echo "✅ Deployment Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Restart Home Assistant:"
echo "   • Go to Settings → System → Restart"
echo "   • Or run: ssh $HA_USER@$HA_HOST 'ha core restart'"
echo ""
echo "2. Wait for Home Assistant to restart (1-2 minutes)"
echo ""
echo "3. Verify installation:"
echo "   • Run: python3 check_ha_version.py"
echo "   • Or check Settings → Devices & Services → Aqua Temp"
echo ""
echo "4. Look for new sensors:"
echo "   • Z04: Actual Power"
echo "   • Z06: Cumulative Power Consumption"
echo "   • Z06_L: Cumulative Power Consumption Low"
echo "   • Z07: Electricity Consumption per Hour"
echo "   • Z08: Compressor Operational Time"
echo ""
