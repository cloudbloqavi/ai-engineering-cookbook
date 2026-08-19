# Agent Execution Journal

> **What this file is:** An append-only execution journal written by agents after every
> implementation session. It is the observability backbone of the AI-Native SDLC.
>
> **Rules:**
> - NEVER manually delete entries. This log is forensic evidence.
> - NEVER overwrite a previous entry. Append only — always at the bottom.
> - Agents append automatically per DIRECTIVE 3 in CLAUDE.md.
> - Humans may read and annotate entries but must not alter the original text.
>
> **Purpose:** Over time, this log surfaces recurring frictions, ambiguous spec patterns,
> and prompt-skill gaps. It feeds the Continuous Improvement Flywheel:
> Execution → Verification → Learning → Refinement → Execution.

---

## Log Entry Format

Copy this template for each new entry. Do not modify the structure.

```
## [YYYY-MM-DD HH:MM] Session: <task-slug>
**Task**: <reference to tasks.md item, e.g. "Task 3 — Implement JWT refresh">
**Outcome**: COMPLETE | PARTIAL | BLOCKED
**Changes made**: <comma-separated file list>
**Frictions encountered**: <what slowed the agent: ambiguous spec, missing context, unclear instruction>
**Prompt clarity issues**: <where the spec or constitution was ambiguous or contradictory>
**Suggested refinements**: <specific prompt-skill or spec update that would prevent the friction>
---
```

---

## [2026-05-23 14:32] Session: 001-user-auth-jwt-refresh

**Task**: Task 3 — Implement JWT refresh token rotation (`.specify/specs/001-user-auth/tasks.md`)
**Outcome**: COMPLETE
**Changes made**: `src/auth/tokenService.ts`, `src/auth/tokenService.test.ts`, `src/middleware/authGuard.ts`
**Frictions encountered**: The spec acceptance criterion stated "tokens must be rotated on every use" but did not specify whether the old token should be immediately invalidated or allowed a 30-second grace period for in-flight requests. Spent approximately 8 minutes searching `spec.md` and `constitution.md` for clarification before surfacing the ambiguity to the user.
**Prompt clarity issues**: `spec.md` criterion 4.2 reads "rotate tokens on every authenticated request." The phrase "rotate" is undefined — it is unclear whether this means (a) issue new token + invalidate old immediately, or (b) issue new token + allow old to expire naturally. The constitution's security section says "no long-lived tokens" but does not define "long-lived."
**Suggested refinements**: Add a domain-specific glossary to the `constitution.md` security section defining "token rotation" precisely. Alternatively, add a `.claude-plugin/skills/auth-standards.md` prompt-skill that encodes the team's authentication conventions so agents do not need to infer them from general security principles.

---

<!-- Real entries are appended below this line by agents during execution sessions. -->

## [2026-06-11] Session: multi-agent-environment-installer

**Task**: Make the `npx ai-engineering-cookbook` installer support multiple coding-agent environments (Cursor, GitHub Copilot, Codex, Antigravity, Roo, Claude) via an interactive multi-select, plus an "Others" option that installs into a `.coding/` placeholder folder for the user to rename.
**Outcome**: COMPLETE
**Changes made**: `bin/cli.js`, `bin/install-prompt-optimizer.js`, `bin/install-doc-coherence.js`, `README.md`
**Frictions encountered**: Per-tool `--tool` profiles already existed in both installers, but the interactive `cli.js` path hard-defaulted to Claude with no environment prompt. Added an `others` profile (→ `.coding/skills`) with a post-install rename note, and a comma-separated multi-select prompt in `cli.js` that forks the installer once per selected tool. No interactive checkbox library was added (dependency policy requires maintainer approval) — used a dependency-free numeric multi-select instead.
**Prompt clarity issues**: None blocking. The goal phrase "it only supports plot" was read as "only defaults to Claude" — confirmed by the code.
**Suggested refinements**: If a true arrow-key checkbox UX is desired later, open a PR to add a vetted prompt library per the dependency policy.

---

## [2026-08-19] Session: 2026-standards-refresh

**Task**: Research current AI-engineering adoption (open source, startups, SMEs), audit this repo's methodology and tooling against it, then apply incremental surgical changes. Also: add the missing MIT LICENSE, keep all instructions plain-English, add visual diagrams, and cover macOS/Windows/Linux consistently.
**Outcome**: COMPLETE
**Changes made**: `LICENSE`, `docs/agent-standards.md`, `docs/evaluation-and-observability.md`, `test/build-explorer.test.js`, `test/check-doc-coherence.test.js`, `scripts/build-explorer.js`, `package.json`, `.github/workflows/docs-ci.yml`, `.github/cspell.json`, `README.md`, `GLOSSARY.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `design/README.md`, `design/src/cookbook-data.jsx`, `design/src/cookbook-app.jsx`, `design/cookbook-explorer.html`, `docs/prompt-optimizer.md`, `docs/troubleshooting.md`
**Frictions encountered**: (1) `package.json` declared `"license": "MIT"` with `"private": false` while no `LICENSE` file existed — the published tarball would have carried an unbacked MIT claim. (2) Two Node scripts that CI depends on (`scripts/check-doc-coherence.js`, `scripts/build-explorer.js`) had zero tests, in a repo whose own `CLAUDE.md §3` makes TDD mandatory. `build-explorer.js` called `main()` at module load and hard-coded its paths, so it was not testable without a small refactor (now exports `build()` behind a `require.main === module` guard). (3) `hn.algolia.com`, `news.ycombinator.com` and `reddit.com` are all blocked by this environment's network egress proxy, so Hacker News and Reddit signals were reached indirectly through web search result titles and secondary reporting rather than verified point counts. (4) `npm test` was first written as `node --test test/*.test.js`, which silently breaks on Windows because `cmd.exe` does not expand globs; changed to bare `node --test`, which uses Node's own cross-platform discovery.
**Prompt clarity issues**: `CLAUDE.md §7` listed only markdown linters under "Test runner" and "Coverage floor: N/A", which reads as "this repo has no testable code" — but `bin/`, `scripts/` and `hooks/` ship real JavaScript. That row was the reason the gap went unnoticed. Updated it to name `node --test` and to state that any script a CI job depends on needs a test file.
**Suggested refinements**: (1) Several docs still link to `github.com/cloudbloqavi/ai-engineering-cookbook` while the git remote is now `exponen-agi/ai-engineering-cookbook`; the link-check gate does not catch this because the old URL still resolves. Worth a follow-up decision on which is canonical. (2) `.github/mlc-config.json` ignores most external hosts, so a stale external link can live indefinitely — consider a periodic non-blocking job that checks the ignored hosts too. (3) Version-bearing claims (Next.js 14, Express 4.x, React 18.3.1, "December 2025", "30+ tools") are spread across docs with no owner declared in `templates/coherence.config.json`; declaring them as facts there would make drift fail CI instead of aging silently.

---

## [2026-08-19] Session: canonical-repo-url-migration

**Task**: Follow-up to `2026-standards-refresh`. The maintainer confirmed `exponen-agi` is the new home, resolving the open question raised in the previous entry.
**Outcome**: COMPLETE
**Changes made**: `README.md`, `CONTRIBUTING.md`, `package.json`, `.github/mlc-config.json`, `.github/cspell.json`, `docs/agent-standards.md`, `docs/evaluation-and-observability.md`, `docs/troubleshooting.md`, `docs/doc-coherence.md`, `docs/prompt-optimizer.md`, `design/src/cookbook-data.jsx`, `design/cookbook-explorer.html`
**Frictions encountered**: The stale owner appeared in four distinct shapes, so a single find-and-replace was not enough: the GitHub Pages host (`cloudbloqavi.github.io`), issue-tracker URLs (`github.com/cloudbloqavi/`), npm install specifiers (`github:cloudbloqavi/`), and the explorer's `meta.repo` data field. `.github/mlc-config.json` also had to be updated in the same commit — it ignores the Pages host by pattern, so leaving the old pattern would have exposed the new URL to a live link check while silently continuing to skip the old one. `.github/CODEOWNERS` still reads `* @cloudbloqavi`, but that is a personal GitHub handle rather than a repository reference, so it was deliberately left alone.
**Prompt clarity issues**: None. The instruction was unambiguous.
**Suggested refinements**: The repository owner is now asserted in six files with no declared owner in `templates/coherence.config.json`. Declaring it as a fact there — owner `README.md`, marker `exponen-agi/ai-engineering-cookbook` — would make any future rename fail the doc-coherence gate instead of leaving half the docs pointing at a dead host. This is the same class of drift the previous entry flagged for version numbers.

---
