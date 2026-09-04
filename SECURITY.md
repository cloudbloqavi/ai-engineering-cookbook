# Security Policy

This repository is documentation plus a handful of small, dependency-free Node
scripts. It has no server, no database, and it never handles your data. Even so,
two things here run on a contributor's machine, so they are worth treating
seriously:

| What runs on your machine | Where it lives | What it can do |
| :--- | :--- | :--- |
| The `npx` skill installers | `bin/` | Creates and writes files inside your project (for example `.claude/skills/`) |
| The prompt-optimizer hook | `hooks/prompt-optimizer-gate.js` | Runs on every prompt you submit in Claude Code, and prints text into your session |
| The CI gates | `scripts/` | Read-only. They scan Markdown and config files and exit 0 or 1 |

## Supported versions

Only the latest commit on `main` is supported. This is a living guide, not a
released library — if you find a problem, it is fixed forward on `main`.

The scripts are tested on the Node.js versions listed in
[`package.json`](./package.json) `engines` and in the CI matrix. Older Node
versions are past their upstream end-of-life and receive no security fixes from
the Node project, so they are not supported here either.

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Use GitHub's private reporting instead:

1. Go to the **Security** tab of this repository.
2. Choose **Report a vulnerability**.
3. Describe what you found, how to reproduce it, and what an attacker could do.

If private reporting is not available to you, open a normal issue that says only
*"security report, please contact me"* — with no details — and a maintainer will
arrange a private channel.

**What to expect:** an acknowledgement within 7 days, and an assessment within 30
days. Because this project has no release channel, an accepted fix ships as a
normal commit to `main`.

## What counts as a vulnerability here

Please do report:

- An installer in `bin/` writing outside the directory it was pointed at (path
  traversal), or overwriting a file it should have left alone.
- The hook in `hooks/` leaking file contents, environment variables, or anything
  else it should not read.
- Instructions in a `SKILL.md` under `skills/` that would cause an agent to do
  something a reader would not expect — for example exfiltrating a secret. This
  is a real class of attack; see
  [Agent Security → Poisoned skills](./docs/agent-security.md).
- A documented command in `docs/` that is unsafe to run as written on macOS,
  Windows or Linux.

Please do **not** report:

- Vulnerabilities in third-party tools this cookbook merely *mentions*
  (Spec-Kit, Superpowers, an MCP server, an eval framework). Report those
  upstream. We will happily take a PR that adds a warning to our docs.
- The fact that an AI agent can be prompt-injected in general. That is a
  property of agents, and [`docs/agent-security.md`](./docs/agent-security.md)
  exists to explain it.

## Before you install anything from this repo

The same advice this cookbook gives about other people's skills applies to ours.
Read a skill before you install it — the review checklist is in
[Agent Security → Reviewing a skill before you install it](./docs/agent-security.md).
Every installer here supports a dry run:

```bash
# macOS / Linux
npx ai-engineering-cookbook doc-coherence --dry-run
```

```powershell
# Windows (PowerShell)
npx ai-engineering-cookbook doc-coherence --dry-run
```
