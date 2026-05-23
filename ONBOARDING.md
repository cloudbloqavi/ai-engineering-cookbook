# Getting Started: AI-Native Engineering for Everyone

> Estimated read time: ~25 min | No prior AI experience needed

---

## Table of Contents

1. [Who This Is For](#1-who-this-is-for)
2. [What is AI-Native Development?](#2-what-is-ai-native-development)
3. [The Two Tools](#3-the-two-tools)
4. [Installation](#4-installation)
5. [Scenario A — Adding a Feature to an Existing App (Brownfield)](#5-scenario-a--adding-a-feature-to-an-existing-app-brownfield)
6. [Scenario B — Building a New App from Scratch (Greenfield)](#6-scenario-b--building-a-new-app-from-scratch-greenfield)
7. [The TDD Loop Explained Simply](#7-the-tdd-loop-explained-simply)
8. [When Things Go Wrong](#8-when-things-go-wrong)
9. [Common Beginner Mistakes](#9-common-beginner-mistakes)
10. [FAQ](#10-faq)
11. [Glossary](#11-glossary)
12. [You Know You're Doing It Right When...](#12-you-know-youre-doing-it-right-when)

---

## 1. Who This Is For

This guide is for you if:

- You write code but have never used an AI coding agent for more than autocomplete
- You've used GitHub Copilot to suggest the next line of code but not to implement an entire feature
- You're an intern starting your first AI-assisted project and have no idea what "AI-native" means
- You're a backend or frontend developer curious about what AI-native workflows actually look like in practice
- You're a product manager who can read and write code but has never shipped a feature using AI agents
- You're a Java, Python, or Go developer who has heard about Claude Code or Cursor and wonders how they fit into a real engineering workflow

You do not need to know machine learning, prompt engineering, or anything about how large language models work. You need to know how to run commands in a terminal and read code. That is enough.

---

## 2. What is AI-Native Development?

### The old way versus the new way

In traditional development, you are the driver at every stage:

```
Traditional development:
  You → think → code → test → review → ship
```

In AI-native development, you shift roles. You are still the decision-maker and architect, but an AI agent handles most of the implementation:

```
AI-native development:
  You → describe → AI plans → AI codes → AI tests → you review → ship
```

The key insight: your most valuable skill is no longer "can type the right syntax fast." It becomes "can describe what needs to be built clearly enough that the AI cannot misinterpret it."

### The translation table

If you come from traditional software development, here is how the familiar concepts map to AI-native equivalents:

| Traditional | AI-Native Equivalent |
|---|---|
| Writing a PRD or user story | Running `/speckit.specify` — describe the feature in plain English |
| Sprint planning meeting | Running `/speckit.plan` — AI generates the technical approach |
| Breaking into Jira tickets | Running `/speckit.tasks` — AI generates a numbered task checklist |
| Pair programming with a senior dev | Superpowers subagent-driven-development — AI implements task by task |
| Code review | Superpowers `requesting-code-review` — automated quality gate |
| Unit tests you write | TDD loop: RED (write failing test) → GREEN (write code) → REFACTOR |

### The complete workflow in one ASCII diagram

```
YOUR IDEA
    │
    ▼
┌──────────────────────────────────────────────────────────────────────┐
│  SPEC-KIT PHASE  ("What to build")                                   │
│                                                                      │
│  /speckit.constitution  ← encode your project's rules and stack      │
│          │                                                           │
│  /speckit.specify       ← describe the feature in plain language     │
│          │                                                           │
│  /speckit.clarify       ← structured Q&A removes ambiguity          │
│          │                                                           │
│  /speckit.plan          ← technical approach (files, APIs, design)   │
│          │                                                           │
│  /speckit.tasks ────────────────────► tasks.md                       │
└──────────────────────────────────────────────────────────────────────┘
                                            │
                                            │  ← you paste the handoff message
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│  SUPERPOWERS PHASE  ("How to build it")                              │
│                                                                      │
│  using-git-worktrees         ← isolated workspace, clean baseline    │
│          │                                                           │
│  Per task:                                                           │
│    RED    → write a failing test                                     │
│    GREEN  → write the minimum code to make it pass                  │
│    REFACTOR → clean up; tests must stay green                        │
│          │                                                           │
│  requesting-code-review      ← automated quality gate               │
│          │                                                           │
│  finishing-a-development-branch ← merge / PR decision               │
└──────────────────────────────────────────────────────────────────────┘
    │
    ▼
WORKING FEATURE IN YOUR CODEBASE
```

### The one concept to internalize before anything else

`tasks.md` is the handoff artifact. Spec-Kit produces it. Superpowers executes it. Do not skip the handoff message that bridges the two tools. Without it, the AI will re-plan from scratch and create a contradicting task list.

---

## 3. The Two Tools

### Spec-Kit — your AI project manager and architect

In one sentence: Spec-Kit is a set of slash commands that guide you through planning a feature before any code is written, producing a structured task list that an AI agent can execute.

Spec-Kit does not write code. It writes documents. Those documents tell the coding agent exactly what to build and in what order.

The files Spec-Kit creates live in a `.specify/` directory in your project:

```
your-project/
└── .specify/
    ├── memory/
    │   └── constitution.md    ← "Your project's rules"
    │                             Tech stack, protected files, dependency policy,
    │                             coding standards. The agent reads this before
    │                             every action. It wins all conflicts.
    └── specs/
        └── 001-user-auth/
            ├── spec.md        ← "What to build"
            │                     User stories, acceptance criteria written in
            │                     Given/When/Then format. The source of truth.
            ├── plan.md        ← "How to build it"
            │                     Technical approach: which files, which APIs,
            │                     which patterns to use.
            └── tasks.md       ← "Step-by-step checklist"
                                  Numbered tasks the agent executes one by one.
                                  The HANDOFF ARTIFACT between Spec-Kit and
                                  Superpowers. Do not edit this file directly.
```

**The 6 Spec-Kit commands in plain English:**

| Command | What you're asking it to do |
|---|---|
| `/speckit.constitution` | "Write down my project's rules so the agent never has to guess" |
| `/speckit.specify` | "Here's the feature I want. Help me write a proper spec." |
| `/speckit.clarify` | "Ask me questions until there's no ambiguity left" |
| `/speckit.analyze` | "Check the spec for contradictions or missing pieces" (optional) |
| `/speckit.plan` | "Given the spec and my stack, how should this be built technically?" |
| `/speckit.tasks` | "Turn the plan into a numbered checklist the AI can execute" |

### Superpowers — your AI senior developer

In one sentence: Superpowers is a plugin for AI coding agents that enforces test-driven development, manages isolated workspaces, and gates progress on code quality — so the AI builds features correctly instead of just fast.

Superpowers skills fire automatically based on context. You do not invoke them manually by typing commands.

| Skill | When it fires | What it does |
|---|---|---|
| `using-git-worktrees` | After handoff | Creates isolated workspace; verifies tests pass before touching code |
| `subagent-driven-development` | Per task | Spawns a fresh focused agent per task; prevents context bleed |
| `test-driven-development` | During implementation | Enforces RED → GREEN → REFACTOR; will not skip the failing test step |
| `requesting-code-review` | Between tasks | Automated quality gate; blocks on critical spec or code issues |
| `finishing-a-development-branch` | All tasks complete | Handles merge decision, PR creation, or branch keep/discard |

**How Spec-Kit and Superpowers connect:**

```
Spec-Kit phase                   Superpowers phase
      │                                │
      │ produces                       │ executes
      │                                │
      ▼                                ▼
  tasks.md  ────── handoff message ──► TDD loop
                       │
               (you paste this message
                to trigger the handoff)
```

The handoff message is a short block of text you paste into your agent session. It tells Superpowers: "Spec-Kit is done. Use this plan. Do not create a new one." Without it, Superpowers may fire its own planning skills and produce a duplicate plan that conflicts with Spec-Kit's output.

---

## 4. Installation

### Step 1: Install uv (Python package manager used by Spec-Kit)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# Expected output:
# Downloading installer...
# Installing uv to /home/yourname/.local/bin/uv
# uv installed successfully
```

If you already have Python installed, you do not need to understand uv in depth. It is just the tool that installs Spec-Kit reliably across platforms.

### Step 2: Install Spec-Kit

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
# Expected output:
# Installed 1 tool: specify-cli
```

Verify it works:

```bash
specify --version
# Expected output:
# specify-cli x.y.z
```

### Step 3: Install Superpowers in Claude Code

Open Claude Code and type this slash command:

```
/plugin install superpowers@claude-plugins-official
# Expected output:
# Plugin installed successfully: superpowers
```

For other agents:

```bash
# Cursor:
/add-plugin superpowers

# Gemini CLI:
gemini extensions install https://github.com/obra/superpowers

# Codex CLI:
# Use /plugins → search "superpowers" → select Install
```

### Step 4: Initialize Spec-Kit in your project

**Greenfield (new project — blank directory):**

```bash
specify init my-project --integration claude
cd my-project
# Expected output:
# Created my-project/
# Initialized .specify/ directory
# Created .specify/memory/ and .specify/specs/
```

**Brownfield (existing project — adding to existing code):**

```bash
cd your-existing-project
specify init . --force --integration claude
# Expected output:
# Initialized .specify/ directory (existing files untouched)
# Created .specify/memory/ and .specify/specs/
```

Note: `--force` is safe. It only creates the `.specify/` directory and does not touch any of your existing source files.

**Verify setup:**

```bash
ls .specify/
# Expected output:
# memory/   specs/   templates/   scripts/
```

---

## 5. Scenario A — Adding a Feature to an Existing App (Brownfield)

**Scenario:** You work on an Express.js + PostgreSQL app. Your PM just asked you to add a user authentication system with JWT tokens. Here's exactly what you do.

Brownfield means there is already code running. The key extra rule: confirm all existing tests pass before writing a single new line of code. You need a green baseline before you start — otherwise you cannot tell if your changes broke something.

### Step 1: Open your terminal in the project directory

```bash
cd /path/to/your-express-app
```

### Step 2: Verify the existing test baseline

```bash
npm test
# Expected: All existing tests pass. Zero failures.
```

If tests fail before you touch anything: stop. Do not proceed. Report the failures. You cannot add a feature responsibly on top of a broken baseline.

### Step 3: Initialize Spec-Kit (if not already done)

```bash
specify init . --force --integration claude
# Expected: Creates .specify/ without touching existing files
```

### Step 4: Run Brownfield Bootstrap (recommended for first-time setup)

If you have the Brownfield Bootstrap extension installed, run it to auto-discover your architecture:

```
/brownfield-bootstrap
# Expected: Discovers stack (Node.js, Express, PostgreSQL),
#           lists protected modules, notes test framework
```

This saves you from manually describing everything in the constitution. Feed the output into the next step.

### Step 5: Run /speckit.constitution

Type this in your agent:

```
/speckit.constitution Capture our existing project constraints:
  - Current tech stack: Node.js 20, Express.js 4.x, PostgreSQL, Knex.js
  - Do not modify: src/database/migrations/ (DBA approval required)
  - Existing test framework: Jest with supertest for integration tests
  - Required coverage threshold: 80%
  - Dependency policy: new npm packages require team lead approval in PR
  - Branch naming convention: NNN-kebab-slug (e.g. 001-user-auth)
```

**What the AI responds:** It generates `.specify/memory/constitution.md` — a structured document capturing your constraints.

**What file gets created:** `.specify/memory/constitution.md`

**What to check:** Open `constitution.md` and read it. Every constraint you named should appear. If anything is wrong or missing, edit the file directly. This is the cheapest moment to fix it.

### Step 6: Run /speckit.specify

```
/speckit.specify Add user authentication to the Express app.
Users log in with email and password.
After login they receive a JWT token for subsequent requests.
Failed logins should not reveal whether the email exists (security requirement).
```

**What the AI responds:** Spec-Kit creates a feature directory and begins generating the spec.

**What file gets created:** `.specify/specs/001-user-auth/spec.md`

**What to check:** Open `spec.md`. You should see user stories in Given/When/Then format, such as: "Given a valid email and password, when the user POSTs to /auth/login, then they receive a 200 response with a JWT token." Read every acceptance criterion. If something is wrong, fix it in `spec.md` now — it is far cheaper to fix here than after code is written.

### Step 7: Run /speckit.clarify

```
/speckit.clarify
```

**Example Q&A:**

> Spec-Kit: "Should JWT tokens expire? If so, after how long?"
> You: "Yes. 24-hour expiry for access tokens."

> Spec-Kit: "Should the app use httpOnly cookies or Authorization headers for token transport?"
> You: "httpOnly cookies."

> Spec-Kit: "What should happen when a user's token has expired and they make a request?"
> You: "Return 401 Unauthorized. The client handles re-login."

**What gets created:** Spec-Kit appends a Clarifications section to `spec.md`.

**What to check:** Read the updated `spec.md`. All your answers should appear as concrete decisions.

### Step 8: Run /speckit.plan

```
/speckit.plan Use the existing tech stack from constitution.md.
No new dependencies unless absolutely necessary.
JWT tokens, 24-hour expiry, httpOnly cookies.
```

**What gets created:** `.specify/specs/001-user-auth/plan.md` (technical implementation plan) and optionally `research.md`.

**What to check:** Read `plan.md`. It should describe which files to create or modify (e.g., "Create `src/auth/login.js`", "Add `POST /auth/login` route to `src/routes/auth.js`"). If the approach looks wrong, re-run `/speckit.plan` with more specific instructions.

### Step 9: Run /speckit.tasks

```
/speckit.tasks
```

**What gets created:** `.specify/specs/001-user-auth/tasks.md`

**What to check:** Open `tasks.md`. It looks like:

```
[ ] Task 1: Create password hashing utility using existing bcryptjs package
[ ] Task 2: Add comparePassword method to User model
[ ] Task 3: Create POST /auth/login endpoint handler
[ ] Task 4: Add JWT token generation utility
[ ] Task 5: Write integration test for successful login
[ ] Task 6: Write integration tests for failed login cases (wrong password, nonexistent email)
[ ] Task 7: Add auth middleware to protect existing routes
```

Read every task. If a task is unclear, or if something obvious is missing, stop here. Changing tasks after implementation starts is expensive.

### The .specify/ directory after setup

```
your-express-app/
└── .specify/
    ├── memory/
    │   └── constitution.md    ← "Your project's rules"
    │                             Tech stack, protected paths, coding standards.
    │                             The agent reads this before every action.
    └── specs/
        └── 001-user-auth/
            ├── spec.md        ← "What to build"
            │                     User stories + acceptance criteria.
            │                     Source of truth for feature behavior.
            ├── plan.md        ← "How to build it"
            │                     Technical approach: files, APIs, patterns.
            └── tasks.md       ← "Step-by-step checklist"
                                  The HANDOFF ARTIFACT. Spec-Kit produces it.
                                  Superpowers executes it.
                                  Do not edit directly.
```

### Step 10: Send the handoff message

Paste this into your agent session (replace placeholders):

```
Use the implementation plan in:
  .specify/specs/001-user-auth/tasks.md

Constraints:
  - Do not generate a new plan
  - Do not create a new git branch (already created by Spec-Kit as 001-user-auth)
  - Verify that all existing tests pass BEFORE touching any files
  - Follow the tech stack and protected modules in .specify/memory/constitution.md
  - Do not introduce new dependencies without explicit approval
  - All changes must be backward compatible
```

### Step 11: Superpowers takes over

From this point you will see:

1. Superpowers creates a git worktree — an isolated copy of the repo on the `001-user-auth` branch
2. It runs your existing tests to confirm the baseline is still green
3. For Task 1: writes a failing test → writes minimum code → cleans up → runs two-stage review → commits
4. For Task 2: same loop
5. Continues until all tasks are complete
6. Runs `requesting-code-review` — an automated quality gate
7. Runs `finishing-a-development-branch` — prompts for merge or PR creation

### Step 12: Review the output

While Superpowers works through tasks, your job is to review each task's output:

- Does the test test what the acceptance criterion actually says?
- Is the implementation doing more than the task requires?
- Did the agent touch any protected paths?

If you see a problem: type a correction immediately. "That test does not cover the case where the password field is empty. Fix the test." Do not let problems accumulate.

---

## 6. Scenario B — Building a New App from Scratch (Greenfield)

**Scenario:** You want to build an expense tracker web app with Next.js. You have a blank directory.

Greenfield means you start with nothing. There are no existing tests to protect. The key difference from brownfield: there is no Brownfield Bootstrap step and no baseline test run needed. The constitution focuses on your desired stack rather than existing constraints.

### Step 1: Initialize Spec-Kit for a new project

```bash
specify init expense-tracker --integration claude
cd expense-tracker
# Expected: Creates expense-tracker/ with .specify/ inside
```

### Step 2: Run /speckit.constitution

Your constitution defines the project from scratch rather than capturing existing constraints:

```
/speckit.constitution Create principles for a new expense tracker:
  - Tech stack: Next.js 14, TypeScript, PostgreSQL via Prisma
  - Test framework: vitest with React Testing Library
  - Coverage requirement: 80% minimum
  - No external API calls without approval
  - All currency values stored as integers (cents), never floats
  - No new npm packages without explicit approval in this session
```

**What gets created:** `.specify/memory/constitution.md`

**What to check:** Open it and verify the stack and rules are right. This is where you encode decisions like "never store floats for currency" that will govern every implementation task.

### Step 3: Run /speckit.specify

Focus on WHAT the feature does and WHY. Do not mention implementation details yet.

```
/speckit.specify Build an expense tracker web app.
Users can add expenses with a date, amount, category, and optional note.
Users can view all expenses sorted by date (newest first).
Users can filter expenses by category.
The app shows a running total for the current view.
```

**What gets created:** `.specify/specs/001-expense-tracker/spec.md`

**What to check:** You should see acceptance criteria like: "Given I filter by category 'Food', when I view my expenses, then I see only Food expenses and the total reflects only those expenses."

### Step 4: Run /speckit.clarify

```
/speckit.clarify
```

Spec-Kit will ask:

> "What categories exist — a fixed list or user-defined?"
> Answer: "Fixed list: Food, Transport, Housing, Entertainment, Other."

> "Should the running total cover all time or a selectable date range?"
> Answer: "All time for the first version."

> "Is authentication needed (multiple user accounts) or is this single-user?"
> Answer: "Single user, no auth in v1."

These decisions get appended to `spec.md` as concrete constraints. Making them now prevents the agent from guessing later.

### Step 5: Run /speckit.plan

```
/speckit.plan
Stack: Next.js 14 with TypeScript, PostgreSQL via Prisma.
Server-side rendering for the expense list. API routes for create/delete.
No separate backend server — Next.js API routes handle everything.
```

**What gets created:** `.specify/specs/001-expense-tracker/plan.md`

**What to check:** The plan should name specific files (e.g., "Create `app/expenses/page.tsx`", "Create `app/api/expenses/route.ts`") and describe the data model (Prisma schema for the `expenses` table).

### Step 6: Run /speckit.tasks

```
/speckit.tasks
```

Expected output — `tasks.md` with roughly 8-12 tasks:

```
[ ] Task 1: Create Prisma schema with Expense model (date, amount, category, note)
[ ] Task 2: Create database migration and seed script
[ ] Task 3: Write unit tests for expense data access functions
[ ] Task 4: Implement expense data access layer (create, findAll, findByCategory)
[ ] Task 5: Create POST /api/expenses endpoint with validation
[ ] Task 6: Create GET /api/expenses endpoint with optional category filter
[ ] Task 7: Write integration tests for API endpoints
[ ] Task 8: Build expense list page with category filter UI
[ ] Task 9: Build add expense form component
[ ] Task 10: Write component tests for expense list and form
```

### Step 7: Send the handoff message

```
Use the implementation plan in:
  .specify/specs/001-expense-tracker/tasks.md

Constraints:
  - Do not generate a new plan
  - Do not create a new git branch (already created by Spec-Kit)
  - Follow the tech stack and principles in .specify/memory/constitution.md
  - Write tests before implementation code (TDD)
  - All tasks must pass the two-stage review before moving on
```

### Step 8: Superpowers takes over

Superpowers works through each task in the TDD loop. Your job during implementation:

1. After each task: read the test and the implementation — does it match the spec?
2. After all tasks: run the app locally. Try the features. Does it work as you described?
3. Before the final review: check the constitution — did the agent stay within the constraints?

### Step 9: Review and verify

After all tasks complete:

```bash
# Start the dev server
npm run dev
# Expected: Next.js running on http://localhost:3000

# Open your browser and try:
# - Adding an expense
# - Filtering by category
# - Verifying the running total changes with the filter
```

If the app does not work as you described in the spec: do not mark it done. Find the gap between the test coverage and the real behavior. Add acceptance tests that catch it, then fix.

---

## 7. The TDD Loop Explained Simply

TDD (Test-Driven Development) means you write the test before you write the code. Many developers know this in theory but have never done it in practice. Here is what it looks like with AI agents.

### Why it matters

Without TDD, the agent might write code that looks right and passes a quick manual check but breaks when input is slightly different. With TDD, the test defines exactly what "correct" means before any implementation is written.

### The three phases

**RED: Write a test that fails**

Write a test for behavior that does not exist yet. The test should fail — not because the test is broken, but because the feature isn't built yet. If the test passes before you write any implementation code, the test is wrong.

Example: Testing an email validation function that does not exist yet:

```javascript
// RED: This test should fail because validateEmail doesn't exist yet
import { validateEmail } from './validators';

test('accepts a valid email address', () => {
  expect(validateEmail('user@example.com')).toBe(true);
});

test('rejects email without @ symbol', () => {
  expect(validateEmail('notanemail')).toBe(false);
});

test('rejects email without domain', () => {
  expect(validateEmail('user@')).toBe(false);
});
```

Run the tests. They should fail with "validateEmail is not a function" or similar. That is correct.

**GREEN: Write the minimum code to make the test pass**

Not the best code. Not the most elegant code. Just enough code to make the test pass.

```javascript
// GREEN: Minimum implementation to pass the three tests above
export function validateEmail(email) {
  return email.includes('@') && email.split('@')[1].length > 0;
}
```

Run the tests. All three should now pass.

**REFACTOR: Clean it up**

Now that you have a passing test, improve the code. Handle edge cases. Use a better approach. The test protects you — if your refactoring breaks behavior, the test will fail.

```javascript
// REFACTOR: Cleaner, more correct implementation
export function validateEmail(email) {
  const parts = email.split('@');
  return parts.length === 2 && parts[0].length > 0 && parts[1].includes('.');
}
```

Run the tests. They should still pass.

### The TDD loop as a diagram

```
        ┌─────────────────────────────────────────────┐
        │                                             │
        ▼                                             │
    ┌───────┐                                         │
    │  RED  │ ← Write a failing test                 │
    └───┬───┘   (fails because feature doesn't exist) │
        │                                             │
        ▼                                             │
    ┌───────┐                                         │
    │ GREEN │ ← Write minimum code to pass            │
    └───┬───┘   (not perfect, just passing)           │
        │                                             │
        ▼                                             │
    ┌──────────┐                                      │
    │ REFACTOR │ ← Clean up, tests must stay green   │
    └──────┬───┘                                      │
           │                                          │
           └──── next task ──────────────────────────►┘
```

### What the AI does in each phase

- **RED:** Superpowers' `test-driven-development` skill writes the failing test from the task's acceptance criteria. It will not proceed until it has confirmed the test fails for the right reason (not a syntax error, but a genuine missing implementation).
- **GREEN:** The agent writes the minimum implementation. If it writes more than the task requires, Superpowers flags it.
- **REFACTOR:** The agent cleans up, then re-runs tests to confirm nothing broke.

---

## 8. When Things Go Wrong

### Problem 1: "The agent created a new branch even though I said not to"

**Cause:** The handoff message was not seen or not followed.
**Solution:** Stop the agent. Run `git branch` to see the extra branch. Delete it with `git branch -d branch-name`. Re-paste the handoff message with explicit wording at the top: "IMPORTANT: Do not create any new git branches. The branch 001-user-auth already exists."

### Problem 2: "The agent is implementing things not in tasks.md"

**Cause:** The agent is in "brainstorming mode" — it saw a problem and tried to solve adjacent issues.
**Solution:** Stop the agent. Type: "Stop. Do not add anything not in tasks.md. The current task is Task N. Do only what Task N describes. Nothing else."

### Problem 3: "Tests were passing but the feature doesn't actually work"

**Cause:** The tests are too narrow — they test the happy path only, not real user behavior.
**Solution:** Run the Verify Tasks Extension if available (`/verify-tasks-ext`). Manually test the feature against every acceptance criterion in `spec.md`. For each criterion that fails, write a new test that captures the failure, then fix the implementation.

### Problem 4: "The agent keeps asking me questions instead of coding"

**Cause:** The handoff message is missing or the agent does not have enough information in `tasks.md`.
**Solution:** First check: did you paste the full handoff message? If yes, check that `tasks.md` exists and each task has clear acceptance criteria. If a task is genuinely ambiguous, answer the agent's question explicitly, then say: "Now proceed with that decision. Do not ask again."

### Problem 5: "I ran /speckit.plan but the plan looks wrong"

**Cause:** The spec was ambiguous, or you didn't give the plan enough guidance about your constraints.
**Solution:** Do not change `plan.md` directly. Re-run `/speckit.plan` with more specific instructions: "Use the existing Knex.js for database queries, not Prisma. Do not use middleware for token validation — implement it directly in the route handler." More specific constraints produce better plans.

---

## 9. Common Beginner Mistakes

### Mistake 1: Skipping /speckit.clarify

**Why beginners skip it:** It feels like overhead. You already know what you want.
**Why it wastes hours:** "Users can filter expenses" — filter by what? Date range? Category? Amount range? The agent picks one interpretation. If it picks wrong, you waste a full implementation cycle. `/speckit.clarify` takes 5 minutes and eliminates hours of rework.
**Rule:** Never run `/speckit.plan` without running `/speckit.clarify` first.

### Mistake 2: Running /speckit.implement when using Superpowers

**Why beginners do this:** They see `/speckit.implement` in the docs and think it is the next step.
**Why they conflict:** `/speckit.implement` is Spec-Kit's own implementation runner. If Superpowers is installed, using `/speckit.implement` bypasses the TDD loop, code review gating, and git worktree isolation that Superpowers provides. You get none of the safety nets.
**Rule:** When Superpowers is installed, skip `/speckit.implement`. Use the handoff message instead.

### Mistake 3: Telling the AI "make it work" without acceptance criteria

**Why beginners do this:** They have a vague idea and want the agent to figure out the details.
**Why it fails:** "Make it work" is not a success criterion. The agent will implement something — but you have no way to know if it is correct without explicit acceptance criteria. You end up reviewing code without knowing what you are reviewing it against.
**Rule:** Before any implementation starts, you must be able to answer: "How will I know this feature is correct?" Write that answer as acceptance criteria in `spec.md`.

### Mistake 4: Not reading the handoff message carefully

**Why beginners skim it:** The handoff message looks like boilerplate.
**Why it matters:** The handoff message contains placeholders (`<feature-name>`, `<branch-name>`) that must be replaced with actual values. If you paste it with placeholders, Superpowers looks for a branch named `<branch-name>` (literally) and fails.
**Rule:** Read the handoff message before pasting it. Replace every placeholder. Verify the branch name matches what Spec-Kit actually created.

### Mistake 5: Adding new requirements mid-implementation without using Iterate extension

**Why beginners do this:** They think of something new while the agent is coding and just tell it to add it.
**Why it fails:** The new requirement was not in `spec.md`, `plan.md`, or `tasks.md`. The agent adds it informally. It is untested, unreviewed, and not tracked. Later, the requirement is not in the spec, so the code review does not check it. It ships broken.
**Rule:** If requirements change during implementation, use the Iterate extension (`/iterate`). It propagates the change through `spec.md` → `plan.md` → `tasks.md` in a controlled way.

---

## 10. FAQ

**Q: Do I need to know Python to use Spec-Kit?**

No. Spec-Kit is a CLI tool installed via `uv`. You run it with slash commands in your agent. You never write Python code to use it. The `uv` package manager is used for installation only.

**Q: What if my company uses Jira, not GitHub Issues?**

The GitHub Issues Integration extension is just one optional extension. Spec-Kit itself works independently of any issue tracker. You can run the full workflow (`/speckit.specify` → `/speckit.tasks`) without any issue tracker integration. If you want Jira integration specifically, look for the Jira extension in the community catalog.

**Q: How is this different from just asking ChatGPT to write code?**

ChatGPT (or Claude in a basic chat) gives you one-shot responses. You describe a feature, it generates code, and then you figure out what to do with it. There is no structure, no plan, no tests, no review gate.

This workflow adds structure at every step: a spec that defines "done," a plan that anticipates technical problems, a task list that breaks work into reviewable chunks, TDD that proves each piece works before the next is built, and a code review gate that blocks bad code from shipping. The AI writes the code — but within a framework that you control.

**Q: What happens if the AI writes bad code?**

Multiple gates catch it. The TDD loop catches behavior errors (tests must pass). The two-stage review catches spec compliance issues (does it match acceptance criteria?) and code quality issues (is it clean and minimal?). The Verify Tasks Extension catches phantom completions (tasks marked done without working implementations). The Security Review extension catches security problems. If you run all these gates, bad code has many chances to be caught before it ships.

**Q: Can I use this with any programming language?**

Yes. Spec-Kit is language-agnostic — it produces documents, not code. The workflow works with any language that your AI agent supports (which is effectively all mainstream languages). The only configuration needed is telling the agent your tech stack in `constitution.md`.

**Q: How long does a typical feature take end-to-end?**

Rough estimates by feature size:
- Small feature (2-4 tasks, e.g., "add a filter to an existing list view"): 1-2 hours total
- Medium feature (5-10 tasks, e.g., "add user authentication"): 2-5 hours total
- Large feature (10+ tasks, e.g., "add a billing system"): 1-2 days; consider splitting into smaller specs

These are typically 2-3x faster than writing the same feature manually, once you are comfortable with the workflow.

**Q: What if the spec changes midway through implementation?**

Use the Iterate extension (`/iterate`). It provides a controlled two-phase process: define the change, then apply it — propagating updates through `spec.md` → `plan.md` → `tasks.md`. Without Iterate, mid-implementation spec changes cause silent inconsistency that only surfaces at review time. For large scope changes, stop, inform the user, and re-run `/speckit.clarify` and `/speckit.plan` from scratch.

**Q: Do I need to review every line of code the AI writes?**

Not every line — but you should review strategically. Always read: any code that touches authentication, payment processing, or user data. Always read: any test that covers a security-related acceptance criterion. Skim for style and approach: any file with more than 100 new lines of code. Trust but verify: look at the test count before and after each task — if a task added no tests, ask why.

---

## 11. Glossary

**AI-native development:** A development approach where an AI coding agent implements most of the code, while the human engineer focuses on specifying requirements, reviewing output, and making architectural decisions. Contrast with using AI only for autocomplete (Copilot-style) or using AI for one-shot code generation (ChatGPT-style).

**Brownfield:** A project where code already exists and is running in production or development. You are adding to or modifying existing code. Requires extra care: verify the baseline is green before starting, and ensure backward compatibility. Contrast with greenfield.

**constitution.md:** The file at `.specify/memory/constitution.md` that captures your project's non-negotiable rules: tech stack, coding standards, protected files, dependency policies, test requirements. The agent reads this before every action. In conflict resolution, it wins over all other instructions.

**Greenfield:** A project where you start from scratch — an empty or nearly empty directory. No existing tests to protect, no existing constraints to discover. The constitution defines the rules you want the project to follow, rather than capturing existing ones.

**Handoff (in this context):** The moment when Spec-Kit's planning work is complete and Superpowers begins implementing. You signal this transition by pasting a specific handoff message into your agent session. Without the handoff message, Superpowers may re-plan from scratch.

**Phantom completion:** A failure mode where a task is marked `[x]` (complete) in `tasks.md` but the actual feature does not work correctly. Tests pass — but the tests are too narrow to catch the real behavior gap. Detected by the Verify Tasks Extension.

**plan.md:** The technical implementation plan generated by `/speckit.plan`. Describes which files to create or modify, which APIs to use, and the overall technical approach. Generated from `spec.md`; feeds into task generation. Do not edit directly — re-run `/speckit.plan` with different instructions if the plan is wrong.

**RED / GREEN / REFACTOR:** The three phases of Test-Driven Development (TDD). RED: write a test that fails because the feature does not exist yet. GREEN: write the minimum code to make the test pass. REFACTOR: clean up the code while keeping the test green. This order is not optional — writing code before the test skips the most important step.

**Scope creep:** Requirements growing beyond the original spec during implementation. Common when `/speckit.clarify` is skipped (ambiguity gets resolved by the agent, which adds things you did not want) or when mid-implementation requirements are added informally. Controlled by the Spec Scope extension and the Iterate extension.

**SDD (Specification-Driven Development):** The overall methodology this cookbook uses. Define the spec before writing code. The spec drives the plan, the plan drives the tasks, and the tasks drive the implementation. The spec is the source of truth — not the code, not the tests, and not the agent's assumptions.

**Spec-Kit:** A CLI tool and set of agent slash commands that guides you through planning a feature before any code is written. Produces `constitution.md`, `spec.md`, `plan.md`, and `tasks.md`. Does not write code.

**spec.md:** The feature specification at `.specify/specs/<feature>/spec.md`. Contains user stories ("As a user, I want to...") and acceptance criteria ("Given X, when Y, then Z"). Written from the user's perspective. The source of truth for what the feature must do. Changing this file requires re-running `/speckit.tasks`.

**Subagent:** A fresh AI agent instance that Superpowers spawns to handle a single task in isolation. Each task gets a focused agent without context from previous tasks bleeding in. You do not manage subagents — Superpowers handles this automatically. You will see messages like "Starting subagent for Task 3."

**Superpowers:** A plugin for AI coding agents (Claude Code, Cursor, Gemini CLI, Codex CLI) that enforces test-driven development, manages git worktrees, runs automated code reviews, and handles branch finishing. Activated by the handoff message; takes over from Spec-Kit at the `tasks.md` boundary.

**tasks.md:** The ordered task list at `.specify/specs/<feature>/tasks.md`, generated by `/speckit.tasks`. Each task is a discrete, testable unit of work. The handoff artifact between Spec-Kit and Superpowers. Do not edit this file directly — if a task is wrong, fix the upstream problem in `spec.md` and re-run `/speckit.tasks`.

**TDD (Test-Driven Development):** A practice where you write a failing test before writing implementation code. Forces you to define what "correct" means before building it. Prevents shipping code that passes manual checks but fails edge cases. The RED → GREEN → REFACTOR cycle.

**Git worktree:** An isolated checkout of a git repository in a separate directory. Superpowers uses worktrees so the feature branch is worked on in isolation, without affecting the main branch or other in-progress features. You can think of it as a dedicated working folder that shares the same git history as your main repo.

**Spec compliance:** The check that implementation matches the acceptance criteria in `spec.md`. The first stage of Superpowers' two-stage code review. A task fails spec compliance if the acceptance criteria is not satisfied, even if the code is clean.

---

## 12. You Know You're Doing It Right When...

Use this checklist to confirm you are following the workflow correctly. All items should be true before you consider a feature complete.

- [ ] You ran `/speckit.clarify` before `/speckit.plan` and it surfaced at least one ambiguity you had not considered
- [ ] The `tasks.md` file has clear acceptance criteria you can read and understand without asking anyone
- [ ] Tests failed BEFORE you wrote implementation code — the RED phase ran correctly on at least one task
- [ ] The agent asked you to confirm (or the handoff message told it) before creating a new branch — no surprise branches appeared
- [ ] You can read `spec.md` after implementation and it accurately describes what got built
- [ ] No file outside the feature scope was modified (check `git diff main...HEAD -- . ':(exclude).specify/'`)
- [ ] The git commit history is clean: each commit message matches a specific task from `tasks.md`
- [ ] No existing tests were deleted or weakened to make new code pass
- [ ] `constitution.md` was updated before any new dependency was added — no surprise entries in `package.json`
- [ ] You manually tested at least the primary acceptance criterion from `spec.md` before marking the feature done

**If any item is unchecked:** stop, identify which step was skipped, and go back to it before proceeding. A skipped step in planning costs 10x more to fix during review than catching it at the right moment.
