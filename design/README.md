# Design — Interactive Cookbook Explorer

An interactive, single-page visual companion to this cookbook. Surfaces the two-phase SDLC, the five principles, the three workflow paths, the TDD loop, the multi-agent pod, the verification gates, the twenty curated extensions, and the learning flywheel — all linked to the source files in this repo (`docs/`, `.ai/config/`, `postmortems/`).

## Files

| File | Purpose |
| :--- | :--- |
| `cookbook-explorer.html` | **Standalone bundle** — a single self-contained HTML file (≈1.5 MB). Open it directly in any browser, host on GitHub Pages, or attach to a release. No build step. |
| `src/` | Editable source — split into `cookbook-data.jsx` (content), `cookbook-sections.jsx` (masthead, SDLC diagram, principles, walkthrough, TDD loop), `cookbook-app.jsx` (pod, gates, extensions, flywheel, app shell), `tweaks-panel.jsx` (in-page controls), and the host HTML. |

## How to view

```bash
# Just open the bundle
open design/cookbook-explorer.html
```

## How to publish on GitHub Pages

1. Settings → Pages → Source: `Deploy from a branch`
2. Branch: `main`, folder: `/ (root)` (or wherever you place this folder)
3. Link directly to `/<repo>/design/cookbook-explorer.html`

## How to edit

Edit any file in `design/src/`, then re-bundle (single-command CDN-free build) — or just keep editing the standalone HTML if minor.

## What's in the explorer

| Section | Source |
| :--- | :--- |
| Two-phase SDLC diagram | `README.md` (visual workflow) |
| Five principles | `README.md` + `CLAUDE.md` |
| Greenfield / Brownfield / Bug fix walkthroughs | `docs/greenfield.md`, `docs/brownfield.md`, `CLAUDE.md` |
| TDD loop (RED → GREEN → REFACTOR) | `CLAUDE.md §3`, `docs/greenfield.md` |
| Multi-agent pod (Planner/Orchestrator/Coder/Reviewer/Verifier) | `.ai/config/AGENT_PROFILE_ROLES.md` |
| Four verification gates | `.ai/config/VERIFICATION_AND_EVAL_GUIDE.md` |
| Twenty curated extensions | `docs/extensions.md` |
| Continuous improvement flywheel | `docs/governance.md` |
| Sample postmortem | `postmortems/POSTMORTEM_AND_LEARNING_LOG.md` |

## Tweaks

The explorer ships with an in-page Tweaks panel (toggle from the toolbar) for:

- Theme: Paper / Dark
- Accent color (5 curated swatches)
- Workflow path (Greenfield / Brownfield / Bug fix)
- Paper grain on/off
