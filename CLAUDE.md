# Agent Instructions & Workspace Guidelines
Welcome, AI Agent! This document defines the standard engineering rules, workflows, quality bars, and anti-patterns for this repository. Adhere to these guidelines strictly before making any changes.

---

## Hard Gates (Before Writing Code or Plans)

Run these checks *before* writing a single line of code or proposing an implementation plan:

1. **GATE 1 — UNDERSTAND**:
   - If the request is ambiguous, list potential interpretations and ask the user to clarify. Never make assumptions or pick interpretations silently.
   - Look for simpler approaches first. Push back on over-engineered requests.
2. **GATE 2 — SCOPE & PLANNING**:
   - Keep tasks tightly bounded. If a task is multi-step, outline a concise 3-line plan first, mapping each step to a verification check:
     1. `[Step]` → verify: `[Check]`
     2. `[Step]` → verify: `[Check]`
     3. `[Step]` → verify: `[Check]`
   - For vague requests (e.g. "make it work"), define success in terms of passing tests or checkable criteria first.
3. **GATE 3 — MINIMUM VIABLE CHANGE**:
   - Write the simplest code that solves the problem. Do not touch code outside the task boundaries.
   - If you find unrelated dead code, mention it in your response, but do not delete or refactor it unless asked.
4. **GATE 4 — VERIFY**:
   - Define exact success criteria before starting. Proceed only when done-ness can be validated mechanically.

---

## Token & Context Efficiency

Optimize context window usage and tokens by following these rules:

### Context Loading (Input)
- **Prefer targeted reads** over reading entire large files. Use regex/grep to find symbols or functions first, then read the matching range (e.g., ±20 lines around the match).
- **Never load lock files** (e.g., `package-lock.json`, `pnpm-lock.yaml`, `poetry.lock`, `go.sum`) or generated build folders unless explicitly instructed to debug dependency trees.
- **Lazy load context**: Read only what is needed as the task unfolds. Do not read every file in the directory upfront.

### Output Formatting
- **Conciseness First**: Use tables, code blocks, and bullet points over long prose paragraphs.
- **Summaries**: Summarize code changes by listing *what* changed and *where* (file:line), rather than pasting huge chunks of unaltered code.
- **Keep it factual**:
  - Do not repeat the user's question back.
  - Do not narrate your reasoning unless explicitly asked.
  - Keep diagnostic error descriptions to a single line: `file:line | exact error | fix`.

---

## AI Anti-Patterns (Must Avoid)
- **No Mocking/Placeholders**: Never write comments like `// TODO: Implement later` or use mock values where actual operational logic is required.
- **No Silent Failures**: Never wrap blocks in `try-catch` structures that swallow errors without logging or re-throwing them.
- **No Workspace Pollution**: Do not leave backup files (e.g., `.bak`, `.tmp`) or untracked test scripts in the workspace after task completion. Clean up after yourself.
- **No Arbitrary Refactoring**: Avoid rewriting style, structure, or formatting of existing code unless explicitly requested or necessary to achieve the target behavior.

---

## Security & Credentials Safety

- **No Hardcoded Secrets**: Never hardcode API keys, tokens, passwords, database credentials, or private certificates. Always retrieve them from environment variables, configuration files, or secret managers.
- **Snyk SAST & Dependency Scans**: 
  - Before concluding any task that adds, modifies, or deletes first-party code, run a Snyk code scan (`snyk_code_scan` or equivalent SAST check) on the modified directories.
  - Fix any warnings or security issues discovered during the scan before declaring the task complete.
- **Dependency Minimization**: Avoid introducing external libraries unless absolutely necessary. Rely on language-native APIs first. If a dependency is required, use the package manager native to this codebase.

---

## Architecture & Implementation Strategy

1. **Understand Before Modifying**: Trace the code execution paths using search tools to understand dependency trees and function lifecycles before changing files.
2. **Error Handling & Resilience**:
   - Never suppress or catch exceptions silently. Always log errors with descriptive context and appropriate severity levels (e.g., `ERROR`, `WARNING`).
   - Implement fail-safes and cleanup blocks (e.g., `finally` to close DB connections, file streams, or release locks).
3. **API & Interface Design**:
   - Design clean, cohesive interfaces. 
   - Maintain API backward compatibility unless a breaking change is explicitly authorized.

---

## Verification & Language-Agnostic Validation

Always run the appropriate build, validation, or compiler commands based on the codebase language before declaring a task complete:

| Technology | Syntax/Build Check | Formatting/Linting | Testing |
|:---|:---|:---|:---|
| **Node.js (JS)** | `node -c src/index.js` | `eslint .` | `npm test` / `jest` |
| **TypeScript** | `tsc --noEmit` | `eslint .` | `npm test` / `jest` |
| **Python** | `python -m py_compile main.py` | `flake8` / `black` | `pytest` |
| **Go** | `go build ./...` | `go fmt` / `golangci-lint` | `go test ./...` |
| **Rust** | `cargo check` | `cargo fmt --check` / `cargo clippy` | `cargo test` |

---

## Proposing Changes & Version Control

- **Staging / No-Commit Merges**:
  - Prepare all changes in the working tree and staging area (`git add`) without committing. This allows the human developer to review the final diff.
- **Commit Format**:
  - If requested to commit, follow the [Conventional Commits](https://www.conventionalcommits.org/) format (e.g., `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`).
