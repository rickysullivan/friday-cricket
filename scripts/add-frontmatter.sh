#!/bin/bash

# Add frontmatter to spec files that don't have it
# This ensures specs are ready for GitHub sync

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to extract title from markdown
extract_title() {
    local file=$1
    # Try to get first H1 heading
    local title=$(grep -m1 "^# " "$file" 2>/dev/null | sed 's/^# //')
    
    if [ -z "$title" ]; then
        # Fallback to filename
        title=$(basename "$file" .md | sed 's/-/ /g' | sed 's/_/ /g')
    fi
    
    echo "$title"
}

# Function to detect status from content
detect_status() {
    local file=$1
    local content=$(cat "$file")
    
    if echo "$content" | grep -qi "Status: Draft"; then
        echo "planning"
    elif echo "$content" | grep -qi "Status: In Progress"; then
        echo "in-progress"
    elif echo "$content" | grep -qi "Status: Review"; then
        echo "review"
    elif echo "$content" | grep -qi "Status: Complete"; then
        echo "completed"
    else
        echo "planning"  # Default
    fi
}

# Function to extract feature branch
extract_feature() {
    local file=$1
    local feature=$(grep -i "Feature Branch" "$file" 2>/dev/null | sed 's/.*Feature Branch[: ]*//i' | sed 's/`//g' | tr -d '\r\n')
    
    if [ -z "$feature" ]; then
        feature=$(basename "$file" .md)
    fi
    
    echo "$feature"
}

# Function to check if file has frontmatter
has_frontmatter() {
    local file=$1
    head -1 "$file" | grep -q "^---$"
}

# Function to add frontmatter to a file
add_frontmatter() {
    local file=$1
    
    if has_frontmatter "$file"; then
        echo -e "${YELLOW}Skipping $file (already has frontmatter)${NC}"
        return
    fi
    
    echo -e "${BLUE}Processing: $file${NC}"
    
    # Extract metadata
    local title=$(extract_title "$file")
    local status=$(detect_status "$file")
    local feature=$(extract_feature "$file")
    local date=$(date +%Y-%m-%d)
    
    # Determine labels based on filename
    local labels=""
    case "$(basename "$file")" in
        spec.md)
            labels="specification, feature"
            ;;
        plan.md)
            labels="plan, architecture"
            ;;
        tasks.md)
            labels="tasks, implementation"
            ;;
        requirements.md)
            labels="requirements, validation"
            ;;
        research.md)
            labels="research, analysis"
            ;;
        data-model.md)
            labels="data-model, architecture"
            ;;
        *)
            labels="documentation"
            ;;
    esac
    
    # Create frontmatter
    local frontmatter="---
title: $title
status: $status
feature: $feature
labels: $labels
created: $date
updated: $date
---

"
    
    # Add frontmatter to file
    echo "$frontmatter$(cat "$file")" > "$file.tmp"
    mv "$file.tmp" "$file"
    
    echo -e "${GREEN}✓ Added frontmatter to $file${NC}"
    echo "  Title: $title"
    echo "  Status: $status"
    echo "  Labels: $labels"
}

# Function to process your uploaded specs
process_uploaded_specs() {
    local uploads_dir="/mnt/user-data/uploads"
    
    if [ ! -d "$uploads_dir" ]; then
        echo -e "${YELLOW}No uploads directory found${NC}"
        return
    fi
    
    echo -e "${GREEN}=== Processing Uploaded Specs ===${NC}"
    echo ""
    
    for file in "$uploads_dir"/*.md; do
        if [ -f "$file" ]; then
            add_frontmatter "$file"
        fi
    done
}

# Function to process specs in a directory
process_directory() {
    local dir=${1:-./specs}
    
    if [ ! -d "$dir" ]; then
        echo -e "${YELLOW}Directory $dir not found${NC}"
        return
    fi
    
    echo -e "${GREEN}=== Processing Specs in $dir ===${NC}"
    echo ""
    
    find "$dir" -name "*.md" -type f | while read -r file; do
        add_frontmatter "$file"
    done
}

# Main execution
main() {
    echo -e "${GREEN}=== Spec Frontmatter Processor ===${NC}"
    echo "This script adds GitHub-sync compatible frontmatter to spec files"
    echo ""
    
    # Check for command line argument
    case "${1:-}" in
        uploads)
            process_uploaded_specs
            ;;
        all)
            process_uploaded_specs
            process_directory "./specs"
            process_directory "./tasks"
            ;;
        *)
            # Process specific directory or current specs
            process_directory "${1:-./specs}"
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}Processing complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review the added frontmatter in your spec files"
    echo "2. Run './scripts/sync-to-github.sh' to sync with GitHub"
    echo "3. Check GitHub Issues for the created items"
}

# Run main
main "$@"
