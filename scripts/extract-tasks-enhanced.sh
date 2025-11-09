#!/bin/bash

# Enhanced task extraction for Spec Kit tasks.md files
# Extracts task IDs, phases, and creates appropriate labels

set -e

# Function to extract phase from task file context
get_task_phase() {
    local file=$1
    local task_line_num=$2
    
    # Search backwards from task line to find the most recent phase heading
    local phase=""
    local line_count=1
    
    while [ $line_count -le $task_line_num ]; do
        local line=$(sed -n "${line_count}p" "$file")
        
        # Check for phase headings like "## Phase 1: Project Setup"
        if [[ $line =~ ^##\ Phase\ ([0-9]+): ]]; then
            phase="phase-${BASH_REMATCH[1]}"
        fi
        
        ((line_count++))
    done
    
    echo "$phase"
}

# Function to extract priority from task line
get_task_priority() {
    local task_line=$1
    
    # Check for priority markers like [P] or [P1]
    if [[ $task_line =~ \[P([0-9]?)\] ]]; then
        if [ -n "${BASH_REMATCH[1]}" ]; then
            echo "priority-${BASH_REMATCH[1]}"
        else
            echo "priority-high"
        fi
    fi
}

# Enhanced task extraction with full context
extract_tasks_enhanced() {
    local file=$1
    
    # Get line numbers with tasks
    grep -n '^- \[ \]' "$file" | while IFS=':' read -r line_num task_line; do
        local task_id=""
        local task_title=""
        local phase=""
        local priority=""
        
        # Extract task ID and title
        if [[ $task_line =~ ^-\ \[\ \]\ (T[0-9]{3})\ (.+) ]]; then
            task_id="${BASH_REMATCH[1]}"
            task_title="${BASH_REMATCH[2]}"
        elif [[ $task_line =~ ^-\ \[\ \]\ (.+) ]]; then
            task_title="${BASH_REMATCH[1]}"
        fi
        
        # Get phase
        phase=$(get_task_phase "$file" "$line_num")
        
        # Get priority
        priority=$(get_task_priority "$task_line")
        
        # Clean title (remove priority markers)
        task_title=$(echo "$task_title" | sed 's/\[P[0-9]*\] *//')
        
        # Output format: ID|TITLE|PHASE|PRIORITY
        echo "${task_id}|${task_title}|${phase}|${priority}"
    done
}

# Example usage
if [ $# -eq 0 ]; then
    echo "Usage: $0 <tasks.md file>"
    echo ""
    echo "This script extracts tasks with their IDs, phases, and priorities"
    echo "Output format: TASK_ID|TITLE|PHASE|PRIORITY"
    exit 1
fi

file=$1

if [ ! -f "$file" ]; then
    echo "Error: File $file not found"
    exit 1
fi

echo "Extracting tasks from: $file"
echo ""
echo "Format: TASK_ID | TITLE | PHASE | PRIORITY"
echo "----------------------------------------"

extract_tasks_enhanced "$file" | while IFS='|' read -r id title phase priority; do
    printf "%-6s | %-50s | %-10s | %-12s\n" \
        "${id:-N/A}" \
        "$(echo "$title" | cut -c1-50)" \
        "${phase:-N/A}" \
        "${priority:-normal}"
done
