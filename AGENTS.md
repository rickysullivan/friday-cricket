# Agent Notes & Learnings

This file contains lessons learned and best practices for AI agents working on this project.

## GitHub Sync Script (`scripts/sync-to-github.sh`)

### Critical Checklist Before Running

**ALWAYS do these checks before syncing to GitHub:**

1. **Test environment verification:**
   - Check OS: `uname -s` (Darwin = macOS, requires special handling)
   - Verify GitHub CLI auth: `gh auth status`
   - Confirm repository: `gh repo view`

2. **Data validation:**
   - Count expected tasks: `grep -c "^- \[ \] T[0-9]" specs/*/tasks.md`
   - Check for existing issues: `gh issue list --limit 200`
   - If duplicates exist, STOP and clean up first

3. **Script compatibility (macOS specific):**
   - ✅ `sed -i ''` (not `sed -i`) - macOS requires empty string for in-place edits
   - ✅ Use `< <(command)` not `command |` for loops to avoid subshell scope issues
   - ✅ Redirect informational echo to stderr (`>&2`) in functions that return values
   - ✅ Use arrays for `gh` commands, not string concatenation with `eval`

### Known Gotchas

1. **GitHub CLI has default limits:**
   - `gh issue list` defaults to 30 items
   - `gh project item-list` defaults to 30 items
   - **ALWAYS use `--limit 200`** when checking totals

2. **Issue states:**
   - GitHub only accepts `open` or `closed` - not custom states like `planning`
   - `gh issue edit` has NO `--state` flag - use `gh issue close`/`gh issue reopen`

3. **Project scope:**
   - Projects can be user-level (`users/{owner}/projects/{n}`) or repo-level
   - User-level projects allow cross-repo tracking (preferred for this project)
   - Project numbers are NOT the same as issue numbers

4. **Label creation:**
   - Labels must exist before being applied to issues
   - The script auto-creates missing labels - this is intentional

### Debugging Strategy (If Something Fails)

**DON'T:**
- ❌ Run the sync script repeatedly on live data
- ❌ Fix errors one at a time without understanding root cause
- ❌ Assume issue counts without explicit `--limit 200` checks
- ❌ Delete issues until you understand what created them

**DO:**
1. ✅ Check current state first:
   ```bash
   echo "Tasks: $(grep -c "^- \[ \] T[0-9]" specs/*/tasks.md)"
   echo "Issues: $(gh issue list --repo OWNER/REPO --limit 200 | wc -l)"
   echo "Project: $(gh project item-list N --owner OWNER --limit 200 | wc -l)"
   ```

2. ✅ If numbers don't match, find the discrepancy:
   ```bash
   # Find duplicates
   gh issue list --limit 200 --json number,labels | \
     jq -r '.[] | select(.labels[].name | startswith("T")) | .labels[] | select(.name | startswith("T")) | .name' | \
     sort | uniq -d

   # Find missing from project
   comm -23 <(gh issue list --limit 200 --json number | jq -r '.[].number' | sort) \
            <(gh project item-list N --limit 200 --json number | jq -r '.items[].content.number' | sort)
   ```

3. ✅ Clean up before re-syncing:
   ```bash
   # Remove github_issue fields from specs
   find specs -name "*.md" -exec sed -i '' '/^github_issue:/d' {} \;
   ```

4. ✅ Test on a dummy repo first if making script changes

### Expected Behavior

For this project with 119 tasks in `tasks.md`:
- **119 GitHub issues** (one per task)
- **119 items** in the project board
- Each issue should have:
  - Task ID label (T001-T119)
  - Additional tags from `[TAG]` markers (e.g., `p` from `[P]`)
  - Clean title (no task ID or tag markers)
  - User story labels (us1, us2, etc.)

### Tag Extraction Rules

The script extracts tags from task titles:
- `T001` → Label: `T001` (task ID, kept as-is)
- `[P]` → Label: `p` (lowercase)
- `[US1]` → Label: `us1` (lowercase)
- Multiple tags: `T002 [P] [US3]` → Labels: `T002, p, us3`

Title is cleaned: `T002 [P] Install dependencies` → `Install dependencies`

## General Debugging Principles

1. **Validate assumptions early** - Don't assume tools work the same cross-platform
2. **Test in isolation** - Use dummy data before touching production
3. **Understand before fixing** - Root cause analysis > tactical patches
4. **Verify end state** - Success = verified 1:1 mapping, not "script ran"
5. **Document learnings** - Update this file when you discover new gotchas

---

*Last updated: 2025-11-09*
*Context: Initial sync script debugging session*
