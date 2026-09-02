<!--
Thanks for contributing. Fill in the sections below and delete anything
that does not apply. The checklist mirrors CONTRIBUTING.md — if the two
ever disagree, CONTRIBUTING.md is the one that counts.
-->

## What changed

<!-- One or two sentences in plain English. What is different after this PR? -->

## Why

<!-- What problem does this solve? Link an issue if there is one. -->

## Type of change

- [ ] Documentation (new guide, correction, clarification)
- [ ] Script or CLI change (`scripts/`, `bin/`, `hooks/`)
- [ ] CI or tooling change (`.github/`, `package.json`)
- [ ] Explorer change (`design/src/` — bundle regenerated)

## How to verify

<!--
Give the exact commands a reviewer can run. Example:

    npm test
    npm run lint:docs
    npm run check:toolchain
-->

## Checklist

- [ ] `npm test` passes (no install step required)
- [ ] `npm run lint:docs` passes (doc-coherence gate)
- [ ] `npm run check:toolchain` passes (Node baseline and pinned CI tools)
- [ ] New or changed behaviour in `scripts/`, `bin/` or `hooks/` has a test in `test/`
- [ ] Any new command is given for macOS/Linux **and** Windows (PowerShell)
- [ ] Mermaid diagrams render in the GitHub preview
- [ ] A new document is linked from the README table and from `index.html`
- [ ] `design/cookbook-explorer.html` was regenerated with `npm run build:explorer` (only if `design/src/` changed)
- [ ] No `<!-- placeholder -->` text left behind
