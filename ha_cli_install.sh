#!/bin/bash
# Commands to run in Home Assistant CLI to install version 3.1.0

cat << 'EOF'
==============================================================
Home Assistant CLI Installation Commands for Aqua Temp v3.1.0
==============================================================

Copy and paste these commands in your Home Assistant CLI:

# 1. Backup existing installation
cd /config/custom_components
if [ -d "aqua_temp" ]; then
  mv aqua_temp aqua_temp.backup.$(date +%Y%m%d_%H%M%S)
  echo "✓ Backup created"
fi

# 2. Download from your GitHub fork
wget https://github.com/jlwainwright/aquatemp/archive/refs/heads/Custom-component.zip

# 3. Extract and install
unzip Custom-component.zip
mv aquatemp-Custom-component/custom_components/aqua_temp .

# 4. Cleanup
rm -rf aquatemp-Custom-component Custom-component.zip

# 5. Verify version
cat aqua_temp/manifest.json | grep version

# 6. Check file count
echo "Python files: $(find aqua_temp -name '*.py' | wc -l)"
echo "Parameter files: $(find aqua_temp/parameters -name '*.json' | wc -l)"

echo ""
echo "===================================="
echo "Installation complete!"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Type 'exit' to leave the CLI"
echo "2. Restart Home Assistant:"
echo "   Settings → System → Restart"
echo ""
echo "3. After restart, run this on your Mac:"
echo "   cd /Users/jacques/DevFolder/aquatemp"
echo "   python3 check_ha_version.py"
echo ""

EOF
