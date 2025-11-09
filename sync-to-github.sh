#!/bin/bash

# One-Click Spec Kit GitHub Sync Setup
# Uses GitHub CLI (gh) when available for easier setup

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Spec Kit → GitHub Sync Setup          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Check for GitHub CLI
HAS_GH_CLI=false
if command -v gh &> /dev/null; then
    HAS_GH_CLI=true
    echo -e "${GREEN}✓ GitHub CLI detected - setup will be easier!${NC}"
    
    # Check if gh is authenticated
    if ! gh auth status &>/dev/null; then
        echo -e "${YELLOW}GitHub CLI not authenticated${NC}"
        echo "Let's log you in first..."
        gh auth login
    else
        echo -e "${GREEN}✓ GitHub CLI authenticated${NC}"
    fi
else
    echo -e "${YELLOW}GitHub CLI not found - will use API tokens${NC}"
    echo "Tip: Install GitHub CLI for easier setup: https://cli.github.com"
fi

echo ""

# Check if we're in the right place
if [ ! -d "specs" ] || [ ! -d "scripts" ]; then
    echo -e "${RED}Error: This script must be run from your project root${NC}"
    echo "Expected structure:"
    echo "  ./specs/           - Your specification files"
    echo "  ./scripts/         - Sync scripts"
    echo "  ./sync-to-github.sh - This script"
    exit 1
fi

# Step 1: Check for existing config
if [ -f ".speckit-github" ]; then
    echo -e "${YELLOW}Found existing GitHub configuration${NC}"
    source .speckit-github
    echo "  Repository: $GITHUB_OWNER/$GITHUB_REPO"
    read -p "Use existing configuration? (Y/n): " use_existing
    if [ "$use_existing" != "n" ] && [ "$use_existing" != "N" ]; then
        USE_EXISTING_CONFIG=true
    fi
fi

# Step 2: Configure GitHub if needed
if [ "$USE_EXISTING_CONFIG" != "true" ]; then
    echo -e "${BLUE}Step 1: GitHub Configuration${NC}"
    echo ""
    
    if [ "$HAS_GH_CLI" = true ]; then
        # Use gh to detect repo
        if gh repo view &>/dev/null; then
            repo_info=$(gh repo view --json owner,name)
            GITHUB_OWNER=$(echo "$repo_info" | jq -r '.owner.login')
            GITHUB_REPO=$(echo "$repo_info" | jq -r '.name')
            echo -e "${GREEN}Detected repository: $GITHUB_OWNER/$GITHUB_REPO${NC}"
            
            read -p "Use this repository? (Y/n): " use_detected
            if [ "$use_detected" == "n" ] || [ "$use_detected" == "N" ]; then
                read -p "GitHub Owner/Organization: " GITHUB_OWNER
                read -p "Repository Name: " GITHUB_REPO
            fi
        else
            read -p "GitHub Owner/Organization: " GITHUB_OWNER
            read -p "Repository Name: " GITHUB_REPO
        fi
        
        # No need for token with gh CLI
        GITHUB_TOKEN=""
    else
        # Manual configuration without gh
        echo "You need a GitHub Personal Access Token with 'repo' and 'project' scopes"
        echo "Create one at: https://github.com/settings/tokens"
        echo ""
        read -s -p "GitHub Token (ghp_...): " GITHUB_TOKEN
        echo ""
        
        # Try to detect from git
        if git remote get-url origin &>/dev/null; then
            detected_repo=$(git remote get-url origin | sed 's/.*\/\([^\/]*\)\.git$/\1/' 2>/dev/null)
            detected_owner=$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\)\/.*/\1/' 2>/dev/null)
            
            read -p "GitHub Owner [$detected_owner]: " GITHUB_OWNER
            GITHUB_OWNER=${GITHUB_OWNER:-$detected_owner}
            
            read -p "Repository Name [$detected_repo]: " GITHUB_REPO
            GITHUB_REPO=${GITHUB_REPO:-$detected_repo}
        else
            read -p "GitHub Owner/Organization: " GITHUB_OWNER
            read -p "Repository Name: " GITHUB_REPO
        fi
    fi
    
    # Project name
    read -p "GitHub Project Name (will create if doesn't exist) [Spec Kit Development]: " GITHUB_PROJECT_NAME
    GITHUB_PROJECT_NAME=${GITHUB_PROJECT_NAME:-"Spec Kit Development"}
    
    # Save configuration
    cat > .speckit-github <<EOF
# Spec Kit GitHub Sync Configuration
export GITHUB_TOKEN="$GITHUB_TOKEN"
export GITHUB_OWNER="$GITHUB_OWNER"
export GITHUB_REPO="$GITHUB_REPO"
export GITHUB_PROJECT_NAME="$GITHUB_PROJECT_NAME"
export SPEC_DIR="./specs"
export HAS_GH_CLI=$HAS_GH_CLI
EOF
    
    echo -e "${GREEN}✓ Configuration saved to .speckit-github${NC}"
    
    # Add to .gitignore
    if [ -f .gitignore ]; then
        if ! grep -q "^.speckit-github" .gitignore; then
            echo ".speckit-github" >> .gitignore
            echo -e "${GREEN}✓ Added .speckit-github to .gitignore${NC}"
        fi
    else
        echo ".speckit-github" > .gitignore
        echo -e "${GREEN}✓ Created .gitignore with .speckit-github${NC}"
    fi
fi

# Step 3: Check for specs without frontmatter
echo ""
echo -e "${BLUE}Step 2: Checking Specs${NC}"

specs_need_frontmatter=0
for spec in specs/*/*.md specs/*.md; do
    if [ -f "$spec" ]; then
        if ! head -1 "$spec" | grep -q "^---$"; then
            ((specs_need_frontmatter++))
        fi
    fi
done

if [ $specs_need_frontmatter -gt 0 ]; then
    echo -e "${YELLOW}Found $specs_need_frontmatter specs without frontmatter${NC}"
    echo "Adding GitHub-compatible frontmatter..."
    ./scripts/add-frontmatter.sh specs/
    echo -e "${GREEN}✓ Frontmatter added to all specs${NC}"
else
    echo -e "${GREEN}✓ All specs have frontmatter${NC}"
fi

# Step 4: Count what will be created
echo ""
echo -e "${BLUE}Step 3: Preview${NC}"

spec_count=$(find specs -name "*.md" -type f | wc -l)
task_count=$(grep -r "^- \[ \] T[0-9]\{3\}" specs/ 2>/dev/null | wc -l || echo "0")

echo "Will create in GitHub:"
echo "  • $spec_count main issues (one per spec)"
echo "  • $task_count task sub-issues"
echo "  • 1 project board: $GITHUB_PROJECT_NAME"
echo ""

if [ "$HAS_GH_CLI" = true ]; then
    echo -e "${GREEN}Using GitHub CLI for sync (faster and more reliable)${NC}"
else
    echo "Using GitHub API for sync"
fi
echo ""

# Step 5: Confirm and sync
read -p "Ready to sync to GitHub? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo ""
    echo "Sync cancelled. To sync later, run:"
    echo "  ./scripts/sync-to-github.sh"
    exit 0
fi

# Step 6: Run the sync
echo ""
echo -e "${BLUE}Step 4: Syncing to GitHub${NC}"
echo ""

# Source config
source .speckit-github

# Run sync
if ./scripts/sync-to-github.sh; then
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ Sync Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo ""
    
    if [ "$HAS_GH_CLI" = true ]; then
        echo "View your work:"
        echo "  • Issues: gh issue list --repo $GITHUB_OWNER/$GITHUB_REPO"
        echo "  • Web: gh issue view --web"
        echo "  • Project: gh project list --owner $GITHUB_OWNER"
    else
        echo "View your work in GitHub:"
        echo "  • Issues: https://github.com/$GITHUB_OWNER/$GITHUB_REPO/issues"
        echo "  • Project: https://github.com/$GITHUB_OWNER/$GITHUB_REPO/projects"
    fi
    
    echo ""
    echo "Next steps:"
    echo "  1. Call /speckit.implement to start development"
    echo "  2. Run watch mode for auto-sync: ./scripts/sync-to-github.sh watch"
    echo "  3. Check off tasks in GitHub as you complete them"
else
    echo ""
    echo -e "${RED}Sync failed. Please check your configuration and try again.${NC}"
    
    if [ "$HAS_GH_CLI" = false ]; then
        echo "Consider installing GitHub CLI for better reliability:"
        echo "  https://cli.github.com"
    fi
fi
