---
name: work-on
description: This skill should be used when the user invokes "/work-on" or asks to "work on issue", "implement issue", "fix issue", "work on multiple issues", "clear backlog", "work on next issue", or needs to systematically work through GitHub issues with conflict detection and sequential review.
version: 1.0.0
---

# Work On Skill

**Invocation**:
- `/work-on <issue-number>` - Work on a single issue
- `/work-on <issue-1> <issue-2> <issue-3>...` - Work on multiple issues
- `/work-on next` - Work on next priority issue
- `/work-on next <count>` - Work on next N priority issues

**Description**: Intelligently works on GitHub issues by creating branches, implementing fixes/features, and committing changes. When handling multiple issues, detects and avoids merge conflicts, allowing sequential review.

## Instructions

### Phase 1: Issue Collection & Analysis

#### Step 1.1: Collect Issues
Based on invocation pattern:

**Single Issue Number (e.g., `/work-on 15`)**
- Use `/gh-context 15` to get issue details
- Proceed with single-issue workflow

**Multiple Issue Numbers (e.g., `/work-on 15 23 42`)**
- Use `/gh-context <number>` for each issue
- Collect all issue details

**Next Priority (e.g., `/work-on next` or `/work-on next 3`)**
- Use `/gh-context next` to get prioritized issues
- Select top N issues (default 1 if count not specified)
- Confirm with user: "I found these issues to work on: [list]. Proceed?"

#### Step 1.2: Analyze for Conflicts (Multiple Issues Only)
For each issue, determine:
1. **Affected files**: Read issue description and comments to identify which files will likely be modified
2. **Change scope**: Estimate whether changes will be:
   - New files (no conflict risk)
   - Isolated file edits (low conflict risk)
   - Shared file edits (potential conflict)
   - Architectural changes (high conflict risk)

Create conflict matrix:
```
Issue #15: scraper/src/staging.ts, scraper/src/parser.ts
Issue #23: app/components/DeckBuilder.tsx (new file)
Issue #42: scraper/src/staging.ts, scraper/src/validator.ts

Conflicts detected:
- Issue #15 and #42: Both touch scraper/src/staging.ts
```

#### Step 1.3: Prioritize Issues
**Single Issue**: Skip prioritization, work on the issue

**Multiple Issues**:
1. Group by conflict potential:
   - **Group A**: No conflicts (can work on in any order)
   - **Group B**: Potential conflicts (must sequence carefully)
2. Determine work order:
   - Start with Group A (non-conflicting)
   - For Group B, order by:
     - Dependencies (work on foundational changes first)
     - File overlap (minimize conflicts)
     - Complexity (simpler changes first for easier review)
3. Present plan to user:
```
Work Plan:
1. Issue #23 - Add deck builder UI (new files, no conflicts)
2. Issue #15 - Fix scraper staging (touches staging.ts, parser.ts)
3. Issue #42 - Add validator (touches staging.ts - AFTER #15)

This order minimizes conflicts and allows sequential review.
Proceed? (yes/no)
```

### Phase 2: Work on Each Issue

For each issue in the prioritized order:

#### Step 2.1: Create Feature Branch
1. Ensure you're on master: `git checkout master`
2. Pull latest: `git pull origin master`
3. Create branch using format: `nikky/<type>-<short-description>`
   - Extract type from issue (bug, feature, enhancement, etc.)
   - Create concise description from issue title
   - Example: `nikky/fix-scraper-timeout`, `nikky/add-deck-builder`
4. Checkout branch: `git checkout -b <branch-name>`

#### Step 2.2: Implement Solution
1. Read relevant files to understand current implementation
2. Analyze issue requirements and acceptance criteria
3. Implement the fix/feature:
   - Make focused, minimal changes
   - Follow existing code patterns and style
   - Add necessary error handling
   - Avoid over-engineering or unnecessary refactoring
4. Test changes if possible (run tests, validate locally)

**For Multiple Issues - Sequential Review Strategy:**
- Keep changes focused and self-contained
- Avoid gratuitous refactoring that affects other issues
- Document any shared files touched with clear comments
- If an issue depends on another, note it in commit message

#### Step 2.3: Commit Changes
Use the `/commit` skill pattern:

1. Check git status and diff from master
2. Use `/gh-context <issue-number>` if needed to reference issue details
3. Generate commit message following format:
   ```
   <Title - imperative, max 50 chars>

   - <Bullet point 1>
   - <Bullet point 2>
   - <Bullet point 3>
   - <Bullet point 4>
   - <Bullet point 5>

   Closes #<issue-number>
   ```
4. Squash any work-in-progress commits: `git reset --soft origin/master`
5. Create single commit with clean message
6. **DO NOT push yet** - wait until all issues are complete

#### Step 2.4: Track Progress
After each issue is committed:
```
✓ Issue #23 - Branch: nikky/add-deck-builder - Files: app/components/*.tsx (5 new files)
→ Working on Issue #15...
```

### Phase 3: Post-Completion Review Guide

After all issues are complete, provide a comprehensive review guide:

#### Step 3.1: Summary Table
```
Review Guide - <N> Issues Completed
================================================================================

Branch                          Issue   Files Changed   Conflicts   Status
--------------------------------------------------------------------------------
nikky/add-deck-builder         #23     5 new files     None        ✓ Ready
nikky/fix-scraper-timeout      #15     2 modified      None        ✓ Ready
nikky/add-validator            #42     3 modified      staging.ts  ⚠ After #15
```

#### Step 3.2: Recommended Review Order
```
Recommended Review Order:
================================================================================

1. nikky/add-deck-builder (Issue #23)
   Why first: New files, no dependencies, self-contained
   Changed files:
   - app/components/DeckBuilder.tsx
   - app/components/BeybladeCard.tsx
   - app/components/CollectionTracker.tsx
   - app/styles/deckbuilder.css
   - app/pages/deck.tsx

   Test: npm run dev, visit /deck

2. nikky/fix-scraper-timeout (Issue #15)
   Why second: Foundation for #42, touches staging.ts
   Changed files:
   - scraper/src/staging.ts (added retry logic)
   - scraper/src/parser.ts (timeout handling)

   Test: npm run scrape:test

   ⚠ NOTE: Issue #42 modifies staging.ts - review this BEFORE merging #42

3. nikky/add-validator (Issue #42)
   Why last: Depends on #15's staging.ts changes
   Changed files:
   - scraper/src/validator.ts (new)
   - scraper/src/staging.ts (validation calls)
   - scraper/src/types.ts (validation types)

   Test: npm run test:validator

   ⚠ IMPORTANT: Review staging.ts changes in context of #15's changes
```

#### Step 3.3: Conflict Notes
If any conflicts were detected:
```
Potential Merge Conflicts:
================================================================================

staging.ts (touched by #15 and #42):
- Issue #15 adds retry logic in handleStaging() (lines ~45-60)
- Issue #42 adds validation calls in handleStaging() (lines ~50-55)
- Recommendation: Review #15 first, then review #42 in context
- If merging sequentially: Rebase #42 on master after #15 merges
```

#### Step 3.4: Next Steps
```
Next Steps:
================================================================================

For each branch, in order:
1. Review the code changes
2. Test locally: git checkout <branch-name> && <test commands>
3. Push branch: git push -u origin <branch-name>
4. Create PR: gh pr create --base master --head <branch-name>
5. Wait for reviews and CI to pass
6. Merge PR
7. Move to next branch

OR work in parallel:
- Push all branches now
- Create all PRs
- Review PRs in recommended order
- Merge sequentially to avoid conflicts

Current branches (not yet pushed):
- nikky/add-deck-builder
- nikky/fix-scraper-timeout
- nikky/add-validator

Would you like me to push all branches and create PRs now?
```

### Phase 4: Error Handling & Edge Cases

**Issue Not Found**
- "Issue #<number> not found. Please verify the issue exists."

**No Issues Match Criteria**
- "No issues found matching 'next'. Try /gh-context next to see available issues."

**Merge Conflict During Implementation**
- If `git checkout -b` fails due to conflicts:
  - "Cannot create branch - uncommitted changes or conflicts detected"
  - "Please resolve or stash changes: git stash"

**Implementation Failure**
- If unable to implement a fix:
  - "I was unable to fully implement Issue #<number> due to: <reason>"
  - "Skipping this issue. Would you like me to continue with remaining issues?"

**File Not Found**
- If issue references files that don't exist:
  - Note in implementation: "File <path> mentioned in issue does not exist - created new file"

**Overlapping Work in Progress**
- If branch already exists:
  - "Branch nikky/<name> already exists. Options:"
  - "1. Switch to existing branch and continue"
  - "2. Delete and recreate"
  - "3. Skip this issue"

### Important Reminders

**DO:**
- ✅ Use `/gh-context` to pull all issue details
- ✅ Use `/commit` patterns for clean commit messages
- ✅ Keep changes focused and minimal per issue
- ✅ Detect file conflicts between issues
- ✅ Provide clear review guidance after completion
- ✅ Create branch format: `nikky/<type>-<description>`
- ✅ Include `Closes #<issue>` in commit messages

**DON'T:**
- ❌ Push branches during implementation (wait until all done)
- ❌ Add AI attribution or Co-Authored-By lines
- ❌ Over-engineer or refactor unnecessarily
- ❌ Work on conflicting issues simultaneously
- ❌ Skip conflict analysis for multiple issues
- ❌ Leave user without clear next steps

## Examples

### Example 1: Single Issue
```
User: /work-on 15

Assistant: Fetches issue #15 using /gh-context
Assistant: Creates branch: nikky/fix-scraper-timeout
Assistant: Implements fix, commits with clean message
Assistant: ✓ Issue #15 complete - Branch: nikky/fix-scraper-timeout

Review Guide - 1 Issue Completed

Branch: nikky/fix-scraper-timeout (Issue #15)
Files changed: 2 modified
Test: npm run scrape:test

Next Steps:
- Review code: git checkout nikky/fix-scraper-timeout
- Push: git push -u origin nikky/fix-scraper-timeout  
- Create PR: gh pr create
```

### Example 2: Multiple Issues with Conflict Detection
```
User: /work-on 15 23 42

Assistant: Analyzing 3 issues for conflicts...

Conflict Analysis:
- Issue #15: scraper/src/staging.ts, scraper/src/parser.ts
- Issue #23: app/components/ (new files)
- Issue #42: scraper/src/staging.ts, scraper/src/validator.ts

⚠ Conflict detected: Issues #15 and #42 both modify staging.ts

Work Plan:
1. Issue #23 - Add deck builder UI (no conflicts, new files)
2. Issue #15 - Fix scraper timeout (touches staging.ts first)
3. Issue #42 - Add validator (touches staging.ts after #15)

Proceed? (yes/no)

User: yes

Assistant: [Works through each issue, creating branches and commits]

✓ Issue #23 complete - nikky/add-deck-builder
✓ Issue #15 complete - nikky/fix-scraper-timeout
✓ Issue #42 complete - nikky/add-validator

[Provides comprehensive review guide as shown in Phase 3]
```

### Example 3: Next Priority Issues
```
User: /work-on next 2

Assistant: Finding next 2 priority issues...

Found:
- Issue #18: Fix validation bug (priority, assignee: nikkyjsoriano)
- Issue #25: Update documentation (low priority)

Proceed with these issues? (yes/no)

User: yes

Assistant: [Works through both issues]
```
