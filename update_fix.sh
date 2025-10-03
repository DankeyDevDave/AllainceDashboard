#!/bin/bash
# Quick update script to apply state_class fix

cat << 'EOF'
Run these commands in Home Assistant CLI to apply the state_class fix:

cd /config/custom_components

# Download the updated version
wget https://github.com/jlwainwright/aquatemp/archive/refs/heads/Custom-component.zip -O update.zip

# Backup current installation
cp -r aqua_temp aqua_temp.backup.latest

# Extract update
unzip -o update.zip

# Copy only the fixed file
cp aquatemp-Custom-component/custom_components/aqua_temp/managers/aqua_temp_config_manager.py \
   aqua_temp/managers/aqua_temp_config_manager.py

# Cleanup
rm -rf aquatemp-Custom-component update.zip

echo "✅ Fix applied! Now:"
echo "1. Reload the Aqua Temp integration"
echo "   Settings → Devices & Services → Aqua Temp → ⋮ → Reload"
echo "2. Check sensors again"

EOF
