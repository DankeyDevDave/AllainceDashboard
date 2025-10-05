#!/bin/bash
# Pre-deployment hook for AquaTemp project
# Validates everything before deployment to Home Assistant or production

set -e

echo "🚀 Running pre-deployment validation..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Deployment checklist
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Function to run validation
validate() {
    local name="$1"
    local command="$2"
    local critical="${3:-true}"

    echo -n "  $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        if [ "$critical" = "true" ]; then
            echo -e "${RED}✗${NC}"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
            return 1
        else
            echo -e "${YELLOW}⚠${NC}"
            WARNINGS=$((WARNINGS + 1))
            return 0
        fi
    fi
}

echo -e "${CYAN}Integration Validation:${NC}"
validate "Manifest exists" "test -f custom_components/aqua_temp/manifest.json"
validate "Version valid" "grep -q '\"version\":' custom_components/aqua_temp/manifest.json"
validate "Python syntax" "python -m py_compile custom_components/aqua_temp/*.py"
validate "__init__.py exists" "test -f custom_components/aqua_temp/__init__.py"
validate "sensor.py exists" "test -f custom_components/aqua_temp/sensor.py"

echo -e "${CYAN}Dashboard Validation:${NC}"
if [ -d "pool-dashboard" ]; then
    cd pool-dashboard
    validate "package.json valid" "node -e 'require(\"./package.json\")'"
    validate "Dependencies installed" "test -d node_modules"
    validate "TypeScript compiles" "npx tsc --noEmit" false
    validate "Build succeeds" "npm run build" false
    cd ..
else
    echo -e "  ${YELLOW}Dashboard not found (skipping)${NC}"
fi

echo -e "${CYAN}Testing:${NC}"
validate "Test directory exists" "test -d tests"
validate "Tests pass" "python -m pytest tests/ -q" false

echo -e "${CYAN}Documentation:${NC}"
validate "README exists" "test -f README.md"
validate "Constitution exists" "test -f specs/constitution.yaml"
validate "quick_launch.sh exists" "test -f quick_launch.sh"
validate "quick_launch.sh executable" "test -x quick_launch.sh"

echo -e "${CYAN}Environment:${NC}"
validate "No hardcoded secrets" "! grep -r 'api_key=' --include='*.py' --include='*.ts' ."
validate "No debug mode" "! grep -r 'DEBUG.*=.*True' --include='*.py' ."
validate "No localhost URLs" "! grep -r 'localhost' --include='*.py' custom_components/" false

echo -e "${CYAN}Package Structure:${NC}"
# Check required files for HA integration
REQUIRED_FILES=(
    "custom_components/aqua_temp/__init__.py"
    "custom_components/aqua_temp/manifest.json"
    "custom_components/aqua_temp/sensor.py"
    "custom_components/aqua_temp/common/consts.py"
    "custom_components/aqua_temp/managers/aqua_temp_api.py"
)

for file in "${REQUIRED_FILES[@]}"; do
    validate "$(basename $file)" "test -f $file"
done

# Version consistency check
echo ""
echo -e "${CYAN}Version Consistency:${NC}"
MANIFEST_VERSION=$(grep '"version"' custom_components/aqua_temp/manifest.json | cut -d'"' -f4)
LAUNCH_VERSION=$(grep 'VERSION=' quick_launch.sh | head -1 | cut -d'"' -f2)

if [ "$MANIFEST_VERSION" = "$LAUNCH_VERSION" ]; then
    echo -e "  Version match: $MANIFEST_VERSION ${GREEN}✓${NC}"
else
    echo -e "  Version mismatch: manifest=$MANIFEST_VERSION, launcher=$LAUNCH_VERSION ${YELLOW}⚠${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Create deployment package if all critical checks pass
if [ $CHECKS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${CYAN}Creating deployment package...${NC}"
    ZIP_NAME="aqua_temp_v${MANIFEST_VERSION}.zip"

    cd custom_components
    zip -r "../${ZIP_NAME}" aqua_temp/ -x "*.pyc" -x "*__pycache__*" -x "*.pytest_cache*" -q
    cd ..

    if [ -f "$ZIP_NAME" ]; then
        echo -e "  Package created: ${ZIP_NAME} ${GREEN}✓${NC}"
        echo -e "  Size: $(du -h $ZIP_NAME | cut -f1)"
    fi
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}Deployment Validation Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  Checks passed: ${GREEN}$CHECKS_PASSED${NC}"
if [ $WARNINGS -gt 0 ]; then
    echo -e "  Warnings: ${YELLOW}$WARNINGS${NC}"
fi
if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "  Checks failed: ${RED}$CHECKS_FAILED${NC}"
fi
echo ""

# Final decision
if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Ready for deployment!${NC}"
    echo ""
    echo "Deploy with:"
    echo "  • Home Assistant (local): ./quick_launch.sh option 4"
    echo "  • Home Assistant (Docker): ./quick_launch.sh option 5"
    echo "  • Dashboard: ./quick_launch.sh option 2"
    exit 0
else
    echo -e "${RED}❌ Deployment validation failed!${NC}"
    echo ""
    echo "Please fix the critical issues before deploying."
    echo "Run './quick_launch.sh' option 6 to run tests"
    echo "Run './quick_launch.sh' option 7 to fix formatting"
    exit 1
fi