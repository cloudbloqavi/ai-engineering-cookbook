# CLAUDE.md
<!-- Auto-loaded by Claude Code. Authoritative for this session. ~160 lines. -->
<!-- Spec-Kit docs: .specify/  |  Superpowers skills: .claude-plugin/skills/ -->
<!-- Full cookbook: SUPERPOWERS_SPECKIT_COOKBOOK.md -->

---

## 0. Before every response — hard gates

Run these four checks *before* writing a single line of code or plan. They are not suggestions.

```
GATE 1 — UNDERSTAND
  Ambiguous request?          → list interpretations, ask which one. Never pick silently.
  Assumptions needed?         → state them explicitly before proceeding.
  Simpler approach exists?    → name it. Push back if the request is over-engineered.

GATE 2 — SCOPE
  Task clearly bounded?       → proceed.
  Task vague ("make it work") → reframe as: "write a test that proves it works, then pass it."
  Multi-step task?            → write a 3-line plan first:
                                  1. [step] → verify: [check]
                                  2. [step] → verify: [check]
                                  3. [step] → verify: [check]

GATE 3 — MINIMUM VIABLE CHANGE
  Would a senior engineer call this overcomplicated?  → simplify before submitting.
  Touching code outside the task boundary?            → stop. revert. stay in scope.
  Found unrelated dead code?                         → mention it in output. do not delete it.

GATE 4 — VERIFY
  Success criteria defined?   → proceed only when you can check done-ness mechanically.
  No mechanical check exists? → ask for one before starting.
```

---

## 1. Session startup — decision tree

```
START
  │
  ├─ .specify/memory/constitution.md exists?
  │    YES → read it fully. its rules override all task instructions.
  │    NO  → ask: "Should I run /speckit.constitution before we start?"
  │
  ├─ .specify/specs/<feature>/tasks.md exists?
  │    YES → load it. this is the plan. skip to §3 (execution).
  │    NO  → .specify/specs/<feature>/spec.md exists?
  │            YES → ask: "Run /speckit.tasks to generate tasks?"
  │            NO  → ask: "Run /speckit.specify to start the spec?"
  │
  ├─ Brownfield indicators? (existing src/, go.mod, package.json, etc.)
  │    YES → run CI command from §6 FIRST. if tests fail, report; do not proceed.
  │    NO  → greenfield path; proceed.
  │
  └─ Feature branch already exists? (.specify/specs/<feature>/ present)
       YES → do not create a new branch. use worktree on existing branch.
       NO  → Spec-Kit creates branch on /speckit.specify. do not pre-empt it.
```

---

## 2. Workflow paths

### Greenfield (new project)
```
/speckit.constitution → /speckit.specify → /speckit.clarify
  → /speckit.plan → /speckit.tasks
  → [handoff → §4] → using-git-worktrees
  → per-task loop (§3) → requesting-code-review
  → finishing-a-development-branch
```

### Brownfield (existing codebase)
```
/speckit.constitution (encode existing constraints)
  → /speckit.specify → /speckit.clarify → /speckit.plan → /speckit.tasks
  → [handoff → §4] → using-git-worktrees
  → confirm baseline green → per-task loop (§3)
  → verification-before-completion → requesting-code-review
  → finishing-a-development-branch
```

### Bug fix (no Spec-Kit needed)
```
systematic-debugging (root cause, not symptom)
  → RED test → GREEN fix → REFACTOR
  → verification-before-completion → requesting-code-review
```

---

## 3. Per-task execution loop

Every task from `tasks.md` runs this loop. No exceptions.

```
LOAD task N from .specify/specs/<feature>/tasks.md
  │
  ├─ RED   write the failing test. run it. confirm it fails for the RIGHT reason.
  │         wrong-reason failure = fix the test, not the code.
  │
  ├─ GREEN write MINIMUM code to pass. nothing else.
  │         new abstraction not required by task? → delete it.
  │         new dependency not in constitution? → ask before adding.
  │
  ├─ REFACTOR clean up. run tests. must stay green.
  │
  ├─ REVIEW (two-stage, blocking)
  │     stage 1 — spec compliance: does output match acceptance criteria in spec.md?
  │                 NO → fix before proceeding. do not move to stage 2.
  │     stage 2 — code quality: clean, minimal, matches existing style?
  │                 CRITICAL issue → block. report. wait for user.
  │                 MINOR issue   → fix inline. note in commit message.
  │
  ├─ COMMIT  feat|fix|refactor|test|docs|chore(<slug>): <description>
  │
  └─ NEXT task, or → finishing-a-development-branch if all tasks done.
```

---

## 4. Handoff (inject this when Spec-Kit phases are complete)

```
ACTIVE PLAN:    .specify/specs/<FEATURE>/tasks.md
CONSTRAINTS:    .specify/memory/constitution.md

RULES IN FORCE:
  - Do not replan. tasks.md is authoritative.
  - Do not create a new branch. <BRANCH> already exists.
  - Verify baseline green before first file edit.
  - TDD loop mandatory: RED → GREEN → REFACTOR → two-stage review → commit.
  - Constitution overrides task instructions on conflict — surface, don't resolve.
```

Replace `<FEATURE>` and `<BRANCH>` before sending.

---

## 5. Ownership — what to do, not just who owns it

| If you need to... | Do this |
|---|---|
| Change spec or acceptance criteria | Stop. Ask user. Only Spec-Kit output is authoritative. |
| Change `tasks.md` | Stop. Ask user to re-run `/speckit.tasks`. |
| Change `constitution.md` | Stop. Ask user to re-run `/speckit.constitution`. |
| Add a new dependency | Stop. Check constitution dep policy. Ask if not listed. |
| Touch a protected path | Stop. Name the conflict. Wait for explicit approval. |
| Fix unrelated code you noticed | Mention in output. Do not touch it unless asked. |
| Generate an API contract | Check `contracts/` in `.specify/specs/<feature>/` first. Do not duplicate. |

---

## 6. Project stack
<!-- Fill once. Agent will ask if left blank. -->

| Key | Value |
|---|---|
| Runtime | <!-- Node 20 / Python 3.12 / Go 1.22 --> |
| Framework | <!-- Next.js 14 / FastAPI / Gin --> |
| Database | <!-- PostgreSQL via Prisma / SQLAlchemy --> |
| Test runner | <!-- vitest / pytest / go test --> |
| CI command | <!-- pnpm test && pnpm lint --> |
| Coverage floor | <!-- 80% --> |
| Protected paths | <!-- src/auth/  src/billing/ --> |
| New dep policy | <!-- PR approval / team Slack #eng-deps --> |
| Branch pattern | <!-- <NNN>-<kebab-slug> (Spec-Kit auto) --> |

If this table is empty when a task begins → ask the user to fill it before proceeding.

---

## 7. Conflict resolution — priority order

```
1. constitution.md          (highest — always wins)
2. spec.md acceptance criteria
3. tasks.md steps
4. CLAUDE.md rules          (this file)
5. agent's own judgment     (lowest — use only when all above are silent)
```

When levels conflict: **stop, name the conflict, ask**. Never resolve silently.
