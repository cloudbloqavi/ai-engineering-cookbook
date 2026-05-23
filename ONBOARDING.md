# Getting Started: AI-Native Engineering for Everyone

> Estimated reading time: ~20 min. Work through sections in order the first time.

---

## Who This Is For

This guide is for:

- A Java or Python backend developer who has never used an AI coding agent
- A CS intern starting their first week
- A product manager who can code but has never done AI-native development
- Anyone who has used GitHub Copilot for autocomplete but not for full feature development

You do not need prior experience with AI agents. You need to be able to run commands in a terminal and edit text files.

---

## What You Will Learn

By the end of this guide you will be able to:

1. Explain what AI-native development is and how it differs from using AI for autocomplete
2. Understand the two tools in this workflow (Spec-Kit and Superpowers) and what each one does
3. Walk through a complete feature from idea to committed code using this workflow
4. Recognize and avoid the five most common beginner mistakes
5. Know what to do when something goes wrong

---

## The Big Picture — What Is AI-Native Development?

### The old way vs. the new way

In traditional development, you write every line of code yourself. An AI tool might suggest the next line (like Copilot autocomplete), but you are doing the driving.

In AI-native development, an AI agent writes most of the implementation code. Your job shifts from typing code to:

1. Specifying clearly what needs to be built (and why)
2. Reviewing what the agent produces
3. Catching problems early, before the agent wastes time going in the wrong direction

Think of it like being an architect versus a bricklayer. Architects do not lay every brick — but they must specify exactly what to build, in enough detail that bricklayers cannot misinterpret it.

### The analogy that makes this concrete

| Traditional role | AI-native equivalent |
|---|---|
| You write the code | The AI agent writes the code |
| You write the design doc | You run `/speckit.specify` |
| You attend sprint planning | You run `/speckit.plan` |
| You break down stories | You run `/speckit.tasks` |
| You do a code review | Superpowers runs `requesting-code-review` |
| You merge the branch | Superpowers runs `finishing-a-development-branch` |

The skill that becomes more valuable: writing clear, unambiguous requirements. The skill that becomes less central: knowing the exact syntax of every API.

### The full workflow, visualized

```
YOUR IDEA
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  SPEC-KIT  (the "What to build" tool)                           │
│                                                                 │
│  constitution.md       ← your project's rules and constraints   │
│       │                                                         │
│  /speckit.specify      ← describe the feature in plain language │
│       │                                                         │
│  /speckit.clarify      ← Q&A to remove ambiguity               │
│       │                                                         │
│  /speckit.plan         ← technical approach                     │
│       │                                                         │
│  /speckit.tasks ──────► tasks.md   ◄── HANDOFF POINT           │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │   (you paste a handoff message)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  SUPERPOWERS  (the "How to build it" tool)                      │
│                                                                 │
│  using-git-worktrees   ← isolated workspace, clean baseline     │
│       │                                                         │
│  Per task:                                                      │
│    RED   → write a failing test                                 │
│    GREEN → write minimum code to make it pass                   │
│    REFACTOR → clean up, tests still green                       │
│       │                                                         │
│  requesting-code-review ← quality gate                         │
│       │                                                         │
│  finishing-a-development-branch ← merge decision               │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
WORKING FEATURE IN YOUR CODEBASE
```

```mermaid
flowchart TD
    A[Your idea] --> B[Spec-Kit phase]
    B --> C[constitution.md — project rules]
    C --> D[/speckit.specify — describe the feature]
    D --> E[/speckit.clarify — remove ambiguity]
    E --> F[/speckit.plan — technical approach]
    F --> G[/speckit.tasks — break into tasks]
    G --> H{tasks.md — HANDOFF}
    H --> I[Superpowers phase]
    I --> J[using-git-worktrees — isolated workspace]
    J --> K[RED — failing test]
    K --> L[GREEN — minimum code]
    L --> M[REFACTOR — clean up]
    M --> N{More tasks?}
    N -- yes --> K
    N -- no --> O[requesting-code-review]
    O --> P[finishing-a-development-branch]
    P --> Q[Working feature committed]
```

### The one rule that matters most

Spec-Kit owns everything before the handoff. Superpowers owns everything after. Never skip the handoff message (you will see exactly what to paste in the scenarios below).

---

## The Two Tools You Need

### Tool 1: Spec-Kit — your project manager and architect

Spec-Kit is a set of slash commands (like `/speckit.specify`) that you type into your AI coding agent. Each command runs a structured conversation to produce a document.

Think of Spec-Kit as the tool that answers: "What exactly are we building, and why?"

Spec-Kit produces these documents, in this order:

```
constitution.md   ← your project's rules (tech stack, coding standards, protected files)
     │
spec.md           ← what the feature does, written as user stories with acceptance criteria
     │
plan.md           ← the technical approach (which files to touch, which APIs to use)
     │
tasks.md          ← the numbered task list the agent will execute
```

Each document flows into the next. You cannot skip steps — the output of each step is required input for the next.

### Tool 2: Superpowers — your senior developer pair

Superpowers is a plugin for your AI coding agent (Claude Code, Cursor, Gemini CLI, or similar). Once installed, it adds skills that activate automatically when certain conditions are met.

Think of Superpowers as the tool that answers: "How do we build it correctly?"

The skills you will see in action:

```
using-git-worktrees        ← creates an isolated branch and workspace
subagent-driven-development ← sends each task to a focused sub-agent
test-driven-development    ← enforces the RED → GREEN → REFACTOR cycle
requesting-code-review     ← runs quality checks, blocks on problems
finishing-a-development-branch ← handles merge or PR creation
```

You do not invoke these skills manually. They activate based on the context.

### How the two tools fit together

```
Spec-Kit            Superpowers
    │                   │
    │ produces          │ executes
    │                   │
    ▼                   ▼
 tasks.md  ─────────► TDD loop
              │
          handoff message
          (the bridge between them)
```

The handoff message is a short block of text you paste into your agent session to tell Superpowers: "Spec-Kit is done. Here is the plan. Start executing it."

Without the handoff message, Superpowers may try to re-plan from scratch, duplicating work that Spec-Kit already completed.

---

## Your First 30 Minutes — Setup

### Step 1: Install Spec-Kit

Spec-Kit requires `uv`, a Python package manager.

```bash
# Install uv (if you do not have it)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Spec-Kit
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
# Expected output: Installed 1 package in ~5 seconds
```

### Step 2: Install Superpowers into your AI agent

For Claude Code (used in this guide):
```
/plugin install superpowers@claude-plugins-official
# Expected: "Superpowers plugin installed successfully"
```

For Cursor:
```
/add-plugin superpowers
```

For Gemini CLI:
```bash
gemini extensions install https://github.com/obra/superpowers
```

### Step 3: Initialize Spec-Kit in your project

```bash
# For a new project (greenfield)
specify init my-project --integration claude
cd my-project
# Expected: Creates my-project/ with .specify/ directory inside

# For an existing project (brownfield)
cd your-existing-project
specify init . --force --integration claude
# Expected: Creates .specify/ inside your project. Does NOT touch existing files.
```

### Step 4: Verify the setup

```bash
ls .specify/
# Expected output:
# memory/   specs/   templates/   scripts/
```

If you see that directory structure, setup is complete.

---

## Scenario A: Adding to an Existing App (Brownfield)

> Scenario: You are adding user login (email + password) to an existing Express.js app. The app already has users in a database, but no authentication.

Brownfield means: there is already code running. You are adding to it, not starting from scratch.

The extra rule in brownfield: **confirm all existing tests pass before writing a single line of new code.** This prevents you from inheriting a broken baseline.

### Step A-1: Run existing tests first

```bash
npm test
# Expected: All tests pass. Zero failures.
# If tests fail: STOP. Do not proceed until the baseline is green.
#   Report the failures to your team. Do not mask them with new tests.
```

### Step A-2: Initialize Spec-Kit (if not already done)

```bash
specify init . --force --integration claude
```

### Step A-3: Write the constitution

Open your agent and type:

```
/speckit.constitution Capture our existing project constraints:
  - Current tech stack: Node.js 20, Express.js 4.x, PostgreSQL, Knex.js for queries
  - Do not modify: src/database/migrations/ (protected — DBA approval required)
  - Existing test framework: Jest with supertest for integration tests
  - Required coverage threshold: 80%
  - Dependency policy: new npm packages require a PR comment from the team lead
  - Branch naming convention: NNN-kebab-slug (e.g. 001-user-auth)
```

Expected output: Spec-Kit writes `.specify/memory/constitution.md`. Open it and verify it captured your stack correctly.

If something is missing or wrong: edit `constitution.md` directly. This document is the source of truth for all constraints.

### Step A-4: Write the spec

```
/speckit.specify Add user login to the Express app.
Users should be able to log in with their email and password.
After login, they receive a session token they use for subsequent requests.
Failed logins should not reveal whether the email exists.
```

Expected output: Spec-Kit creates `.specify/specs/001-user-auth/spec.md`. It contains user stories and acceptance criteria — things like "Given a valid email and password, when the user POSTs to /auth/login, then they receive a 200 with a session token."

Read this file. If any acceptance criteria are wrong or missing, fix them now. This is the cheapest moment to correct mistakes.

### Step A-5: Clarify gaps

```
/speckit.clarify
```

Spec-Kit will ask you questions. Common questions for this scenario:
- "Should tokens expire? If so, after how long?"
- "Is this JWT or server-side sessions?"
- "What should happen if the user is already logged in?"

Answer each question. When Spec-Kit is done, it appends the answers to `spec.md`.

If you are unsure of an answer: make a decision and state it. "JWT tokens, expire after 24 hours" is better than leaving it open. Unanswered questions become implementation bugs.

### Step A-6: Generate the technical plan

```
/speckit.plan Use the existing tech stack from constitution.md.
No new dependencies. Changes must be backward compatible.
JWT tokens, 24-hour expiry. Store tokens in httpOnly cookies.
```

Expected output: Spec-Kit creates `plan.md` describing which files to create or modify, and `research.md` with implementation notes.

### Step A-7: Generate the task list

```
/speckit.tasks
```

Expected output: Spec-Kit creates `tasks.md`. Open it. It looks like:

```
[ ] Task 1: Add bcrypt password comparison to User model
[ ] Task 2: Create POST /auth/login endpoint
[ ] Task 3: Add JWT token generation utility
[ ] Task 4: Write integration tests for login success
[ ] Task 5: Write integration tests for login failure cases
```

Read all tasks. If a task is unclear or missing something obvious, stop here and ask your team before proceeding. Changing tasks after implementation starts is expensive.

### Step A-8: Hand off to Superpowers

Paste this message into your agent (replace the placeholders):

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

From this point, Superpowers takes over. You will see it:

1. Create a git worktree (an isolated copy of the repo on the feature branch)
2. Run your existing tests to confirm the baseline is green
3. For each task: write a failing test (RED), write minimum code (GREEN), clean up (REFACTOR)
4. After each task: run a two-stage review (spec compliance, then code quality)
5. After all tasks: request a code review

### What you do while Superpowers is running

Review each task's output when it completes. Specifically check:

- Does the test actually test what the acceptance criteria says?
- Is the implementation doing more than the task requires?
- Does the new code touch any protected paths?

If you see a problem: type a correction message. "That test does not cover the case where the password is empty. Fix the test." Do not let problems accumulate.

### What to do if something goes wrong

**"Superpowers is generating a new plan instead of using tasks.md"**
Cause: You did not paste the handoff message.
Fix: Paste the handoff message. Start with: "Do not generate a new plan. Use .specify/specs/001-user-auth/tasks.md."

**"A test is failing that was passing before"**
Cause: A task's implementation broke existing behavior.
Fix: Tell the agent: "A pre-existing test is now failing. Find the root cause before proceeding. Do not mask the failure."

**"The agent is asking about a dependency not in constitution.md"**
Cause: A task requires something not anticipated.
Fix: Decide: approve the dependency (update constitution.md first) or find an alternative that uses existing packages.

**"Tasks are being marked done but the feature does not work"**
Cause: Task completion is based on tests passing, but the tests may be too narrow.
Fix: Run the app manually. If it does not work as expected, find the gap between the test and the real behavior. Add acceptance tests that catch it.

---

## Scenario B: Building Something New (Greenfield)

> Scenario: You are building a brand new expense tracker app from scratch. No existing code. No database schema. Nothing yet.

Greenfield means: you start with an empty directory (or nearly empty). There are no existing tests to protect, but there are also no existing constraints to learn.

### Step B-1: Create a new project directory

```bash
specify init expense-tracker --integration claude
cd expense-tracker
# Expected: Creates expense-tracker/ with .specify/ inside
```

### Step B-2: Write the constitution

```
/speckit.constitution Create principles for a new expense tracker:
  - Tech stack: Node.js 20, Express.js, PostgreSQL, Knex.js
  - Test framework: Jest
  - Coverage requirement: 80% minimum
  - No external API calls without approval
  - All currency values stored as integers (cents), never floats
```

The last rule ("currency as integers") is an example of a domain-specific constraint you encode upfront so the agent never has to guess.

### Step B-3: Write the spec

Focus on WHAT the feature does and WHY, not HOW.

```
/speckit.specify Build an expense tracker.
Users can add expenses with a date, amount, category, and optional note.
Users can view all expenses sorted by date (newest first).
Users can filter expenses by category.
The app shows a running total for any filtered view.
```

Expected output: `spec.md` with user stories. Example acceptance criterion: "Given I filter by category 'Food', when I view expenses, then I see only expenses tagged 'Food' and the total reflects only those expenses."

### Step B-4: Clarify gaps

```
/speckit.clarify
```

Spec-Kit will ask:
- "What categories exist? Fixed list or user-defined?"
- "Should the total show for all time or a date range?"
- "Is there authentication (multiple users) or is this single-user?"

Answer each one. For a first version, simpler is better: "Fixed categories: Food, Transport, Housing, Other. Total for all time. Single user, no auth."

### Step B-5: Generate the plan

```
/speckit.plan
  Stack: Node.js 20, Express.js 4, PostgreSQL via Knex.
  Three endpoints: POST /expenses, GET /expenses (with optional ?category filter),
  GET /expenses/total (with optional ?category filter).
  REST API only, no frontend.
```

### Step B-6: Generate tasks

```
/speckit.tasks
```

Expected output: tasks.md with roughly 8-12 tasks. First few typically look like:

```
[ ] Task 1: Create database migration for expenses table
[ ] Task 2: Create Expense model with create and findAll methods
[ ] Task 3: Write unit tests for Expense model
[ ] Task 4: Create POST /expenses endpoint
[ ] Task 5: Write integration tests for POST /expenses
...
```

### Step B-7: Paste the handoff message

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

### Step B-8: Watch and review

Superpowers works through each task. Your job during implementation:

1. After each task: read the test and the implementation. Does it match the spec?
2. After all tasks: run the app locally. Try the endpoints. Does it work as you intended?
3. Before the final review: check the constitution. Did the agent stay within the constraints?

### Running the result

After all tasks complete and the final review passes:

```bash
# Run the app
node src/index.js
# Expected: Server running on port 3000

# Add an expense
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount": 1250, "category": "Food", "note": "Lunch", "date": "2026-05-23"}'
# Expected: {"id": 1, "amount": 1250, "category": "Food", "note": "Lunch", "date": "2026-05-23"}

# Get all expenses
curl http://localhost:3000/expenses
# Expected: Array of expense objects, newest first
```

If the app does not work as expected after all tasks are complete, do not mark it done. Identify the failing behavior, add a test that captures it, and fix it.

---

## When Things Go Wrong

### The agent is not following the plan

Symptom: The agent is making changes not listed in tasks.md.
Cause: The handoff message was not clear enough, or the agent is in "brainstorming mode."
Fix: Stop the agent. Paste: "Stop. Do not deviate from tasks.md. The current task is Task N. Do only what Task N describes."

### The agent added a dependency not in constitution.md

Symptom: `package.json` now includes a library you did not approve.
Fix: Ask the agent to remove it and find an alternative within existing packages. If no alternative exists, make a conscious decision: is this dependency worth adding? If yes, update `constitution.md` first, then let the agent proceed.

### The spec was wrong and you only noticed during implementation

Symptom: A task does not make sense because the spec has a gap or error.
Fix: Stop. Do not let the agent patch around a bad spec. Go back to `spec.md` and fix the acceptance criteria. Then re-run `/speckit.tasks` to regenerate the task list. Yes, this resets some work — it is faster than building on a wrong foundation.

### constitution.md and spec.md conflict

Example: constitution.md says "no new dependencies" but spec.md requires a third-party library.
Fix: Never resolve this silently. Stop, name the conflict, ask a human for a decision. The priority order is: constitution.md wins over spec.md wins over tasks.md.

### The git worktree is in a broken state

Symptom: Superpowers reports errors about the git state.
Fix:
```bash
# List worktrees
git worktree list
# Expected: Shows main worktree and the feature worktree

# Remove a broken worktree (use the path shown in the list)
git worktree remove path/to/broken/worktree --force

# Let Superpowers recreate it
# Paste the handoff message again to restart from the last good task
```

---

## Common Mistakes

### Mistake 1: Skipping /speckit.clarify

Why beginners skip it: It feels like overhead. You already know what you want.
Why it matters: Spec-Kit's clarification catches ambiguity that the agent will later resolve incorrectly. "Users can filter expenses" — filter by what? Date range? Category? Amount? The agent picks one. If it picks wrong, you waste a full implementation cycle.
Fix: Always run `/speckit.clarify` before `/speckit.plan`. It takes 5 minutes and saves an hour.

### Mistake 2: Not pasting the handoff message

Why beginners skip it: They start describing the task and the agent just starts working.
What goes wrong: Superpowers fires its own planning skills and generates a duplicate plan. You end up with two contradicting task lists.
Fix: Before describing any implementation task, paste the full handoff message. It is the signal that tells Superpowers "planning is done, execute this."

### Mistake 3: Letting the agent fix a failing pre-existing test by deleting or weakening it

Why it happens: A task breaks an existing test. The agent "fixes" it by making the test less strict.
What goes wrong: You are now hiding a regression. The broken behavior ships to production.
Fix: When an existing test fails, the first question is always: "Is the test wrong, or is the implementation wrong?" Do not delete or weaken tests to make them pass.

### Mistake 4: Changing tasks.md directly

Why beginners do it: A task seems wrong, so they edit it.
What goes wrong: tasks.md is generated from spec.md and plan.md. If you change tasks.md directly and the spec is still wrong, the next time you run `/speckit.tasks` your change gets overwritten. Worse, the agent may have already executed some tasks against the old spec.
Fix: If a task is wrong, the fix lives upstream. Correct spec.md, then re-run `/speckit.tasks`. Do not patch tasks.md directly.

### Mistake 5: Approving a task without reading the code

Why it happens: The tests pass, the review says "OK," and you move on.
What goes wrong: The agent may have written code that passes tests but handles edge cases incorrectly, introduces security issues, or builds more than required.
Fix: For every task, read the implementation and the test. Especially read: any code that touches authentication, money, or user data. A 2-minute read catches issues that take hours to diagnose in production.

---

## FAQ

**Q: Do I need to know the specific AI agent commands? What if I use Cursor instead of Claude Code?**

A: The Spec-Kit slash commands (`/speckit.specify`, etc.) work the same in any supported agent — Claude Code, Cursor, Gemini CLI, or Codex CLI. The Superpowers plugin is also available for all of these. The only difference is the installation command (see the Installation section). Once installed, the workflow is identical.

**Q: What if my project has no tests at all? Can I still use this workflow?**

A: Yes, but be careful in brownfield scenarios. If there are no existing tests, you cannot verify that the baseline is green before you start — because there is no baseline. The recommendation: write a smoke test for the existing behavior before starting your first Spec-Kit feature. Even a single "the server starts and responds to GET /" test gives you something to protect.

**Q: What is the difference between spec.md and tasks.md? They both describe the feature.**

A: spec.md describes WHAT the feature must do and WHY, from a user's perspective. It contains acceptance criteria. tasks.md describes HOW the agent will build it, as an ordered list of implementation steps. Spec.md is written for humans. Tasks.md is written for the agent. Always correct spec.md if something is wrong — never correct tasks.md directly.

**Q: How long does the full workflow take for a small feature?**

A: For a straightforward feature (2-5 tasks), plan for:
- Spec-Kit phase: 20-45 minutes (mostly clarification Q&A)
- Implementation: 30-90 minutes depending on complexity
- Review and cleanup: 15-30 minutes
Total: 1-3 hours for a feature that might take a full day without the workflow.

**Q: Can I run this workflow without Superpowers and just use Spec-Kit?**

A: Yes. Spec-Kit has a `/speckit.implement` command that executes tasks.md directly, without Superpowers. The difference: Superpowers adds TDD enforcement, git worktrees, subagent isolation, and structured code review. If you skip Superpowers, you are responsible for enforcing those practices yourself.

**Q: What if I disagree with the plan that Spec-Kit generated?**

A: Do not change plan.md directly. Instead, go back to the step where your disagreement originates. If the plan is wrong because the spec is wrong, fix spec.md and re-run `/speckit.plan`. If the plan is technically wrong (wrong approach, wrong files), re-run `/speckit.plan` with more specific instructions: "Do not use middleware for this — implement it directly in the route handler."

**Q: The agent is taking a long time on a task. Is something wrong?**

A: Long-running tasks usually mean one of: (1) the task is too big and should have been split, (2) the agent is stuck in a loop trying to fix a test, or (3) the implementation is more complex than expected. Check the agent output. If you see the same error repeating, interrupt and say: "Stop. Describe the error you are hitting and what you have tried." Diagnose before letting it continue.

**Q: Can two engineers work on the same feature at the same time?**

A: The workflow is designed for one engineer + one agent per feature branch. If two people need to work in parallel, run two separate Spec-Kit specs for two separate features, on two separate branches. Merge them like normal feature branches. Avoid two engineers editing the same `tasks.md` concurrently — it causes conflicts that are hard to reconcile.

**Q: What is a "subagent" and should I worry about it?**

A: A subagent is a fresh agent instance that Superpowers spawns to handle a single task in isolation. The benefit: each task gets full context without being distracted by what previous tasks did. You do not manage subagents yourself — Superpowers handles this. You will see messages like "Starting subagent for Task 3." This is normal and expected.

**Q: My team already has a code review process. Does this replace it?**

A: No. The `requesting-code-review` skill within Superpowers is an automated quality check that runs before human review. It catches mechanical issues (spec compliance, code quality standards). It does not replace the human review where your teammates understand the business context and long-term architecture implications. Run both.

---

## Glossary

**Brownfield**: A project where code already exists and is running. You are adding to or changing existing code. Contrast with greenfield.

**constitution.md**: A document that captures your project's non-negotiable rules: tech stack, coding standards, protected files, dependency policies. Stored at `.specify/memory/constitution.md`. The agent reads this before every action. It wins over all other instructions when there is a conflict.

**Greenfield**: A project where you start with an empty (or nearly empty) directory. No existing constraints except what you define in `constitution.md`.

**Handoff**: The moment when Spec-Kit's work is complete and Superpowers begins. You signal this by pasting a specific message into your agent session. Without the handoff message, the two tools may conflict.

**Handoff message**: A short text block you paste into your agent that says "Spec-Kit is done, use tasks.md, do not create a new plan." Exact templates are in the Scenarios above.

**plan.md**: The technical implementation plan generated by `/speckit.plan`. Describes which files to create or modify and the technical approach. Feeds into task generation.

**RED / GREEN / REFACTOR**: The three phases of Test-Driven Development (TDD). RED: write a test that fails (because the code does not exist yet). GREEN: write the minimum code to make the test pass. REFACTOR: clean up the code while keeping tests green. This order is not negotiable.

**spec.md**: The feature specification. Contains user stories ("As a user, I want to...") and acceptance criteria ("Given X, when Y, then Z"). Written from the user's perspective. The source of truth for what the feature must do.

**Spec-Kit**: A CLI tool and set of agent slash commands that guides you through writing a specification, plan, and task list before any code is written. Produces `tasks.md` as its primary output.

**Subagent**: A fresh AI agent instance spawned by Superpowers to handle a single task in isolation. This prevents context from earlier tasks bleeding into later ones, which reduces errors. You do not manage subagents directly.

**Superpowers**: A plugin for AI coding agents (Claude Code, Cursor, Gemini CLI, etc.) that enforces the TDD loop, manages git worktrees, runs code reviews, and handles branch finishing. Activated by the handoff message; takes over from Spec-Kit.

**tasks.md**: The ordered task list generated by `/speckit.tasks`. Each task is a discrete, testable unit of work. The handoff artifact — Spec-Kit produces it, Superpowers executes it. Do not edit this file directly.

**TDD (Test-Driven Development)**: A development practice where you write a failing test first, then write code to make it pass. Forces you to define "done" before you start coding. The RED → GREEN → REFACTOR cycle.

**Worktree (git worktree)**: An isolated checkout of a git repository in a separate directory. Superpowers uses worktrees so the feature branch is worked on in isolation, without affecting the main branch or other in-progress features. You can think of it as a separate working folder that shares the same git history.

---

## You Know You Are Doing It Right When...

Use this checklist to confirm you are following the workflow correctly. Every item should be true.

**Spec phase:**
- [ ] `constitution.md` exists and includes your tech stack, protected paths, and dependency policy
- [ ] `spec.md` contains acceptance criteria in "Given / When / Then" format
- [ ] You ran `/speckit.clarify` and answered all questions before planning
- [ ] `tasks.md` exists and each task is small enough to complete in a single TDD cycle (RED → GREEN → REFACTOR)
- [ ] You read every task in `tasks.md` before pasting the handoff message

**Implementation phase:**
- [ ] You pasted the handoff message before the agent started any implementation
- [ ] The first thing Superpowers did was verify existing tests pass (brownfield) or set up the worktree (greenfield)
- [ ] Each task has a failing test written before any implementation code
- [ ] No task was marked done until the test was green and a two-stage review passed
- [ ] No new dependency was added without a decision being made and `constitution.md` updated

**Review phase:**
- [ ] You ran the app (or the full test suite) manually at least once after all tasks completed
- [ ] No existing tests were weakened or deleted to make the new code pass
- [ ] The final code does not touch any protected paths from `constitution.md` (or you have explicit approval)
- [ ] The commit history shows one commit per task, with messages in the `feat|fix|refactor(scope): description` format

**If any item is not checked:** Stop, identify which step was skipped, and go back to it. Do not proceed to the next phase with a skipped step.
