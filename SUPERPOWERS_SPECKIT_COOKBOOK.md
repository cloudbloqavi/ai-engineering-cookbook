# Superpowers + Spec-Kit: Project Cookbook

> A practical reference for teams using both [obra/superpowers](https://github.com/obra/superpowers) and [github/spec-kit](https://github.com/github/spec-kit) together on the same codebase.

---

## Table of Contents

1. [How the two tools fit together](#1-how-the-two-tools-fit-together)
2. [Installation](#2-installation)
3. [Greenfield workflow](#3-greenfield-workflow)
4. [Brownfield workflow](#4-brownfield-workflow)
5. [Conflict prevention rules](#5-conflict-prevention-rules)
6. [Directory structure reference](#6-directory-structure-reference)
7. [Slash command quick reference](#7-slash-command-quick-reference)
8. [Skill quick reference](#8-skill-quick-reference)
9. [Handoff message templates](#9-handoff-message-templates)
10. [Team conventions](#10-team-conventions)
11. [AI observability layer](#11-ai-observability-layer)

---

## 1. How the two tools fit together

| Layer | Tool | Owns |
|---|---|---|
| **What to build** | Spec-Kit | User stories, acceptance criteria, constitution, research docs, API contracts, `tasks.md` |
| **How to build it** | Superpowers | TDD enforcement, subagent orchestration, code review gating, git worktrees, branch finishing |
| **Overlap zone** | Both | Brainstorming/spec refinement, plan generation, branch creation — **pick one owner per project** |

The handoff point is `tasks.md`. Spec-Kit produces it; Superpowers executes against it.

```
Spec-Kit:  constitution → specify → clarify → plan → tasks.md
                                                          │
                                        ┌─────────────────┘
                                        ▼
Superpowers:             worktree → subagent-driven-dev → TDD → review → merge
```

---

## 2. Installation

### Install Spec-Kit (once per machine)

```bash
# Requires uv — https://docs.astral.sh/uv/
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z
```

### Install Superpowers into your coding agent

**Claude Code** (recommended):
```
/plugin install superpowers@claude-plugins-official
```

**Cursor:**
```
/add-plugin superpowers
```

**Gemini CLI:**
```bash
gemini extensions install https://github.com/obra/superpowers
```

**Codex CLI:** Use `/plugins`, search "superpowers", select Install.

### Init Spec-Kit in your project

```bash
# Greenfield — new directory
specify init my-project --integration copilot
cd my-project

# Brownfield — existing repo (safe, only adds .specify/)
specify init . --force --integration copilot
```

> Replace `copilot` with `claude`, `gemini`, `codex`, `cursor`, etc. to match your agent.

---

## 3. Greenfield workflow

### Phase 1 — Spec (Spec-Kit owns)

**Step 1: Set principles**
```
/speckit.constitution Create principles focused on:
  - Code quality and test coverage requirements
  - Tech stack constraints (list your stack)
  - Performance and security requirements
  - Governance rules for adding new dependencies
```

**Step 2: Write the spec**
```
/speckit.specify <describe what you want to build>

Focus on WHAT and WHY. Do not mention the tech stack yet.
```

**Step 3: Clarify gaps (before planning)**
```
/speckit.clarify
```
Run this before `/speckit.plan`. It flushes ambiguities through structured Q&A. Skipping it causes rework.

**Step 4: Consistency check (optional, recommended)**
```
/speckit.analyze
```
Cross-checks spec for missing requirements or contradictions.

**Step 5: Generate the technical plan**
```
/speckit.plan <describe your tech stack and architecture choices>

Example: "Use Next.js 14 with TypeScript, Postgres via Prisma,
deployed to Vercel. No new npm packages without team approval."
```

**Step 6: Generate tasks**
```
/speckit.tasks
```
Produces `.specify/specs/<feature>/tasks.md` — this is the handoff artifact.

---

### Handoff (critical step)

Tell your agent explicitly before starting implementation:

```
Use the task list in .specify/specs/<feature>/tasks.md as the
implementation plan. Do not generate a new plan or create a new
git branch — Spec-Kit has already done both.
```

> If you skip this message, Superpowers' brainstorming and writing-plans
> skills may re-fire and produce a duplicate plan.

---

### Phase 2 — Implement (Superpowers owns)

Superpowers takes over automatically from this point. The skills that activate:

| Skill | When it fires | What it does |
|---|---|---|
| `using-git-worktrees` | After handoff | Creates isolated workspace, verifies clean test baseline |
| `subagent-driven-development` | Per task | Fresh subagent per task, two-stage review (spec then code quality) |
| `test-driven-development` | During implementation | Enforces RED → GREEN → REFACTOR cycle |
| `requesting-code-review` | Between tasks | Gates progress on critical issues |
| `finishing-a-development-branch` | When all tasks done | Merge / PR / keep / discard decision |

---

## 4. Brownfield workflow

### One-time setup (per repo)

```bash
# 1. Init Spec-Kit on existing codebase
specify init . --force --integration <your-agent>

# 2. Open your agent and capture existing constraints
```

```
/speckit.constitution Capture our existing project constraints:
  - Current tech stack: <list everything>
  - Do not modify: <list protected modules/files>
  - Existing test framework: <name and runner command>
  - Required coverage threshold: <percentage>
  - Dependency policy: <approval process>
  - Branch naming convention: <pattern>
```

### Per feature / bug fix

**Step 1: Specify the change**
```
/speckit.specify <describe only what changes>

Note: Frame as a delta from existing behaviour.
Spec-Kit will create a branch automatically (e.g. 001-feature-name).
```

**Step 2: Clarify — especially important in brownfield**
```
/speckit.clarify
```
Ask about interaction with existing modules, migration needs, backward compatibility.

**Step 3: Plan with constraints**
```
/speckit.plan Use the existing tech stack as defined in constitution.md.
No new dependencies. Changes must be backward compatible with <version>.
```

**Step 4: Generate tasks**
```
/speckit.tasks
```

**Handoff message for brownfield:**
```
Use the task list in .specify/specs/<feature>/tasks.md.
Do not generate a new plan.
Do not create a new branch — the branch already exists from Spec-Kit.
Verify that all existing tests pass before touching any files.
```

### Phase 2 — Implement (Superpowers owns)

The key brownfield-specific skills:

| Skill | Why it matters in brownfield |
|---|---|
| `using-git-worktrees` | Verifies clean baseline — catches pre-existing failures before you start |
| `systematic-debugging` | 4-phase root cause process for legacy issues you encounter mid-task |
| `verification-before-completion` | Ensures the fix is real, not just the error suppressed |
| `requesting-code-review` | Blocks progress if changes regress existing behaviour |
| `finishing-a-development-branch` | Runs full test suite before merge decision |

---

## 5. Conflict prevention rules

### Rule 1 — Spec-Kit owns the spec, plan, and tasks

Never ask Superpowers to write a plan if `tasks.md` already exists. Add this to `CLAUDE.md`:

```
This project uses Spec-Kit for specification and planning.
Always read .specify/specs/ before any implementation.
Never generate a new plan if tasks.md already exists for this feature.
```

### Rule 2 — Pick one tool to own git branching

**Option A — Spec-Kit owns branching** (default, recommended):
- Spec-Kit's `create-new-feature.sh` creates the branch when you run `/speckit.specify`
- Tell Superpowers not to create a new branch in the handoff message
- Superpowers still creates a git worktree for isolation

**Option B — Superpowers owns branching**:
- Disable Spec-Kit's branch creation: delete or comment out `create-new-feature.sh`
- Let Superpowers' `using-git-worktrees` handle everything
- Manually provide the feature name to Superpowers

### Rule 3 — One brainstorming owner per session

Superpowers' `brainstorming` skill and `/speckit.specify` both do spec refinement. They conflict if both are active at the start of a session.

Resolution: Always start a new feature by running `/speckit.specify` first. Once `spec.md` exists, Superpowers will skip its own brainstorming phase when you provide the handoff message.

### Rule 4 — Add a persistent note to CLAUDE.md

See the [CLAUDE.md template](#claudemd-template) section below. This note survives agent session restarts.

---

## 6. Directory structure reference

After full setup, your project will contain:

```
your-project/
├── .ai/                               # AI-Native governance layer (observability)
│   ├── config/
│   │   ├── AGENT_PROFILE_ROLES.md     # Multi-agent pod roles and handoff protocols
│   │   └── VERIFICATION_AND_EVAL_GUIDE.md  # Automated + human gate definitions
│   └── traces/
│       └── AGENT_LOG_REFLECTIONS.md   # Append-only execution journal (never delete)
│
├── postmortems/
│   └── POSTMORTEM_AND_LEARNING_LOG.md # Blameless incident → root cause → system fix log
│
├── .specify/                          # Spec-Kit
│   ├── memory/
│   │   └── constitution.md            # Project principles & constraints
│   ├── specs/
│   │   └── 001-feature-name/
│   │       ├── spec.md                # User stories, acceptance criteria
│   │       ├── plan.md                # Technical implementation plan
│   │       ├── tasks.md               # ← HANDOFF ARTIFACT
│   │       ├── research.md            # Tech stack research
│   │       └── contracts/
│   │           └── api-spec.json      # API contracts
│   ├── templates/                     # Overrideable templates
│   └── scripts/bash/                  # Spec-Kit automation scripts
│
├── .claude-plugin/                    # Superpowers (Claude Code)
│   └── skills/                        # Auto-triggered skill definitions
│                                      # Also: domain prompt-skills (e.g. auth-standards.md)
│
├── CLAUDE.md                          # Agent instructions (all layers)
├── AGENTS.md                          # Agent instructions (OpenAI-compatible agents)
└── <your source code>
```

---

## 7. Slash command quick reference

### Spec-Kit commands (run in your coding agent)

| Command | When to run | Output |
|---|---|---|
| `/speckit.constitution` | Once per project, update when constraints change | `constitution.md` |
| `/speckit.specify` | Start of every new feature | `spec.md`, new git branch |
| `/speckit.clarify` | After specify, before plan | Appended clarifications section in `spec.md` |
| `/speckit.analyze` | After clarify, before plan (optional) | Consistency report |
| `/speckit.plan` | After clarify | `plan.md`, `research.md`, `contracts/` |
| `/speckit.tasks` | After plan | `tasks.md` |
| `/speckit.implement` | Only if not using Superpowers for execution | Executes `tasks.md` directly |
| `/speckit.checklist` | Any time | Custom quality checklist |

> When using Superpowers for execution, skip `/speckit.implement` — Superpowers handles it.

### Superpowers skills (auto-triggered, no slash commands needed)

Superpowers skills fire automatically based on context. You do not invoke them manually.

---

## 8. Skill quick reference

### Superpowers skills active in this setup

| Skill | Activates when | What it does |
|---|---|---|
| `brainstorming` | Agent sees you building something | Spec refinement — **bypass with handoff message** |
| `using-git-worktrees` | After design approval | Creates isolated branch, verifies baseline |
| `writing-plans` | With approved design | Generates granular plan — **bypass if tasks.md exists** |
| `subagent-driven-development` | With plan ready | Dispatches fresh subagent per task |
| `test-driven-development` | During implementation | RED → GREEN → REFACTOR enforcement |
| `requesting-code-review` | Between tasks | Blocks on critical issues |
| `systematic-debugging` | When a bug appears | 4-phase root cause process |
| `verification-before-completion` | Before marking done | Confirms the fix is real |
| `finishing-a-development-branch` | All tasks complete | Merge / PR / keep / discard |

---

## 9. Handoff message templates

Copy and paste these at the transition point between Spec-Kit and Superpowers.

### Greenfield handoff

```
The spec and task breakdown are ready.

Use the implementation plan in:
  .specify/specs/<feature-name>/tasks.md

Constraints:
  - Do not generate a new plan
  - Do not create a new git branch (already created by Spec-Kit as <branch-name>)
  - Follow the tech stack defined in .specify/memory/constitution.md
  - Write tests before implementation code (TDD)
  - All tasks must pass the two-stage review (spec compliance first, code quality second)
```

### Brownfield handoff

```
The spec and task breakdown are ready for a change to an existing codebase.

Use the implementation plan in:
  .specify/specs/<feature-name>/tasks.md

Constraints:
  - Do not generate a new plan
  - Do not create a new git branch (already created by Spec-Kit as <branch-name>)
  - Verify all existing tests pass BEFORE touching any files
  - Follow the tech stack and protected modules in .specify/memory/constitution.md
  - Do not introduce new dependencies without explicit approval
  - All changes must be backward compatible
```

### Bug fix handoff (Superpowers only, no Spec-Kit needed)

```
Fix the following bug: <description>

Use the systematic-debugging skill:
  1. Reproduce reliably
  2. Find root cause (not just the symptom)
  3. Write a failing test that captures the bug
  4. Fix until the test passes
  5. Verify no existing tests regressed
```

---

## 10. Team conventions

### Commit message format

```
<type>(<scope>): <short description>

Types: feat | fix | refactor | test | docs | chore
Scope: the feature name from Spec-Kit (e.g. 001-user-auth)

Example:
feat(001-user-auth): add JWT refresh token rotation
```

### Branch naming

Spec-Kit auto-creates branches using the pattern `<number>-<feature-slug>`.
Example: `001-user-authentication`, `002-payment-integration`

### What goes in `constitution.md` vs `CLAUDE.md`

| Document | Content |
|---|---|
| `constitution.md` | Business requirements, product constraints, tech stack rules, quality standards |
| `CLAUDE.md` | Agent-specific instructions, workflow routing, tooling setup, session behaviour |

These are complementary. The agent reads both. Do not duplicate content between them.

### When to update `constitution.md`

- Tech stack changes (new major dependency, framework upgrade)
- New team-wide coding standards adopted
- Architecture decisions made (ADRs)
- Protected modules added or removed

---

## 11. AI Observability Layer

The `.ai/` directory and `postmortems/` log are the governance backbone of the AI-Native SDLC.
They integrate directly into the Spec-Kit + Superpowers workflow at specific trigger points.

### How `.ai/` integrates with this workflow

| File | Read by | Written by | When |
|---|---|---|---|
| `.ai/config/AGENT_PROFILE_ROLES.md` | All agents at session start | Team (humans) | Role changes, new agent joins |
| `.ai/config/VERIFICATION_AND_EVAL_GUIDE.md` | Verifier agent, Coder before commit | Team (humans) | Postmortem reveals a gate gap |
| `.ai/traces/AGENT_LOG_REFLECTIONS.md` | Reviewer agent, humans | Coder agent | After every implementation session |
| `postmortems/POSTMORTEM_AND_LEARNING_LOG.md` | Humans, next session's planning | Verifier agent + humans | Any failure reaching staging/prod |

### When agents write to `AGENT_LOG_REFLECTIONS.md`

Write a log entry after **every implementation session** — meaning after each task's
RED → GREEN → REFACTOR → REVIEW cycle, before the commit. Minimum required fields:
timestamp, task slug, outcome, files changed, frictions encountered.

If the session was blocked or produced a partial outcome, the entry is especially important:
it is the primary input for the postmortem and the prompt-skill refinement process.

```
# Trigger: after every task cycle (before commit)
Append to .ai/traces/AGENT_LOG_REFLECTIONS.md:
  - Outcome: COMPLETE | PARTIAL | BLOCKED
  - Files changed
  - Frictions: where did the spec or constitution require inference?
  - Suggested refinements: what exact change to which file would prevent friction?
```

### When to create a postmortem entry

Create an entry in `postmortems/POSTMORTEM_AND_LEARNING_LOG.md` when:

- Any agent-generated bug reaches staging or production
- A spec compliance failure is caught at the review stage (not at the task stage)
- A TDD cycle cannot be completed within a single session (outcome: BLOCKED for > 1 session)
- Any Gate 3 or Gate 4 failure in `VERIFICATION_AND_EVAL_GUIDE.md`

Do not create a postmortem for every friction or minor ambiguity — those belong in
`AGENT_LOG_REFLECTIONS.md`. A postmortem is for failures that escaped the normal gates.

### Continuous improvement: how prompt-skills improve over time

```
Session log reveals recurring friction (e.g. "spec never defines auth token format")
     ↓
Postmortem identifies root cause (e.g. "no auth-standards prompt-skill exists")
     ↓
Team creates or updates .claude-plugin/skills/auth-standards.md
     ↓
Next session: Coder reads auth-standards.md at task start → no ambiguity → no friction
     ↓
Log entry for next session shows: "Frictions encountered: none"
```

Prompt-skills in `.claude-plugin/skills/` are domain-specific guidelines that agents read
during execution. They encode team conventions that are too detailed for `constitution.md`
but too important to leave to agent inference. Common examples: authentication standards,
API naming conventions, error-handling patterns, test fixture conventions. Every postmortem
should produce either a new prompt-skill or an update to an existing one.

---

## Appendix: Troubleshooting

**Problem: Agent generates a new plan even though `tasks.md` exists**
Fix: Add the handoff message. Ensure `CLAUDE.md` contains the "never generate a new plan if `tasks.md` exists" instruction.

**Problem: Two branches created for the same feature**
Fix: Use Option A (Spec-Kit owns branching) consistently. In the handoff message always say "Do not create a new git branch."

**Problem: Superpowers' brainstorming fires after Spec-Kit has already produced `spec.md`**
Fix: Start every implementation session by providing the handoff message before describing any task. The handoff message signals to Superpowers that the spec phase is complete.

**Problem: Agent in a fresh session doesn't know which plan to follow**
Fix: The `CLAUDE.md` routing block (see `CLAUDE.md` template) handles this. Always keep this file in the repo root.

**Problem: Spec-Kit and Superpowers both try to create API contracts**
Fix: Spec-Kit owns contracts (generated during `/speckit.plan` into `contracts/api-spec.json`). Tell Superpowers to reference these contracts rather than generate new ones.
