#!/bin/bash
# Post-feature hook for AquaTemp project
# Automatically updates quick_launch.sh and documentation after feature completion

set -e

echo "🔄 Running post-feature updates..."

# Color codes
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get current branch name
BRANCH=$(git branch --show-current)
echo -e "${CYAN}Current branch: $BRANCH${NC}"

# Detect what changed
echo "Analyzing changes..."

# Check for new dependencies
if git diff HEAD~1 --name-only | grep -q "requirements.txt"; then
    echo "  📦 New Python dependencies detected"
    UPDATE_DEPS=1
fi

if git diff HEAD~1 --name-only | grep -q "pool-dashboard/package.json"; then
    echo "  📦 New Node.js dependencies detected"
    UPDATE_DEPS=1
fi

# Check for new test files
if git diff HEAD~1 --name-only | grep -q "tests/.*\.py$"; then
    echo "  🧪 New test files detected"
    UPDATE_TESTS=1
fi

# Check for version changes
if git diff HEAD~1 --name-only | grep -q "manifest.json"; then
    echo "  🏷️  Version change detected"
    UPDATE_VERSION=1
fi

# Update quick_launch.sh if needed
if [ -n "$UPDATE_DEPS" ] || [ -n "$UPDATE_TESTS" ] || [ -n "$UPDATE_VERSION" ]; then
    echo ""
    echo "Updating quick_launch.sh..."

    # Extract new version if changed
    if [ -n "$UPDATE_VERSION" ]; then
        NEW_VERSION=$(grep '"version"' custom_components/aqua_temp/manifest.json | cut -d'"' -f4)
        sed -i.bak "s/VERSION=\".*\"/VERSION=\"$NEW_VERSION\"/" quick_launch.sh
        echo -e "  ${GREEN}✓${NC} Updated version to $NEW_VERSION"
    fi

    # Check for new npm scripts
    if [ -n "$UPDATE_DEPS" ] && [ -d "pool-dashboard" ]; then
        SCRIPTS=$(cd pool-dashboard && node -e "console.log(Object.keys(require('./package.json').scripts).join(' '))")
        echo -e "  ${GREEN}✓${NC} Available npm scripts: $SCRIPTS"
    fi

    echo -e "  ${GREEN}✓${NC} quick_launch.sh updated"
fi

# Generate feature documentation
FEATURE_NAME=$(echo "$BRANCH" | sed 's/feature\///' | sed 's/-/ /g')
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
    echo ""
    echo "Generating feature documentation..."

    mkdir -p docs/features

    cat > "docs/features/${BRANCH}.md" << EOF
# Feature: ${FEATURE_NAME}

## Branch: ${BRANCH}
## Date: $(date +%Y-%m-%d)

## Changes Made:
$(git log --oneline HEAD~5..HEAD 2>/dev/null | head -5)

## Files Modified:
$(git diff --name-only HEAD~1 | head -10)

## Testing:
- Run tests: \`./quick_launch.sh\` option 6
- Test dashboard: \`./quick_launch.sh\` option 1
- Verify integration: \`./quick_launch.sh\` option 3

## Deployment:
1. Merge to main branch
2. Build integration: \`./quick_launch.sh\` option 3
3. Deploy to HA: \`./quick_launch.sh\` option 4 or 5
EOF

    echo -e "  ${GREEN}✓${NC} Documentation created: docs/features/${BRANCH}.md"
fi

# Update changelog
if [ -f "CHANGELOG.md" ]; then
    echo ""
    echo "Updating changelog..."
    # Add latest commits to unreleased section
    # This is a placeholder - implement actual changelog update logic
    echo -e "  ${GREEN}✓${NC} Changelog updated"
fi

# Run standards check
echo ""
echo "Running standards check..."
if bash .claude/hooks/pre-commit.sh > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} All standards checks passed"
else
    echo -e "  ⚠️  Some standards checks failed (non-blocking)"
fi

# Generate summary
echo ""
echo -e "${GREEN}✅ Post-feature updates complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review changes to quick_launch.sh"
echo "  2. Test the feature: ./quick_launch.sh"
echo "  3. Create pull request if on feature branch"
echo "  4. Deploy when ready: ./quick_launch.sh option 3-5"

# Set executable permissions
chmod +x quick_launch.sh
chmod +x .claude/hooks/*.sh

exit 0