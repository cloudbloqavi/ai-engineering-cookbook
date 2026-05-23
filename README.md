# AI Engineering Cookbook

> Practical patterns for building software with AI agents — using [Spec-Kit](https://github.com/github/spec-kit) for specification and [Superpowers](https://github.com/obra/superpowers) for execution, augmented with a curated set of community extensions.

---

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [Core Ecosystem](#2-core-ecosystem)
3. [Repository Contents](#3-repository-contents)
4. [Workflow Quick Picker](#4-workflow-quick-picker)
5. [Curated Community Extensions](#5-curated-community-extensions)
   - [How to Read the Extension Tables](#how-to-read-the-extension-tables)
   - [Pre-Spec & Setup Extensions](#pre-spec--setup-extensions)
   - [Spec Phase Extensions](#spec-phase-extensions)
   - [Plan Phase Extensions](#plan-phase-extensions)
   - [Implementation Phase Extensions](#implementation-phase-extensions)
   - [Post-Implementation & Review Extensions](#post-implementation--review-extensions)
   - [Visibility & Monitoring Extensions](#visibility--monitoring-extensions)
   - [Team & CI Integration Extensions](#team--ci-integration-extensions)
6. [Extension Decision Guide](#6-extension-decision-guide)
7. [Extension Placement Map](#7-extension-placement-map)
8. [What We Deliberately Excluded](#8-what-we-deliberately-excluded)
9. [Quick Reference Cheatsheet](#9-quick-reference-cheatsheet)

---

## New to AI Engineering? Start Here

**AI-native development** means using AI coding agents not just for autocomplete, but
to plan, implement, test, and review entire features — with you as the architect
and decision-maker, not the typist.

**→ Complete beginner guide (25 min): [ONBOARDING.md](./ONBOARDING.md)**

### If you come from traditional engineering, here's the translation:

| What you know | What this replaces it with |
|---|---|
| Writing a PRD or user story | `/speckit.specify` — describe the feature in plain English |
| Sprint planning / ticket breakdown | `/speckit.plan` + `/speckit.tasks` — AI generates the plan |
| Pair programming with a senior dev | Superpowers subagent loop — AI implements task by task |
| Writing unit tests | SpecTest extension + TDD loop (RED → GREEN → REFACTOR) |
| Code review | `requesting-code-review` skill — gates progress on issues |
| Architecture review | Red Team + Architect Impact Previewer extensions |

### Zero to first feature in 3 steps:

1. **Read** [ONBOARDING.md](./ONBOARDING.md) — understand the workflow (25 min)
2. **Install** Spec-Kit + Superpowers — see [§2 Installation](./SUPERPOWERS_SPECKIT_COOKBOOK.md#2-installation) (15 min)
3. **Run** your first command on a real task: `/speckit.specify I want to add [your feature] to [your project]`

> **Not sure where to start?** Open [ONBOARDING.md](./ONBOARDING.md) and follow Scenario A (brownfield) or Scenario B (greenfield) — both walk you through a complete feature from zero.

---

## 1. What This Is

This cookbook solves a specific problem: **AI agents are powerful but unstructured.** Without guardrails, they plan twice, branch wrong, skip tests, and drift from the original spec mid-implementation.

This repo gives you a repeatable, opinionated engineering workflow that works across:

- **Greenfield** projects (starting from scratch)
- **Brownfield** projects (adding AI-assisted development to an existing codebase)
- **Bug fix** workflows (no spec overhead, just root-cause → test → fix)

The workflow is built on two tools:

| Layer | Tool | Responsibility |
|---|---|---|
| **What to build** | Spec-Kit | Constitution, spec, clarification, plan, `tasks.md` |
| **How to build it** | Superpowers | TDD enforcement, subagent orchestration, code review gating, git worktrees, branch finishing |
| **Handoff artifact** | `tasks.md` | The bridge between the two tools — Spec-Kit produces it, Superpowers executes it |

The 20 curated extensions in this cookbook plug into specific points in that workflow. They are not required — each solves a discrete problem. Use what fits your project.

---

## 2. Core Ecosystem

```
Spec-Kit:
  /speckit.constitution
       │
  /speckit.specify
       │
  /speckit.clarify
       │
  /speckit.analyze   (optional)
       │
  /speckit.plan
       │
  /speckit.tasks ──────────────────► tasks.md  ◄─── HANDOFF POINT
                                         │
Superpowers:                             │
  using-git-worktrees ◄──────────────────┘
       │
  subagent-driven-development
       │  (per task)
  test-driven-development (RED → GREEN → REFACTOR)
       │
  requesting-code-review
       │
  finishing-a-development-branch
```

**The hard rule:** Spec-Kit owns everything above the handoff. Superpowers owns everything below. Never let them cross. The [`SUPERPOWERS_SPECKIT_COOKBOOK.md`](./SUPERPOWERS_SPECKIT_COOKBOOK.md) documents exactly how to enforce this boundary.

---

## 3. Repository Contents

| File | Purpose |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | Agent-level instructions — gates, execution loop, conflict resolution priority |
| [`SUPERPOWERS_SPECKIT_COOKBOOK.md`](./SUPERPOWERS_SPECKIT_COOKBOOK.md) | Full workflow reference: installation, greenfield, brownfield, handoff templates, troubleshooting |
| [`AGENTS.md`](./AGENTS.md) | Agent routing (OpenAI-compatible agents) |
| `README.md` | This file — orientation, navigation, curated extensions |

**Start here:** Read this README to understand the landscape, then go to `SUPERPOWERS_SPECKIT_COOKBOOK.md` for the full command-by-command workflow.

---

## 4. Workflow Quick Picker

```
What are you starting?
│
├─ New project, blank slate
│    └─ Greenfield workflow → §3 in SUPERPOWERS_SPECKIT_COOKBOOK.md
│
├─ Existing codebase, adding a feature
│    └─ Brownfield workflow → §4 in SUPERPOWERS_SPECKIT_COOKBOOK.md
│         └─ First time on this repo?
│              └─ Run: Brownfield Bootstrap → BrownKit → /speckit.constitution
│
├─ Something is broken, need to fix it
│    └─ Bug fix handoff template → §9 in SUPERPOWERS_SPECKIT_COOKBOOK.md
│
└─ Requirements changed mid-implementation
     └─ Iterate extension → §5.4 below
```

---

## 5. Curated Community Extensions

These 20 extensions are selected from the [Spec-Kit community catalog](https://github.github.io/spec-kit/community/extensions.html) because they:

1. Fill a real gap in the Spec-Kit + Superpowers workflow without duplicating it
2. Work without requiring external platform accounts (unless noted)
3. Have a clear, bounded scope — they do one thing
4. Are complementary, not competitive, with our existing tools

> **Disclaimer:** Community extensions are independently maintained. Review source code before installing any extension in a production pipeline. The catalog maintainers verify formatting only — they do not audit or endorse extension code.

---

### How to Read the Extension Tables

Each table entry uses this format:

| Column | Meaning |
|---|---|
| **Extension** | Name as listed in the community catalog |
| **Fits** | `GF` = Greenfield, `BF` = Brownfield, `Both` = Either |
| **Where in workflow** | The exact step where this extension activates |
| **Skip when** | Situations where adding this extension creates noise or conflict |

---

### Pre-Spec & Setup Extensions

Run these before touching any spec or implementation files. They establish baseline safety.

| Extension | Fits | Where in Workflow | Skip When |
|---|---|---|---|
| **MemoryLint** | Both | After any edit to `AGENTS.md` or `constitution.md` | No memory files exist yet (greenfield day 0) |
| **Brownfield Bootstrap** | BF only | Before `/speckit.constitution` — auto-discovers existing architecture | Codebase is well-documented; you can describe the stack yourself in 10 min |
| **BrownKit** | BF only | After Brownfield Bootstrap, before `/speckit.constitution` — evidence-driven risk assessment | Low-risk internal tooling with no security surface |
| **Project Health Check** | Both | Brownfield kickoff, or when spec-kit state feels inconsistent | Brand-new greenfield projects with no `.specify/` history |

**MemoryLint** is particularly important for this cookbook because we maintain both `AGENTS.md` and `CLAUDE.md` alongside `constitution.md`. Silent conflicts between these files are a common source of agent misbehavior.

**Brownfield Bootstrap** + **BrownKit** together replace the manual architecture capture step at the top of the brownfield workflow in `§4` of the cookbook. Use them as a pair:

```
# Instead of manually describing your stack, run:
/brownfield-bootstrap   # discovers architecture
/brownkit               # assesses risk and capabilities
# Then feed the output into:
/speckit.constitution
```

---

### Spec Phase Extensions

These run during or just after `/speckit.clarify`, before `/speckit.plan`. They harden the spec before planning begins — catching problems when they are cheapest to fix.

| Extension | Fits | Where in Workflow | Skip When |
|---|---|---|---|
| **Memory Loader** | Both | Before every `/speckit.*` lifecycle command — loads governance context | Running spec-kit in a fresh session always loads memory automatically |
| **Red Team** | Both | After `/speckit.clarify`, before `/speckit.plan` | Minor bug fixes; purely technical refactors with no user-facing behaviour change |
| **Spec Critique Extension** | Both | After `/speckit.clarify`, before `/speckit.plan` | Time-boxed spikes or prototypes where the spec is intentionally incomplete |

**Red Team** is the most immediately valuable of these. It runs an adversarial pass on the spec, surfacing security risks, edge cases, and hidden assumptions before the plan is written. In a team environment, this replaces the informal "poke holes in this" conversation that often happens (or doesn't happen) in Slack.

**Spec Critique Extension** complements Red Team by adding two lenses Red Team doesn't cover: product strategy (does this solve the right problem?) and engineering risk (is the approach sound?). Run it after Red Team if both produce substantive output; skip it for simple CRUD additions.

```
Spec hardening sequence (before /speckit.plan):
  /speckit.clarify
       │
  /red-team           ← adversarial: what can go wrong?
       │
  /spec-critique      ← dual-lens: right problem? right approach?
       │
  /speckit.plan
```

---

### Plan Phase Extensions

These run after `/speckit.plan` and before or during `/speckit.tasks`. They validate the plan and surface risks before tasks are locked in.

| Extension | Fits | Where in Workflow | Skip When |
|---|---|---|---|
| **Spec Scope** | Both | After `/speckit.plan`, before `/speckit.tasks` | Prototypes or spikes where scope is deliberately unbounded |
| **Architect Impact Previewer** | Both | After `/speckit.tasks`, before implementation handoff | Simple features with no cross-cutting concerns |
| **OWASP LLM Threat Model** | Both | After `/speckit.plan` — only for LLM-powered applications | Applications that don't process, route, or generate LLM output |
| **Version Guard** | Both | After `/speckit.plan` — JS/TS/Node stacks only | Non-JavaScript stacks; stacks with pinned lockfiles already verified |

**OWASP LLM Threat Model** deserves special attention in this cookbook because many projects built with AI agents *are* LLM applications. It maps the spec against the OWASP Top 10 for LLM Applications 2025 — covering prompt injection, insecure output handling, training data poisoning, model denial of service, and supply chain risks. Run it on any spec that involves:

- User-supplied input passed to an LLM
- LLM output rendered to a UI or executed as code
- RAG pipelines, agents, or tool-calling architectures
- Multi-model routing

```
# LLM application plan sequence:
/speckit.plan
     │
/owasp-llm-threat-model   ← identify LLM-specific attack surfaces
     │
/spec-scope               ← estimate effort, detect scope creep
     │
/speckit.tasks
```

**Spec Scope** catches scope creep before it becomes a problem. It produces an effort estimate and flags requirements that have grown beyond the original intent. Particularly useful when `/speckit.clarify` was thorough — clarification often surfaces new requirements that inflate scope silently.

---

### Implementation Phase Extensions

These integrate with the Superpowers TDD loop (`RED → GREEN → REFACTOR`). They do not replace any step — they slot into the loop to improve it.

| Extension | Fits | Where in Workflow | Skip When |
|---|---|---|---|
| **SpecTest** | Both | At the start of the RED phase — generates failing test scaffolds from acceptance criteria | Tasks with acceptance criteria that map directly to unit tests you already know how to write |
| **Checkpoint Extension** | Both | After each RED → GREEN → REFACTOR cycle, before moving to the next task | Tasks so small that a commit per cycle creates noise in git history |
| **Iterate** | Both | When requirements change during implementation — two-phase define-and-apply | Requirements are stable; spec is final |

**SpecTest** slots directly into the Superpowers TDD loop. Instead of writing the failing test from scratch, SpecTest generates test scaffolds from the acceptance criteria in `spec.md`. This ensures the test reflects the spec's intent, not the implementation's assumption of the spec's intent. The Superpowers `test-driven-development` skill then drives the RED → GREEN cycle.

```
Per-task TDD loop (enhanced with extensions):

LOAD task N from tasks.md
     │
/spectest           ← generate scaffold from acceptance criteria
     │
RED  run scaffold, confirm it fails for the right reason
     │
GREEN write minimum code to pass
     │
REFACTOR clean up, stay green
     │
/checkpoint-ext     ← commit this cycle's work granularly
     │
NEXT task
```

**Iterate** is the escape hatch for when specs drift during implementation. It provides a controlled two-phase process (define the change, then apply it) that propagates updates through `spec.md` → `plan.md` → `tasks.md`. Without it, mid-implementation spec changes often cause silent inconsistency that only surfaces at review time.

> **Iterate vs. stopping and re-running Spec-Kit:** Use Iterate for small, bounded requirement changes. If the scope changes significantly, stop, inform the user, and re-run `/speckit.clarify` and `/speckit.plan` from scratch. Do not use Iterate to avoid the cost of proper replanning.

---

### Post-Implementation & Review Extensions

These run after all tasks are complete, before or during `finishing-a-development-branch`. They form a quality and safety gate.

| Extension | Fits | Where in Workflow | Skip When |
|---|---|---|---|
| **Verify Extension** | Both | After last task, before `requesting-code-review` | Solo prototypes not heading to production |
| **Verify Tasks Extension** | Both | Before `finishing-a-development-branch` | Tasks list is short enough to audit manually in under 2 minutes |
| **Cleanup Extension** | Both | After each task's REFACTOR step, and again before branch finish | Very small tasks (< 20 LOC) |
| **Ripple** | Both | After all tasks complete — especially important in brownfield | New greenfield code with no legacy coupling |
| **Security Review** | Both | Before `finishing-a-development-branch` on production-bound code | Internal tooling, non-production prototypes, purely frontend cosmetic changes |
| **Reconcile Extension** | Both | On long-running branches (> 1 week) before merge — corrects spec-code drift | Short-lived branches that are finished within the same session |

**Verify Tasks Extension** catches phantom completions — tasks marked `[x]` in `tasks.md` without corresponding implementation. This is a real failure mode when subagents complete tasks partially (tests pass but feature is incomplete) and mark them done. Run it as a mandatory gate before `finishing-a-development-branch`.

**Ripple** detects side effects that tests cannot catch: documentation gaps, API consumers that break silently, implicit coupling, and cross-module invariants. It is most valuable in brownfield codebases where the dependency graph is complex and test coverage of integration points is often thin.

**Security Review** is a full secure-by-design audit. It runs staged reviews covering OWASP vulnerabilities, secrets exposure, authentication gaps, and injection risks. Run it on:
- Any branch that touches auth, billing, or data access paths
- Any branch that introduces external API calls
- Any brownfield branch that modifies a protected path from `constitution.md`

```
Post-implementation gate sequence (before branch finish):

All tasks GREEN
     │
/verify-ext              ← spec compliance check
     │
/verify-tasks-ext        ← phantom completion detection
     │
/cleanup-ext             ← scout rule quality pass
     │
/ripple                  ← side-effect analysis
     │
/security-review         ← security audit (production code only)
     │
Superpowers: requesting-code-review
     │
Superpowers: finishing-a-development-branch
```

---

### Visibility & Monitoring Extensions

These are optional, stateless, and can be run at any time without affecting the workflow.

| Extension | Fits | Where in Workflow | Use It When |
|---|---|---|---|
| **Spec Diagram** | Both | Any time — generates Mermaid diagrams of workflow state and task dependencies | Onboarding new team members; planning a complex multi-task feature |
| **Cost Tracker** | Both | Any time — tracks real LLM dollar costs per feature | Running multi-agent workflows where API cost is a constraint |

**Spec Diagram** produces Mermaid visualizations of the current SDD state. Paste the output into a PR description or design doc. Particularly useful when handing off between team members mid-feature.

---

### Team & CI Integration Extensions

These require external configuration (tokens, OAuth, CI pipeline access). They are project-specific and should be set up once per repo, not per feature.

| Extension | Fits | Purpose | Key Requirement |
|---|---|---|---|
| **CI Guard** | Both | Blocks spec-kit from generating tasks without a passing CI pipeline | CI system configured with spec compliance checks |
| **Plan Review Gate** | Both | Requires `spec.md` and `plan.md` merged via PR before task generation — enforces formal review | Team agreement on review SLA; slower solo workflows |
| **GitHub Issues Integration** | Both | Generates spec artifacts from existing GitHub Issues; syncs bidirectionally | GitHub token; clear issue → spec direction convention |
| **Spec Validate** | Both | Staged quizzes, peer review SLA, hard gate before `/speckit.implement` | Team review process; willing to gate progress on approval |

**CI Guard** is the highest-value integration extension for teams already running CI. It prevents task generation on a spec that, if implemented, would immediately fail the CI pipeline due to existing baseline failures. This catches the "CI was already red before we started" problem that wastes an entire feature branch.

**Plan Review Gate** adds a formal review step that the solo workflow skips. It enforces that `spec.md` and `plan.md` are reviewed and merged (via MR/PR) before anyone generates tasks. Valuable for regulated environments or teams where premature implementation is a recurring problem.

---

## 6. Extension Decision Guide

Use this table to decide whether to add an extension to a specific project.

| Situation | Extensions to Add |
|---|---|
| New brownfield repo, first-time Spec-Kit adoption | Brownfield Bootstrap → BrownKit → MemoryLint |
| Building an LLM-powered application | OWASP LLM Threat Model + Security Review |
| Long-running feature branch (> 1 week) | Checkpoint Extension + Reconcile Extension |
| Requirements keep changing during coding | Iterate |
| Team environment with formal review process | Plan Review Gate + Spec Validate + CI Guard |
| Spec quality concerns before planning | Red Team + Spec Critique Extension |
| Suspicious task completions / agent hallucination risk | Verify Tasks Extension + Verify Extension |
| Complex brownfield with tight module coupling | Ripple + Architecture Guard (see note below) |
| JavaScript/TypeScript stack with version sensitivity | Version Guard |
| Token/cost budgets are a constraint | Cost Tracker |
| Onboarding a new engineer to the repo | Spec Diagram + Project Health Check |

> **Architecture Guard** (not in the 20 above): Performs continuous governance and drift detection during implementation. Consider it for large brownfield projects with established architecture constraints. It is excluded from the default list because it produces tasks requiring human architectural decisions — in small teams, these tasks can block velocity faster than the drift they prevent.

---

## 7. Extension Placement Map

This is the full workflow with extension insertion points marked:

```
[PRE-SPEC SETUP]
  ├─ MemoryLint                    ← after any memory/constitution edit
  ├─ Brownfield Bootstrap          ← BF only, replaces manual arch capture
  ├─ BrownKit                      ← BF only, after Bootstrap
  └─ Project Health Check          ← BF kickoff or when state is uncertain

[SPEC-KIT: SPEC PHASE]
  /speckit.constitution
       │
  Memory Loader                    ← loads governance before each command
       │
  /speckit.specify
       │
  /speckit.clarify
       │
  Red Team                         ← adversarial spec review
       │
  Spec Critique Extension          ← product + engineering lens
       │
  /speckit.analyze  (optional)

[SPEC-KIT: PLAN PHASE]
  /speckit.plan
       │
  OWASP LLM Threat Model           ← LLM apps only
       │
  Spec Scope                       ← effort + scope creep check
       │
  /speckit.tasks
       │
  Architect Impact Previewer       ← pre-implementation impact check
       │
  Version Guard                    ← JS/TS stacks
       │
  Plan Review Gate                 ← team environments (optional)

[HANDOFF → SUPERPOWERS]
  tasks.md → implementation handoff message

[SUPERPOWERS: IMPLEMENTATION]
  using-git-worktrees
       │
  Per task:
    SpecTest                       ← generate test scaffold from acceptance criteria
       │
    RED (failing test)
       │
    GREEN (minimum code)
       │
    REFACTOR
       │
    Checkpoint Extension           ← granular commit per TDD cycle
       │
    [requirements shift?]
       └─ Iterate                  ← controlled spec refinement

[SUPERPOWERS: POST-IMPLEMENTATION]
  Verify Extension                 ← spec compliance check
       │
  Verify Tasks Extension           ← phantom completion detection
       │
  Cleanup Extension                ← scout rule quality pass
       │
  Ripple                           ← side-effect detection
       │
  Security Review                  ← production code only
       │
  Reconcile Extension              ← long-running branches only
       │
  requesting-code-review
       │
  finishing-a-development-branch

[VISIBILITY — any time]
  Spec Diagram                     ← workflow visualization
  Cost Tracker                     ← LLM cost tracking
```

---

## 8. What We Deliberately Excluded

Not all 150+ community extensions belong in this workflow. Here is what we reviewed and rejected, and why.

| Category | Excluded Extensions | Reason |
|---|---|---|
| **Redundant with cookbook** | Superpowers Bridge, Superpowers Implementation Bridge, Canon | The cookbook already documents the Spec-Kit/Superpowers integration. These add complexity without new capability. |
| **Conflicts with workflow philosophy** | TinySpec, MDE, Ralph Loop | TinySpec and MDE are lighter-weight alternatives to our structured SDD. Ralph Loop is fully autonomous with high hallucination risk. These require choosing a different approach, not extending this one. |
| **Meta-extensions** | Extensify, Presetify, Catalog CI | These are for building and validating extensions/catalogs — not for application development. |
| **Platform-specific** | Spec2Cloud, .NET Framework Migration, all MAQA integrations (Azure DevOps, Linear, Trello, GitHub Projects, Jira) | Valuable within their ecosystems; not general-purpose enough for a cross-team cookbook. |
| **Full lifecycle competitors** | Product Forge, AIDE, Fleet Orchestrator | These are end-to-end workflow products that replace, rather than extend, the Spec-Kit + Superpowers combination. |
| **Experimental / high risk** | Spec Kit Schedule, Agent Assign, Squad Bridge | Stochastic scheduling, multi-agent coordination, and sub-agent delegation systems are immature and introduce unpredictable failure modes. |
| **Pure maintenance utilities** | Archive Extension, Memory Hub, Spec Changelog, Learning Extension | Useful for large teams with dedicated DevEx investment; not core to feature development cycles. |
| **Overlapping pairs** | Time Machine + Reconcile (prefer Reconcile), Review Extension + Staff Review Extension + Requesting-code-review (prefer Superpowers native), Fix Findings + FixIt Extension + systematic-debugging (prefer Superpowers native) | Superpowers already provides strong implementations. Adding these creates ambiguity about which tool owns each concern. |

---

## 9. Quick Reference Cheatsheet

### Greenfield in one command sequence

```bash
# 1. Spec-Kit phase
/speckit.constitution
/speckit.specify <what you want to build>
/speckit.clarify
# optional: /red-team, /spec-critique
/speckit.plan <your stack>
# optional: /owasp-llm-threat-model (LLM apps), /spec-scope
/speckit.tasks

# 2. Handoff message (paste to agent):
# "Use .specify/specs/<feature>/tasks.md. Do not create a new branch. Do not generate a new plan."

# 3. Superpowers takes over (auto-triggered)
# Per task: /spectest → RED → GREEN → REFACTOR → /checkpoint-ext
# After all tasks: /verify-ext → /verify-tasks-ext → /cleanup-ext → /ripple → /security-review
```

### Brownfield in one command sequence

```bash
# 0. First-time setup on this repo
/brownfield-bootstrap
/brownkit
/memorylint

# 1. Spec-Kit phase (same as greenfield, plus constraints)
/speckit.constitution   # include existing stack + protected modules
/speckit.specify <what changes>
/speckit.clarify        # focus on interaction with existing modules
/speckit.plan           # "use existing tech stack, no new deps"
/speckit.tasks

# 2. Handoff message (paste to agent):
# "Use .specify/specs/<feature>/tasks.md. Verify all existing tests pass BEFORE touching files."

# 3. Superpowers takes over
# Same post-implementation gate, plus /ripple is mandatory
```

### Commit message format

```
<type>(<scope>): <description>

Types: feat | fix | refactor | test | docs | chore
Scope: feature name from Spec-Kit (e.g., 001-user-auth)

Examples:
feat(001-user-auth): add JWT refresh token rotation
fix(002-payment): correct idempotency key collision on retry
```

### Priority order when rules conflict

```
1. constitution.md          ← always wins
2. spec.md acceptance criteria
3. tasks.md steps
4. CLAUDE.md rules
5. Agent judgment           ← lowest; only when all above are silent
```

When any two levels conflict: **stop, name the conflict, ask the user.** Never resolve silently.

---

## Resources

- [Spec-Kit repository](https://github.com/github/spec-kit)
- [Superpowers repository](https://github.com/obra/superpowers)
- [Community Extensions Catalog](https://github.github.io/spec-kit/community/extensions.html)
- [Full workflow reference → SUPERPOWERS_SPECKIT_COOKBOOK.md](./SUPERPOWERS_SPECKIT_COOKBOOK.md)
