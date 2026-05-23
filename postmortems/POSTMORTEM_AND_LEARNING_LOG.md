# Postmortem and Learning Log

> **Philosophy:** This log exists to improve the system, not to assign blame.
> Every failure is a signal that the spec, the prompt-skills, or the verification gates
> need to be sharper. Agents and humans are collaborators in a learning system.
>
> **Rules:**
> - NEVER use this log to criticize an agent or a team member by name.
> - ALWAYS identify a systemic fix — a change to a spec, skill file, or gate.
> - APPEND only. Do not delete or alter previous entries.
> - Reference the `.ai/traces/AGENT_LOG_REFLECTIONS.md` entry that triggered this postmortem.
>
> **When to create an entry:**
> - Any agent-generated bug that reaches staging or production
> - Any spec compliance failure caught at the review stage
> - Any TDD cycle where tests could not be made to pass within a single session
> - Any Gate 3 or Gate 4 failure in `VERIFICATION_AND_EVAL_GUIDE.md`

---

## Entry Format

Copy this template for each new entry. Do not modify the structure.

```
## [YYYY-MM-DD] Postmortem: <incident-slug>
**Severity**: LOW | MEDIUM | HIGH
**Feature/Task affected**: <feature name and task number from tasks.md>
**What happened**: <factual description of the failure, 2-4 sentences>
**Root cause**: (in the spec? in the prompt-skill? in the verification gate?)
**Impact**: <what broke, who was affected, how long it lasted>
**Fix applied**: <what change was made to resolve the immediate issue>
**Guardrail created/updated**: <which file was updated to prevent recurrence>
**Prompt refinement**: <exact text added to which skill file, or "none required">
---
```

---

## [2026-05-23] Postmortem: auth-token-rotation-spec-ambiguity

**Severity**: MEDIUM
**Feature/Task affected**: `001-user-auth` — Task 3: Implement JWT refresh token rotation

**What happened**: The Coder agent implemented token rotation using immediate invalidation of the old token (strategy A). The spec criterion read "rotate tokens on every authenticated request" without defining "rotate." After implementation and a passing test suite, the QA environment revealed that mobile clients making concurrent requests with the same token were rejected — the in-flight grace period required by the mobile SDK was not accommodated. The feature had to be partially reverted and re-implemented with a 30-second overlap window.

**Root cause**: In the spec. The acceptance criterion used domain jargon ("rotate") without a precise definition. The `constitution.md` security section stated "no long-lived tokens" but did not define "long-lived" in milliseconds or seconds. The Coder agent surfaced the ambiguity (see `AGENT_LOG_REFLECTIONS.md` entry `2026-05-23 14:32`) but, after 8 minutes without resolution, made a reasonable default choice rather than blocking indefinitely. The verification gate did not include a concurrent-request integration test.

**Impact**: One task required partial revert and re-implementation. Estimated 2 hours of agent compute time and 45 minutes of human review time lost. No production impact — caught in QA.

**Fix applied**: Added a 30-second grace period for token overlap. Updated the auth integration test suite to include a concurrent-request scenario. Re-ran full test suite; all pass.

**Guardrail created/updated**: Two files updated:
- `VERIFICATION_AND_EVAL_GUIDE.md` Gate 2: added "For auth-related tasks, include a concurrent-request test scenario before marking COMPLETE. (See postmortem: 2026-05-23-auth-token-rotation-spec-ambiguity)"
- `.specify/memory/constitution.md` security section: added definition of "token rotation" and "long-lived token" (> 24h = long-lived; rotation = issue new + allow 30s grace period for in-flight requests)

**Prompt refinement**: Added to `.claude-plugin/skills/auth-standards.md` (new file): "Token rotation on this project means: (1) issue a new token, (2) allow the old token to remain valid for 30 seconds to accommodate in-flight requests, (3) after 30 seconds, reject the old token. Never implement immediate invalidation without explicit spec instruction."

---

<!-- Real entries are appended below this line. -->
