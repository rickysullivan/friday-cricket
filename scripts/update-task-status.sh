#!/bin/bash
# Helper script to update task status in GitHub issues and project board

REPO="rickysullivan/friday-cricket"
PROJECT_NUMBER=2
OWNER="rickysullivan"

# Project board Status field configuration
STATUS_FIELD_ID="PVTSSF_lAHOAAas6M4BHkHUzg4SGE0"
STATUS_TODO="f75ad846"
STATUS_IN_PROGRESS="47fc9ee4"
STATUS_DONE="98236657"

# Function to get issue number from task ID
get_issue_number() {
    local task_id="$1"
    gh issue list --repo "$REPO" --limit 200 --json number,labels \
        --jq ".[] | select(.labels[]? | .name == \"$task_id\") | .number"
}

# Function to get project item ID from issue number
get_project_item_id() {
    local issue_number="$1"
    gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --limit 200 --format json \
        | jq -r ".items[] | select(.content.number == $issue_number) | .id"
}

# Function to mark task as started
start_task() {
    local task_id="$1"
    local issue_number=$(get_issue_number "$task_id")

    if [ -z "$issue_number" ]; then
        echo "Error: Could not find issue for $task_id" >&2
        return 1
    fi

    echo "Starting $task_id (issue #$issue_number)..."

    # Add in-progress label
    gh issue edit "$issue_number" --repo "$REPO" --add-label "in-progress"

    # Update project board status
    local item_id=$(get_project_item_id "$issue_number")
    if [ -n "$item_id" ]; then
        gh project item-edit --project-id "PVT_kwHOAAas6M4BHkHU" \
            --id "$item_id" \
            --field-id "$STATUS_FIELD_ID" \
            --option-id "$STATUS_IN_PROGRESS" 2>/dev/null || true
    fi

    echo "✓ $task_id marked as in progress"
}

# Function to mark task as complete
complete_task() {
    local task_id="$1"
    local message="${2:-Completed}"
    local issue_number=$(get_issue_number "$task_id")

    if [ -z "$issue_number" ]; then
        echo "Error: Could not find issue for $task_id" >&2
        return 1
    fi

    echo "Completing $task_id (issue #$issue_number)..."

    # Close issue
    gh issue close "$issue_number" --repo "$REPO" --comment "✅ $message"

    echo "✓ $task_id completed and closed"
}

# Main command dispatcher
case "${1:-}" in
    start)
        start_task "$2"
        ;;
    complete)
        complete_task "$2" "$3"
        ;;
    *)
        echo "Usage: $0 {start|complete} TASK_ID [message]"
        exit 1
        ;;
esac
