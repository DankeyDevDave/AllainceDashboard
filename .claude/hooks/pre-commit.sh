#!/bin/bash
# Pre-commit hook for AquaTemp project
# Ensures code quality and standards before committing

set -e

echo "🔍 Running pre-commit checks..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any checks fail
FAILED=0

# Function to run a check
run_check() {
    local name="$1"
    local command="$2"
    local allow_failure="${3:-false}"

    echo -n "  $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        if [ "$allow_failure" = "false" ]; then
            echo -e "${RED}✗${NC}"
            FAILED=1
        else
            echo -e "${YELLOW}⚠${NC}"
        fi
    fi
}

# Python checks
if [ -d "custom_components" ]; then
    echo "Python checks:"
    run_check "Syntax check" "python -m py_compile custom_components/aqua_temp/*.py"
    run_check "Black formatting" "black --check custom_components/ tests/ 2>/dev/null" true
    run_check "Import sorting" "isort --check-only custom_components/ tests/ 2>/dev/null" true
fi

# TypeScript/JavaScript checks
if [ -d "pool-dashboard" ]; then
    echo "Dashboard checks:"
    cd pool-dashboard
    run_check "TypeScript compilation" "npx tsc --noEmit"
    run_check "ESLint" "npm run lint 2>/dev/null" true
    cd ..
fi

# Check for sensitive data
echo "Security checks:"
run_check "No API keys" "! grep -r 'api_key.*=' --include='*.py' --include='*.ts' --include='*.tsx' . 2>/dev/null"
run_check "No passwords" "! grep -r 'password.*=' --include='*.py' --include='*.ts' --include='*.tsx' . 2>/dev/null"
run_check "No tokens" "! grep -r 'token.*=' --include='*.py' --include='*.ts' --include='*.tsx' . 2>/dev/null"

# Check quick_launch.sh is executable
echo "Project checks:"
run_check "quick_launch.sh executable" "test -x quick_launch.sh"
run_check "Constitution exists" "test -f specs/constitution.yaml"

# Check for large files
echo "File size checks:"
LARGE_FILES=$(find . -type f -size +1M | grep -v ".git" | grep -v "node_modules" | grep -v ".next" | head -5)
if [ -z "$LARGE_FILES" ]; then
    echo -e "  No large files ${GREEN}✓${NC}"
else
    echo -e "  Large files detected ${YELLOW}⚠${NC}"
    echo "$LARGE_FILES" | while read -r file; do
        echo "    - $file ($(du -h "$file" | cut -f1))"
    done
fi

# Final result
echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues and try again.${NC}"
    echo ""
    echo "Quick fixes:"
    echo "  Python formatting: black custom_components/ tests/"
    echo "  Import sorting: isort custom_components/ tests/"
    echo "  TypeScript: cd pool-dashboard && npm run lint:fix"
    echo ""
    echo "To commit anyway (not recommended): git commit --no-verify"
    exit 1
fi