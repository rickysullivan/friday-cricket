#!/bin/bash

# Spec Kit to GitHub Issues/Projects Sync Script
# Uses GitHub CLI (gh) if available, otherwise falls back to API calls

set -e

# Configuration
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
GITHUB_OWNER="${GITHUB_OWNER:-}"
GITHUB_REPO="${GITHUB_REPO:-}"
GITHUB_PROJECT_NAME="${GITHUB_PROJECT_NAME:-${GITHUB_PROJECT_NUMBER:-}}"
SPEC_DIR="${SPEC_DIR:-./specs}"
TASK_DIR="${TASK_DIR:-./tasks}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect if GitHub CLI is available
HAS_GH_CLI=false
if command -v gh &> /dev/null; then
    HAS_GH_CLI=true
    echo -e "${GREEN}✓ GitHub CLI detected${NC}"
else
    echo -e "${YELLOW}GitHub CLI not found, using API calls${NC}"
fi

# Function to check dependencies
check_dependencies() {
    local missing_deps=0
    
    if [ "$HAS_GH_CLI" = false ]; then
        # Check for API dependencies
        for cmd in jq curl grep sed; do
            if ! command -v $cmd &> /dev/null; then
                echo -e "${RED}Error: $cmd is not installed${NC}"
                missing_deps=1
            fi
        done
        
        if [ -z "$GITHUB_TOKEN" ]; then
            echo -e "${RED}Error: GITHUB_TOKEN environment variable is not set${NC}"
            echo "Either install GitHub CLI (gh) or set GITHUB_TOKEN"
            missing_deps=1
        fi
    else
        # Check if gh is authenticated
        if ! gh auth status &>/dev/null; then
            echo -e "${YELLOW}GitHub CLI not authenticated. Running 'gh auth login'...${NC}"
            gh auth login
        fi
    fi
    
    if [ -z "$GITHUB_OWNER" ] || [ -z "$GITHUB_REPO" ]; then
        # Try to detect from current repo
        if [ "$HAS_GH_CLI" = true ] && gh repo view &>/dev/null; then
            local repo_info=$(gh repo view --json owner,name)
            GITHUB_OWNER=$(echo "$repo_info" | jq -r '.owner.login')
            GITHUB_REPO=$(echo "$repo_info" | jq -r '.name')
            echo -e "${GREEN}Detected repository: $GITHUB_OWNER/$GITHUB_REPO${NC}"
        elif git remote get-url origin &>/dev/null; then
            local remote_url=$(git remote get-url origin)
            if [[ $remote_url =~ github\.com[:/]([^/]+)/([^/]+)(\.git)?$ ]]; then
                GITHUB_OWNER="${BASH_REMATCH[1]}"
                GITHUB_REPO="${BASH_REMATCH[2]%.git}"
                echo -e "${GREEN}Detected from git: $GITHUB_OWNER/$GITHUB_REPO${NC}"
            fi
        else
            echo -e "${RED}Error: GITHUB_OWNER and GITHUB_REPO must be set${NC}"
            missing_deps=1
        fi
    fi
    
    if [ $missing_deps -eq 1 ]; then
        exit 1
    fi
}

# Function to extract frontmatter from markdown
extract_frontmatter() {
    local file=$1
    local field=$2
    
    # Extract value between --- markers
    sed -n '/^---$/,/^---$/p' "$file" | grep "^$field:" | sed "s/^$field: *//" | sed 's/^"\(.*\)"$/\1/'
}

# Function to extract tasks from spec files with IDs
extract_tasks() {
    local file=$1

    # Returns format: "TASK_ID|TASK_TITLE|TAGS" or "TASK_TITLE|TAGS"
    # TAGS are comma-separated labels extracted from [TAG] patterns
    grep -E '^#{2,3} Task.*:|^- \[ \]' "$file" | while read -r line; do
        if [[ $line =~ ^#{2,3}\ Task.*:\ (.+) ]]; then
            echo "${BASH_REMATCH[1]}||"
        elif [[ $line =~ ^-\ \[\ \]\ (T[0-9]{3})\ (.+) ]]; then
            # Handle Spec Kit format: - [ ] T001 Description
            # Extract task ID as a tag (keep the T prefix)
            local task_id="${BASH_REMATCH[1]}"
            local title="${BASH_REMATCH[2]}"
            local tags="$task_id"

            # Extract all [TAG] markers and convert to labels
            while [[ $title =~ ^\[([A-Za-z0-9_-]+)\]\ (.+) ]]; do
                local tag="${BASH_REMATCH[1]}"
                # Convert tag to lowercase for label
                tag=$(echo "$tag" | tr '[:upper:]' '[:lower:]')
                tags="$tags,$tag"
                title="${BASH_REMATCH[2]}"
            done

            # Return task ID, title, and tags separated by |
            echo "${task_id}|${title}|${tags}"
        elif [[ $line =~ ^-\ \[\ \]\ (.+) ]]; then
            # Handle regular checkbox format
            local title="${BASH_REMATCH[1]}"
            local tags=""

            # Extract all [TAG] markers and convert to labels
            while [[ $title =~ ^\[([A-Za-z0-9_-]+)\]\ (.+) ]]; do
                local tag="${BASH_REMATCH[1]}"
                # Convert tag to lowercase for label
                tag=$(echo "$tag" | tr '[:upper:]' '[:lower:]')
                if [ -n "$tags" ]; then
                    tags="$tags,$tag"
                else
                    tags="$tag"
                fi
                title="${BASH_REMATCH[2]}"
            done

            echo "${title}|${tags}"
        fi
    done
}

# Get current phase from context (for phase labels)
get_task_phase() {
    local file=$1
    local task_line=$2
    
    # Look for phase headers like "## Phase 1: Setup"
    local phase=$(grep -B50 "$task_line" "$file" | grep "^## Phase [0-9]" | tail -1 | sed -n 's/^## Phase \([0-9]\+\):.*/phase-\1/p')
    echo "${phase:-phase-1}"
}

# ========== GitHub CLI Functions ==========

# Check if issue exists using gh
gh_issue_exists() {
    local title=$1
    
    # Search for issue with exact title
    gh issue list \
        --repo "$GITHUB_OWNER/$GITHUB_REPO" \
        --search "\"$title\" in:title" \
        --state all \
        --limit 1 \
        --json number \
        --jq '.[0].number' 2>/dev/null
}

# Ensure label exists
gh_ensure_label() {
    local label=$1

    # Check if label exists
    if ! gh label list --repo "$GITHUB_OWNER/$GITHUB_REPO" --json name --jq ".[].name" | grep -qx "$label"; then
        # Create label with a default color
        gh label create "$label" --repo "$GITHUB_OWNER/$GITHUB_REPO" --color "0E8A16" --description "Auto-created label" &>/dev/null || true
    fi
}

# Create issue using gh
gh_create_issue() {
    local title=$1
    local body=$2
    local labels=$3
    local assignee=$4

    # Ensure all labels exist first
    if [ -n "$labels" ]; then
        IFS=',' read -ra label_array <<< "$labels"
        for label in "${label_array[@]}"; do
            label=$(echo "$label" | xargs)
            if [ -n "$label" ]; then
                gh_ensure_label "$label"
            fi
        done
    fi

    local args=(
        "issue" "create"
        "--repo" "$GITHUB_OWNER/$GITHUB_REPO"
        "--title" "$title"
        "--body" "$body"
    )

    if [ -n "$labels" ]; then
        # Convert comma-separated to individual labels
        IFS=',' read -ra label_array <<< "$labels"
        for label in "${label_array[@]}"; do
            # Trim whitespace
            label=$(echo "$label" | xargs)
            if [ -n "$label" ]; then
                args+=("--label" "$label")
            fi
        done
    fi

    if [ -n "$assignee" ]; then
        args+=("--assignee" "$assignee")
    fi

    # Execute and extract issue number from output
    local output=$(gh "${args[@]}" 2>&1)
    echo "$output" | grep -oE '[0-9]+$' | tail -1
}

# Update issue using gh
gh_update_issue() {
    local issue_number=$1
    local title=$2
    local body=$3
    local state=$4

    # Update title and body
    gh issue edit "$issue_number" \
        --repo "$GITHUB_OWNER/$GITHUB_REPO" \
        --title "$title" \
        --body "$body" &>/dev/null

    # Update state separately (gh issue edit doesn't support --state flag)
    case "$state" in
        closed|done|completed)
            gh issue close "$issue_number" --repo "$GITHUB_OWNER/$GITHUB_REPO" &>/dev/null || true
            ;;
        open|planning|in-progress|*)
            gh issue reopen "$issue_number" --repo "$GITHUB_OWNER/$GITHUB_REPO" &>/dev/null || true
            ;;
    esac
}

# Create or get project using gh
gh_ensure_project() {
    local project_name=$1

    # Check if project exists
    local project_number=$(gh project list \
        --owner "$GITHUB_OWNER" \
        --format json \
        | jq -r ".projects[] | select(.title == \"$project_name\") | .number" \
        | head -1)

    if [ -z "$project_number" ]; then
        # Create new project
        echo "Creating project: $project_name" >&2
        project_number=$(gh project create \
            --owner "$GITHUB_OWNER" \
            --title "$project_name" \
            --format json \
            | jq -r '.number')

        if [ -n "$project_number" ]; then
            echo -e "${GREEN}Created project #$project_number${NC}" >&2
        fi
    else
        echo -e "${GREEN}Using existing project #$project_number${NC}" >&2
    fi

    echo "$project_number"
}

# Add issue to project using gh
gh_add_to_project() {
    local issue_number=$1
    local project_number=$2
    
    gh project item-add "$project_number" \
        --owner "$GITHUB_OWNER" \
        --url "https://github.com/$GITHUB_OWNER/$GITHUB_REPO/issues/$issue_number" \
        &>/dev/null
}

# ========== API Fallback Functions ==========

# Check if issue exists using API
api_issue_exists() {
    local title=$1
    
    curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues?state=all&per_page=100" \
        | jq -r --arg title "$title" '.[] | select(.title == $title) | .number' \
        | head -1
}

# Create issue using API
api_create_issue() {
    local title=$1
    local body=$2
    local labels=$3
    local assignee=$4
    
    local data=$(jq -n \
        --arg title "$title" \
        --arg body "$body" \
        --arg labels "$labels" \
        --arg assignee "$assignee" \
        '{
            title: $title,
            body: $body,
            labels: ($labels | split(",") | map(select(. != ""))),
            assignees: (if $assignee != "" then [$assignee] else [] end)
        }')
    
    curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues" \
        | jq -r '.number'
}

# Update issue using API
api_update_issue() {
    local issue_number=$1
    local title=$2
    local body=$3
    local state=$4

    # Map custom states to GitHub's open/closed
    case "$state" in
        closed|done|completed)
            state="closed"
            ;;
        *)
            state="open"
            ;;
    esac

    local data=$(jq -n \
        --arg title "$title" \
        --arg body "$body" \
        --arg state "$state" \
        '{
            title: $title,
            body: $body,
            state: $state
        }')

    curl -s -X PATCH \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues/$issue_number" \
        > /dev/null
}

# ========== Wrapper Functions ==========

# Wrapper to use gh or API
issue_exists() {
    if [ "$HAS_GH_CLI" = true ]; then
        gh_issue_exists "$1"
    else
        api_issue_exists "$1"
    fi
}

create_issue() {
    if [ "$HAS_GH_CLI" = true ]; then
        gh_create_issue "$1" "$2" "$3" "$4"
    else
        api_create_issue "$1" "$2" "$3" "$4"
    fi
}

update_issue() {
    if [ "$HAS_GH_CLI" = true ]; then
        gh_update_issue "$1" "$2" "$3" "$4"
    else
        api_update_issue "$1" "$2" "$3" "$4"
    fi
}

# Update spec file with issue number
update_spec_with_issue() {
    local file=$1
    local issue_number=$2
    
    # Check if file has frontmatter
    if grep -q "^---$" "$file"; then
        # Update existing frontmatter
        if grep -q "^github_issue:" "$file"; then
            sed -i '' "s/^github_issue:.*/github_issue: $issue_number/" "$file"
        else
            # Add github_issue to frontmatter after the first ---
            # Use awk instead of sed for more reliable insertion
            awk -v issue="$issue_number" '
                BEGIN { first_delim = 0 }
                /^---$/ {
                    print
                    if (first_delim == 0) {
                        print "github_issue: " issue
                        first_delim = 1
                    }
                    next
                }
                { print }
            ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
        fi
    else
        # Add frontmatter
        echo -e "---\ngithub_issue: $issue_number\n---\n$(cat "$file")" > "$file"
    fi
}

# Process a spec/task file
process_file() {
    local file=$1
    local file_type=$2
    
    echo -e "${GREEN}Processing: $file${NC}"
    
    # Extract metadata
    local title=$(extract_frontmatter "$file" "title")
    local github_issue=$(extract_frontmatter "$file" "github_issue")
    local status=$(extract_frontmatter "$file" "status")
    local assignee=$(extract_frontmatter "$file" "assignee")
    local labels=$(extract_frontmatter "$file" "labels")
    
    # If no title in frontmatter, extract from filename or first heading
    if [ -z "$title" ]; then
        title=$(basename "$file" .md | sed 's/-/ /g' | sed 's/_/ /g')
    fi
    
    # Generate issue body from file content
    local body="**Source**: $file
**Type**: $file_type

## Description
$(sed -n '/^---$/,/^---$/!p' "$file" | head -20)

---
*This issue is automatically synced from Spec Kit*"
    
    # Check if issue exists
    if [ -n "$github_issue" ]; then
        # Update existing issue
        echo "  Updating issue #$github_issue"
        update_issue "$github_issue" "$title" "$body" "${status:-open}"

        # Add to project if configured
        if [ -n "$PROJECT_NUMBER" ] && [ "$HAS_GH_CLI" = true ]; then
            gh_add_to_project "$github_issue" "$PROJECT_NUMBER"
        fi
    else
        # Check if issue with same title exists
        existing_issue=$(issue_exists "$title")

        if [ -n "$existing_issue" ]; then
            echo "  Found existing issue #$existing_issue"
            update_spec_with_issue "$file" "$existing_issue"
            update_issue "$existing_issue" "$title" "$body" "${status:-open}"

            # Add to project if configured
            if [ -n "$PROJECT_NUMBER" ] && [ "$HAS_GH_CLI" = true ]; then
                gh_add_to_project "$existing_issue" "$PROJECT_NUMBER"
            fi
        else
            # Create new issue
            echo "  Creating new issue..."
            new_issue=$(create_issue "$title" "$body" "$labels" "$assignee")

            if [ -n "$new_issue" ] && [ "$new_issue" != "null" ]; then
                echo -e "  ${GREEN}Created issue #$new_issue${NC}"
                update_spec_with_issue "$file" "$new_issue"

                # Add to project if configured
                if [ -n "$PROJECT_NUMBER" ]; then
                    if [ "$HAS_GH_CLI" = true ]; then
                        gh_add_to_project "$new_issue" "$PROJECT_NUMBER"
                    fi
                    echo "  Added to project #$PROJECT_NUMBER"
                fi
            else
                echo -e "  ${RED}Failed to create issue${NC}"
            fi
        fi
    fi
    
    # Process tasks within the spec
    if [ "$file_type" == "spec" ] || [ "$file_type" == "tasks" ]; then
        extract_tasks "$file" | while IFS='|' read -r task_id_or_title task_title task_tags; do
            # Check if we have a task ID (format: T001|Title|Tags) or just title
            if [ -n "$task_title" ]; then
                # We have both ID and title
                local task_id="$task_id_or_title"
                local task_name="$task_title"
                local task_labels="task"

                # Add extracted tags (which includes task ID and [TAG] markers)
                if [ -n "$task_tags" ]; then
                    task_labels="$task_labels,$task_tags"
                fi

                # Add parent labels
                if [ -n "$labels" ]; then
                    task_labels="$task_labels,$labels"
                fi

                echo "  Found task $task_id: $task_name"
            else
                # We only have title (no task ID)
                local task_name="$task_id_or_title"
                local task_labels="task"

                # Add any extracted tags from [TAG] patterns
                if [ -n "$task_title" ]; then
                    task_labels="$task_labels,$task_title"
                fi

                # Add parent labels
                if [ -n "$labels" ]; then
                    task_labels="$task_labels,$labels"
                fi

                echo "  Found task: $task_name"
            fi
            
            # Create sub-issue for task
            local task_body="**Parent Spec**: $file"
            
            if [ -n "$task_id" ]; then
                task_body="$task_body
**Task ID**: $task_id"
            fi
            
            task_body="$task_body
**Description**: $task_name

---
*This task is part of the spec defined in $file*"
            
            existing_task=$(issue_exists "$task_name")
            
            if [ -z "$existing_task" ]; then
                task_issue=$(create_issue "$task_name" "$task_body" "$task_labels" "$assignee")
                
                if [ -n "$task_issue" ] && [ "$task_issue" != "null" ]; then
                    if [ -n "$task_id" ]; then
                        echo -e "    ${GREEN}Created task issue #$task_issue ($task_id)${NC}"
                    else
                        echo -e "    ${GREEN}Created task issue #$task_issue${NC}"
                    fi
                    
                    # Add to project
                    if [ -n "$PROJECT_NUMBER" ] && [ "$HAS_GH_CLI" = true ]; then
                        gh_add_to_project "$task_issue" "$PROJECT_NUMBER"
                    fi
                fi
            else
                echo -e "    ${YELLOW}Task already exists as issue #$existing_task${NC}"
            fi
        done
    fi
}

# Main execution
main() {
    echo -e "${GREEN}=== Spec Kit to GitHub Sync ===${NC}"
    
    check_dependencies
    
    echo "Repository: $GITHUB_OWNER/$GITHUB_REPO"
    
    # Handle project creation if needed
    PROJECT_NUMBER=""
    if [ -n "$GITHUB_PROJECT_NAME" ]; then
        if [ "$HAS_GH_CLI" = true ]; then
            PROJECT_NUMBER=$(gh_ensure_project "$GITHUB_PROJECT_NAME")
        else
            echo -e "${YELLOW}Project creation requires GitHub CLI${NC}"
        fi
    fi
    
    echo ""
    
    # Process spec files
    if [ -d "$SPEC_DIR" ]; then
        echo -e "${YELLOW}Processing spec files...${NC}"
        while IFS= read -r file; do
            # Determine file type
            case "$(basename "$file")" in
                tasks.md)
                    file_type="tasks"
                    ;;
                spec.md)
                    file_type="spec"
                    ;;
                *)
                    file_type="spec"
                    ;;
            esac

            process_file "$file" "$file_type"
        done < <(find "$SPEC_DIR" -name "*.md" -type f)
    fi
    
    # Process task files
    if [ -d "$TASK_DIR" ] && [ "$TASK_DIR" != "$SPEC_DIR" ]; then
        echo -e "${YELLOW}Processing task files...${NC}"
        while IFS= read -r file; do
            process_file "$file" "task"
        done < <(find "$TASK_DIR" -name "*.md" -type f)
    fi
    
    echo ""
    echo -e "${GREEN}Sync complete!${NC}"
    
    if [ "$HAS_GH_CLI" = true ]; then
        echo ""
        echo "View in GitHub:"
        echo "  Issues: gh issue list --repo $GITHUB_OWNER/$GITHUB_REPO"
        echo "  Project: gh project list --owner $GITHUB_OWNER"
        echo ""
        echo "Or visit:"
        echo "  https://github.com/$GITHUB_OWNER/$GITHUB_REPO/issues"
    fi
}

# Handle command line arguments
case "${1:-}" in
    watch)
        # Watch mode - sync on file changes
        echo "Watching for changes..."
        while true; do
            inotifywait -r -e modify,create,delete "$SPEC_DIR" "$TASK_DIR" 2>/dev/null || true
            main
            sleep 2
        done
        ;;
    status)
        # Show sync status
        if [ "$HAS_GH_CLI" = true ]; then
            echo "Open issues:"
            gh issue list --repo "$GITHUB_OWNER/$GITHUB_REPO" --limit 10
            echo ""
            echo "Recent closed:"
            gh issue list --repo "$GITHUB_OWNER/$GITHUB_REPO" --state closed --limit 5
        else
            echo "Status command requires GitHub CLI"
        fi
        ;;
    *)
        main
        ;;
esac
