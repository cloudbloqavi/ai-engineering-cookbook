# Glossary

Plain-English definitions for every term used in this cookbook. If you encounter a word you don't know while reading the guides, look it up here first.

> **Tip:** Terms link to the guide where they are used in context. You don't need to read everything — look up what you need, then follow the link.

---

## Acceptance Criteria

The specific, testable conditions that prove a feature is complete. Written as "Given / When / Then" statements in `spec.md`. If you can't write an automated test for a criterion, it's not specific enough.

> **Example:** *"Given a user submits a login form with correct credentials, when the server processes it, then a `token` cookie is set and the response is 200."*

See [Greenfield Guide](./docs/greenfield.md)

---

## AI Agent / Coding Agent

An AI model (such as Claude Code, Cursor, or GitHub Copilot) that can read files, write code, run commands, and make decisions — all within a defined scope. In this cookbook, agents are given specific roles and constraints so they behave predictably.

See [AGENTS.md](./AGENTS.md)

---

## AI-Native Engineering

A software development approach where AI agents write the majority of the implementation code (~75%), while humans define intent, approve specs, and verify outcomes. Your role shifts from *code author* to *intent definer and outcomes verifier*.

See [README.md](./README.md)

---

## Blameless Culture / Postmortem

When something goes wrong, the response focuses on *why the system failed* (unclear spec? missing gate? weak test?) — not on who caused it. Every failure becomes a learning input that improves the spec, gates, or guidelines. No blame, only system improvement.

See [AI Governance Guide](./docs/governance.md)

---

## Brownfield

Working in an *existing* codebase that already has running code, tests, and data. The key challenge is making changes without breaking what already works. Contrast with [Greenfield](#greenfield).

See [Brownfield Workflow Guide](./docs/brownfield.md)

---

## Coder (agent role)

The agent role responsible for executing the TDD loop (RED → GREEN → REFACTOR) for each task in `tasks.md`. Writes minimum code to pass tests, nothing more.

See [AGENTS.md](./AGENTS.md)

---

## Clarification Q&A

An interactive session run via `/speckit.clarify` where Spec-Kit asks targeted questions about the spec to remove ambiguities before implementation begins. Answers are appended to `spec.md`.

> **Example:** *"What are the pre-defined expense categories? Or can users create custom ones?"*

See [Greenfield Guide](./docs/greenfield.md)

---

## Constitution (`constitution.md`)

A project-level rules file (at `.specify/memory/constitution.md`) that defines the tech stack, forbidden actions, protected paths, and constraints that all agents must obey. It is the highest-authority document in the workflow — it overrides everything except a direct human instruction.

> **Example:** *"Tech stack: Node.js 20, Express 4.x. Do not modify: `src/database/migrations/`."*

See [Brownfield Workflow Guide](./docs/brownfield.md)

---

## Delta Spec

A specification written for a brownfield project that describes only the *change* being made — not a full system description. Focuses on what is being added, modified, or removed, and how it must remain backward-compatible with existing behavior.

See [Brownfield Workflow Guide](./docs/brownfield.md)

---

## Execution Log / Reflections Log

The append-only journal at `.ai/traces/AGENT_LOG_REFLECTIONS.md` where agents record what happened after every implementation session: outcome (COMPLETE / PARTIAL / BLOCKED), frictions encountered, and suggested improvements. Never overwritten — always appended.

See [AI Governance Guide](./docs/governance.md)

---

## Flywheel (Continuous Improvement Flywheel)

The feedback loop that makes the development process smarter over time: execution → log → verify → learn → refine → next execution. Each failure logged becomes a system improvement that prevents the same failure from recurring.

See [AI Governance Guide](./docs/governance.md)

---

## Gate 1 / Gate 2 / Gate 3 / Gate 4

The four sequential verification gates that code must pass before merging:
- **Gate 1** — Automated checks: linting, type checking, tests, secret scanning.
- **Gate 2** — Spec compliance: every acceptance criterion has a passing test.
- **Gate 3** — Human review triggers: protected path changed, new dependency, coverage dropped.
- **Gate 4** — Final pre-merge checklist: all tasks committed, no secrets staged, log entries complete.

See [Verification Guide](./.ai/config/VERIFICATION_AND_EVAL_GUIDE.md)

---

## Gold-Plating

Adding features, abstractions, or complexity beyond what the spec requires. Strictly prohibited. A smaller, correct implementation always beats a larger, unrequested one.

---

## GREEN phase

The second phase of the TDD loop. Write the *minimum* code required to make the failing test pass. Nothing more — no extra features, no early abstractions. See also: [RED phase](#red-phase), [REFACTOR phase](#refactor-phase).

---

## Greenfield

Starting a brand-new project or feature from an empty directory with no existing code or tests. Contrast with [Brownfield](#brownfield).

See [Greenfield Workflow Guide](./docs/greenfield.md)

---

## Handoff / Handoff Message

A specific text block you paste into your coding agent's chat interface to transfer control from Spec-Kit (planning) to Superpowers (execution). It tells the agent which `tasks.md` to follow and what constraints to obey — critically, it prevents the agent from re-creating the plan or the git branch.

See [Greenfield Guide](./docs/greenfield.md)

---

## Orchestrator (agent role)

The agent role that manages routing between other roles. It loads context at session start, enforces the Spec-Kit → Superpowers handoff boundary, and escalates blocked states to the human.

See [AGENTS.md](./AGENTS.md)

---

## Phantom Completion

A task marked `[x]` in `tasks.md` with no corresponding code commit. The task appears done but no implementation exists. Caught by the Verifier role using `Verify Tasks` extension.

---

## Plan (`plan.md`)

A technical design document generated by `/speckit.plan` that describes *which files will be created or modified* and *why*, based on the approved spec. It is the bridge between the spec (what to build) and the tasks checklist (how to build it step by step).

See [Greenfield Guide](./docs/greenfield.md)

---

## Planner (agent role)

The agent role responsible for translating a human's idea into a verified `spec.md` with testable acceptance criteria. Runs clarification Q&A to flush ambiguities before planning begins.

See [AGENTS.md](./AGENTS.md)

---

## RED phase

The first phase of the TDD loop. Write a test that *fails* — before writing any implementation code. A test that doesn't fail first proves nothing; it may be testing the wrong thing or nothing at all.

---

## REFACTOR phase

The third phase of the TDD loop. Clean up the code — improve naming, remove duplication, simplify logic — while keeping all tests green. No new behavior is added during refactor.

---

## Reviewer (agent role)

The agent role that performs two-stage review: (1) spec compliance — does every acceptance criterion have a passing test? (2) code quality — is the code clean, minimal, and consistent with the existing style?

See [AGENTS.md](./AGENTS.md)

---

## Spec / Specification (`spec.md`)

A document generated by `/speckit.specify` and refined by `/speckit.clarify` that describes *what* a feature should do in terms of user stories and acceptance criteria. It is the authoritative source of truth for implementation — the agent must implement exactly what it says, nothing more.

See [Greenfield Guide](./docs/greenfield.md)

---

## Spec-Kit

A CLI tool developed by GitHub (`specify-cli`) for AI-assisted planning. It runs a structured workflow (constitution → specify → clarify → plan → tasks) that produces a verifiable `tasks.md` before any code is written. Handles the *"what to build"* half of the workflow.

See [Installation Guide](./docs/installation.md)

---

## Superpowers (plugin)

An AI agent plugin (by @obra) that handles the *"how to build it"* half of the workflow. Once it receives the handoff message, it creates an isolated git worktree, picks up tasks from `tasks.md`, and runs the TDD loop for each one.

See [Installation Guide](./docs/installation.md)

---

## Tasks (`tasks.md`)

A checkbox checklist generated by `/speckit.tasks` from the technical plan. Each item is a discrete unit of work for the Coder agent. The handoff message points to this file. It is the authoritative implementation plan — agents must not replan or skip items.

> **Example:** `- [ ] Task 3: Write unit tests for expense CRUD helper functions.`

See [Greenfield Guide](./docs/greenfield.md)

---

## TDD / Test-Driven Development

A development discipline where tests are written *before* implementation code. The sequence is always: write a failing test (RED) → write code to pass it (GREEN) → clean up (REFACTOR). Enforced by the `test-driven-development` Superpowers skill.

---

## Verification Gate

A mandatory checkpoint that code must pass before proceeding to the next stage. Gates are defined in `.ai/config/VERIFICATION_AND_EVAL_GUIDE.md`. Failure at any gate blocks progress until the issue is resolved.

See [AI Governance Guide](./docs/governance.md)

---

## Verifier (agent role)

The agent role that runs all automated gates before a branch is merged. Catches phantom completions, triggers postmortem logging on gate failures, and produces a green signal for `finishing-a-development-branch`.

See [AGENTS.md](./AGENTS.md)

---

## Worktree (git worktree)

A git feature that lets you check out a branch into a separate directory without cloning the repo again. Superpowers creates an isolated worktree for each feature so the agent can work without affecting your main working directory. Run `git worktree list` to see active worktrees.
