# Verification and Evaluation Guide

> **What this file is:** A living codification of the automated and human verification gates
> that must pass before any code is committed or merged on this project.
>
> **When to update:** Whenever a postmortem reveals a gap that a gate should have caught.
> Add the new check here and reference the postmortem entry.
>
> **Authority:** This file is read by the Verifier agent role (see `AGENT_PROFILE_ROLES.md`)
> and referenced during the DIRECTIVE 4 compliance check in CLAUDE.md.

---

## Gate Sequence

Gates run in this order. A failure at any gate blocks progression to the next.

```
GATE 1 — Automated Checks (run on every commit)
     ↓
GATE 2 — Spec Compliance Check (run after each task)
     ↓
GATE 3 — Human Review Triggers (run before merge)
     ↓
GATE 4 — Final Pre-Merge Checks
```

---

## Gate 1 — Automated Checks

Run these on every commit. Configure in CI; also run locally before pushing.

| Check | Command | Threshold | Fail action |
|---|---|---|---|
| Markdown linting | `markdownlint "**/*.md" --ignore node_modules --ignore ".specify/**"` | Zero errors | Block commit |
| Broken link check | `find . -name "*.md" \| xargs markdown-link-check --config .github/mlc-config.json` | Zero broken links | Block commit |
| Spell check | `cspell "**/*.md" --config .github/cspell.json` | Zero unknown words | Block commit, alert user |
| Secret scanning | `trufflehog filesystem . --only-verified` | Zero secrets | Block commit, alert user |

**To configure for your project:** Replace the `<!-- ... -->` placeholders with your actual commands.
These must match the `CI command` field in `CLAUDE.md §6`.

---

## Gate 2 — Spec Compliance Check

Run after each RED → GREEN → REFACTOR cycle, before advancing to the next task.

```
FOR EACH acceptance criterion in .specify/specs/<feature>/spec.md:
  1. Can you point to the exact code that satisfies it?
       NO  → task is not complete. return to GREEN phase.
  2. Is there a test that fails without the implementation?
       NO  → write the test. the TDD loop requires it.
  3. Does the implementation introduce behaviour NOT in the spec?
       YES → remove it. gold-plating violates GATE 3 of CLAUDE.md.
```

**Phantom completion check:** Cross-reference `tasks.md` checkboxes against actual commits.
A task marked `[x]` with no corresponding commit diff is a phantom completion — uncheck it.

---

## Gate 3 — Human Review Triggers

The following conditions require a human to review before the branch proceeds:

| Condition | Why | Action |
|---|---|---|
| Any change to a protected path (per `constitution.md`) | High blast radius | Pause. Name the path. Wait for explicit approval. |
| New external dependency introduced | Supply chain risk | Pause. Cite the dependency policy in `constitution.md`. |
| Test coverage drops below floor | Quality regression | Block. Do not merge until floor is restored. |
| Any Gate 1 check produces a warning (not just error) | Warnings become errors | Surface warning. Ask user whether to treat as blocking. |
| Agent uncertainty on spec intent | Ambiguity produces debt | Surface the ambiguity. Do not resolve silently. |
| Postmortem exists for this feature area | Known risk zone | Notify reviewer. They decide whether extra scrutiny is needed. |

---

## Gate 4 — Final Pre-Merge Checks

Run once, after all tasks are complete and Gate 3 reviews are resolved.

```
CHECKLIST (all must be YES before finishing-a-development-branch):
  [ ] All tasks.md items are checked AND have a corresponding commit
  [ ] Full test suite green (not just changed-file tests)
  [ ] No uncommitted changes in working tree
  [ ] .ai/traces/AGENT_LOG_REFLECTIONS.md has an entry for this session
  [ ] constitution.md was not modified without user approval
  [ ] No secrets, credentials, or API keys in any staged file
  [ ] PR/MR description references the spec.md acceptance criteria
```

---

## How to Update This File

When a postmortem reveals a verification gap:

1. Add a new row to the relevant gate table (Gate 1, 2, or 3)
2. In the new row's "Fail action" or "Action" column, reference the postmortem:
   `(See postmortems/POSTMORTEM_AND_LEARNING_LOG.md: <date>-<slug>)`
3. If a new automated check is added, update the CI pipeline to run it
4. Commit the update as: `chore(verification): add <check-name> gate per postmortem <slug>`
