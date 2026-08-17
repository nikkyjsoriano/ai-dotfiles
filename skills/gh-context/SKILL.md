---
name: gh-context
description: This skill should be used when the user invokes "/gh-context" or asks to "get GitHub context", "pull issues", "check PR feedback", "show PR reviews", "find what to work on", "list issues", or needs information about GitHub issues, pull requests, or comments.
version: 1.0.0
---

# GitHub Context Skill

**Invocation**: `/gh-context [issue/pr number] [action]`

**Description**: Uses GitHub MCP to pull down issues, PRs, comments, and help determine what to work on next. Always confirms before taking write actions.

## Instructions

When invoked, **ALWAYS use GitHub MCP tools exclusively** for all GitHub operations.

### 1. Determine Repository Context

First, get the current repository:
```bash
git remote get-url origin
```

Parse to extract `owner/repo` format (e.g., `nikkyjsoriano/beyblade`).

### 2. Available Actions

#### Read Operations (No Confirmation Needed)

**List Open Issues**
- Use `mcp__github__list_issues` to get all open issues
- Filter by labels, assignee, or milestone if specified
- Present in priority order with:
  - Issue number and title
  - Labels and assignee
  - Created/updated dates
  - Comment count

**Get Issue Details**
- Use `mcp__github__get_issue` for specific issue number
- Show full description and metadata
- Use `mcp__github__get_issue_comments` to fetch all comments
- Present timeline of discussion
- Identify action items or blockers mentioned

**List Pull Requests**
- Use `mcp__github__list_pull_requests` to get open PRs
- Show PR number, title, author, status
- Include checks status (passing/failing)
- Show review status (approved, changes requested, pending)

**Get PR Details**
- Use `mcp__github__get_pull_request` for specific PR number
- Use `mcp__github__get_pull_request_files` to see changed files
- Use `mcp__github__get_pull_request_comments` for review comments
- Use `mcp__github__get_pull_request_reviews` for review summaries
- Use `mcp__github__get_pull_request_status` for CI/CD status
- Use `mcp__github__get_pull_request_diff` to see full diff if needed

**Find What to Work On Next**
- Use `mcp__github__list_issues` with filters:
  - Open issues assigned to user
  - Issues with specific labels (e.g., "good first issue", "bug", "enhancement")
  - Issues sorted by priority/updated date
- Analyze issue descriptions and comments
- Suggest next task based on:
  - Urgency (mentions of deadlines, blockers)
  - Dependencies (what's blocking other work)
  - User's recent activity
- Present recommendation with context

**Search Issues/PRs**
- Use `mcp__github__search_issues` or `mcp__github__search_pull_requests`
- Search by keywords from user query
- Return relevant results with context

#### Write Operations (REQUIRE User Confirmation)

**CRITICAL**: Before executing ANY write operation, you MUST:
1. Show the user EXACTLY what will be posted/changed
2. Ask for explicit confirmation
3. Only proceed after user approves

**Add Issue Comment**
- Draft comment based on user request
- Show preview: "I will post this comment to issue #X:"
- Display formatted comment
- Ask: "Proceed with posting this comment? (yes/no)"
- Only call `mcp__github__add_issue_comment` after confirmation

**Add PR Comment**
- Draft comment based on user request
- Show preview: "I will post this comment to PR #X:"
- Display formatted comment
- Ask: "Proceed with posting this comment? (yes/no)"
- Only call `mcp__github__add_comment_to_pending_review` or similar after confirmation

**Request Re-Review**
- Identify reviewers who requested changes
- Draft re-review request message
- Show: "I will request re-review from [reviewers] with message:"
- Display message
- Ask: "Proceed with re-review request? (yes/no)"
- Use appropriate GitHub MCP tool after confirmation

**Create Issue**
- Draft issue with title, description, labels
- Show full preview of issue content
- Ask: "Create this issue? (yes/no)"
- Only call `mcp__github__create_issue` after confirmation

**Update Issue/PR**
- Show current state vs. proposed changes
- Ask: "Apply these changes? (yes/no)"
- Use `mcp__github__update_issue` or `mcp__github__update_pull_request` after confirmation

### 3. Common Usage Patterns

**Pattern: "What should I work on next?"**
```
/gh-context next
```
Actions:
1. Use `mcp__github__list_issues` filtered by assignee or priority labels
2. Analyze open issues for urgency and dependencies
3. Check user's recent commits to understand current context
4. Recommend top 3 issues to work on with reasoning

**Pattern: "Get context on issue #15"**
```
/gh-context 15
```
Actions:
1. Use `mcp__github__get_issue` to fetch issue #15
2. Use `mcp__github__get_issue_comments` to get discussion
3. Summarize:
   - What the issue is about
   - Current status/progress
   - Action items or blockers
   - Related PRs or issues

**Pattern: "Show PR #42 feedback"**
```
/gh-context pr 42
```
Actions:
1. Use `mcp__github__get_pull_request` to fetch PR #42
2. Use `mcp__github__get_pull_request_reviews` to get review summaries
3. Use `mcp__github__get_pull_request_comments` to get detailed feedback
4. Use `mcp__github__get_pull_request_status` to check CI status
5. Organize feedback by:
   - Blocking issues (changes requested)
   - Suggestions (non-blocking comments)
   - CI/check failures
   - Approved reviews
6. Create action plan for addressing feedback

**Pattern: "Comment on PR #42"**
```
/gh-context pr 42 comment "Fixed the issues you mentioned"
```
Actions:
1. Draft comment: "Fixed the issues you mentioned"
2. Show preview with PR context
3. **ASK FOR CONFIRMATION**
4. Post only after user approves

**Pattern: "List all bugs"**
```
/gh-context issues label:bug
```
Actions:
1. Use `mcp__github__list_issues` with label filter
2. Display all bug issues with status

### 4. Output Format

**Issue Summary:**
```
Issue #15: Add WBO tournament scraper
Status: Open | Assignee: nikkyjsoriano | Labels: enhancement, priority
Created: 2026-01-15 | Updated: 2026-02-10 | Comments: 7

Description:
[Issue description]

Recent Activity:
- 2026-02-10: Comment by user: "Started implementation"
- 2026-02-08: Comment by user: "Researching scraping approach"

Action Items:
✓ Research WBO website structure
✓ Design database schema
→ Implement scraper (in progress)
☐ Add error handling
☐ Set up automation
```

**PR Review Summary:**
```
PR #23: Add deck builder UI
Status: Changes Requested | Author: nikkyjsoriano | Checks: 2/3 passing
Branch: nikky/add-deck-builder → master

Reviews:
❌ reviewer1: Requested changes
  - "Add error handling for API calls" (src/api.ts:45)
  - "Extract magic numbers to constants" (src/config.ts:12)

✅ reviewer2: Approved
  - "Looks good overall, nice work on the responsive design"

CI Status:
✓ Build: Passing
✓ Tests: Passing
❌ Lint: Failing - "3 ESLint errors"

Next Steps:
1. Fix lint errors
2. Address reviewer1's feedback
3. Push changes and request re-review
```

### 5. Error Handling

- **Repository not found**: Verify git remote and GitHub access
- **Issue/PR not found**: Check number and repository
- **GitHub API errors**: Display error message and suggest retrying
- **No issues found**: "No open issues match your criteria"
- **Permission denied**: "You may not have access to this repository or resource"

### 6. GitHub MCP Tools Reference

Always use these MCP tools (never use `gh` CLI or GitHub API directly):

**Issues:**
- `mcp__github__list_issues`
- `mcp__github__get_issue`
- `mcp__github__get_issue_comments`
- `mcp__github__create_issue`
- `mcp__github__update_issue`
- `mcp__github__add_issue_comment`
- `mcp__github__search_issues`

**Pull Requests:**
- `mcp__github__list_pull_requests`
- `mcp__github__get_pull_request`
- `mcp__github__get_pull_request_comments`
- `mcp__github__get_pull_request_reviews`
- `mcp__github__get_pull_request_status`
- `mcp__github__get_pull_request_files`
- `mcp__github__get_pull_request_diff`
- `mcp__github__create_pull_request`
- `mcp__github__update_pull_request`

**Reviews:**
- `mcp__github__add_comment_to_pending_review`
- `mcp__github__create_pending_pull_request_review`
- `mcp__github__submit_pending_pull_request_review`

**Search:**
- `mcp__github__search_issues`
- `mcp__github__search_pull_requests`

## Important Reminders

- ✅ **ALWAYS** use GitHub MCP tools exclusively
- ✅ **ALWAYS** confirm before write operations
- ✅ Show full preview of comments/changes before posting
- ✅ Wait for explicit user approval
- ❌ **NEVER** post comments without confirmation
- ❌ **NEVER** use `gh` CLI or GitHub API directly
- ❌ **NEVER** assume user approval

## Examples

**Example 1: Read-only context**
```
User: /gh-context next
Assistant: [Uses mcp__github__list_issues, analyzes, recommends next task]
```

**Example 2: Write action with confirmation**
```
User: /gh-context pr 42 comment "Addressed all feedback"
Assistant: I will post this comment to PR #42:

---
Addressed all feedback

- Fixed error handling in API calls
- Extracted magic numbers to constants
- Resolved ESLint errors
---

Proceed with posting this comment? (yes/no)

User: yes
Assistant: [Calls mcp__github__add_comment_to_pending_review]
Comment posted successfully to PR #42.
```
