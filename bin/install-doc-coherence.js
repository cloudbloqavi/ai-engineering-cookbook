#!/usr/bin/env node
/**
 * install-doc-coherence
 *
 * Installs the Doc Coherence skill (an Agent Skills / SKILL.md open-standard
 * skill, https://agentskills.io) into any compatible agentic tool, plus the
 * deterministic gate that makes it enforceable: the checker script and a
 * starter registry (coherence.config.json).
 *
 * The skill teaches an agent to keep a docs corpus coherent (single source of
 * truth — "pointers, not copies"). The gate (scripts/check-doc-coherence.js +
 * coherence.config.json) lets CI fail a PR when a doc restates a fact owned by
 * another doc. There is NO session-start hook for this skill.
 *
 * Usage:
 *   install-doc-coherence [options]
 *
 * Options:
 *   --tool <name>   Target tool: claude | cursor | roo | vscode | codex | antigravity | custom.
 *                   Default: claude. (Controls only where SKILL.md lands.)
 *   --target <dir>  With --tool custom, install SKILL.md under <dir>/doc-coherence/.
 *   --user          Install the SKILL.md to the tool's user-global config dir if
 *                   supported. The gate (script + config) is always project-scoped.
 *   --skill-only    Install only SKILL.md; skip the checker script and registry.
 *   --with-ci       Also drop a GitHub Actions workflow at
 *                   .github/workflows/doc-coherence.yml.
 *   --force         Overwrite existing files.
 *   --dry-run       Print planned actions; write nothing.
 *   -h, --help      Show help.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const args = process.argv.slice(2);
function flagValue(name) {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
}

const opts = {
  tool: (flagValue("--tool") || "claude").toLowerCase(),
  target: flagValue("--target"),
  user: args.includes("--user"),
  skillOnly: args.includes("--skill-only"),
  withCi: args.includes("--with-ci"),
  force: args.includes("--force"),
  dryRun: args.includes("--dry-run"),
  help: args.includes("-h") || args.includes("--help"),
};

if (opts.help) {
  process.stdout.write(
    [
      "install-doc-coherence — install the Doc Coherence skill + single-source-of-truth gate",
      "",
      "Usage:",
      "  install-doc-coherence [options]",
      "",
      "Options:",
      "  --tool <name>   claude (default) | cursor | roo | vscode | codex | antigravity | custom",
      "  --target <dir>  Required with --tool custom. Skill lands at <dir>/doc-coherence/SKILL.md.",
      "  --user          Install SKILL.md to user-global dir if supported. Gate stays project-scoped.",
      "  --skill-only    Install only SKILL.md; skip checker script + registry.",
      "  --with-ci       Also write .github/workflows/doc-coherence.yml.",
      "  --force         Overwrite existing files.",
      "  --dry-run       Print planned actions; write nothing.",
      "  -h, --help      Show this help.",
      "",
      "Examples:",
      "  # Claude Code, project scope, with skill + gate (default)",
      "  install-doc-coherence",
      "",
      "  # Skill + gate + CI workflow",
      "  install-doc-coherence --with-ci",
      "",
      "  # Just the skill for Cursor, no gate tooling",
      "  install-doc-coherence --tool cursor --skill-only",
      "",
    ].join("\n"),
  );
  process.exit(0);
}

const SKILL_NAME = "doc-coherence";
const PKG_ROOT = path.resolve(__dirname, "..");
const SKILL_SRC = path.join(PKG_ROOT, "skills", SKILL_NAME, "SKILL.md");
const CHECKER_SRC = path.join(PKG_ROOT, "scripts", "check-doc-coherence.js");
const CONFIG_SRC = path.join(PKG_ROOT, "templates", "coherence.config.json");
const WORKFLOW_SRC = path.join(PKG_ROOT, ".github", "workflows", "doc-coherence.yml");

// --- Resolve target paths per tool --------------------------------------
const TOOL_PROFILES = {
  claude: {
    label: "Claude Code",
    skillsDirProject: ".claude/skills",
    skillsDirUser: path.join(os.homedir(), ".claude", "skills"),
    supportsUser: true,
  },
  cursor: { label: "Cursor", skillsDirProject: ".cursor/skills", supportsUser: false },
  roo: { label: "Roo Code", skillsDirProject: ".roo/skills", supportsUser: false },
  vscode: {
    label: "VS Code Copilot",
    skillsDirProject: ".github/skills",
    skillsDirUser:
      process.platform === "win32" && process.env.APPDATA
        ? path.join(process.env.APPDATA, "github-copilot", "skills")
        : path.join(os.homedir(), ".copilot", "skills"),
    supportsUser: true,
  },
  codex: {
    label: "OpenAI Codex",
    skillsDirProject: ".codex/skills",
    skillsDirUser: path.join(os.homedir(), ".codex", "skills"),
    supportsUser: true,
  },
  antigravity: {
    label: "Google Antigravity",
    skillsDirProject: ".agents/skills",
    skillsDirUser: path.join(os.homedir(), ".gemini", "antigravity", "skills"),
    supportsUser: true,
  },
  custom: { label: "Custom", supportsUser: false },
};

const profile = TOOL_PROFILES[opts.tool];
if (!profile) {
  process.stderr.write(`! unknown --tool "${opts.tool}". Known: ${Object.keys(TOOL_PROFILES).join(", ")}\n`);
  process.exit(2);
}
if (opts.tool === "custom" && !opts.target) {
  process.stderr.write("! --tool custom requires --target <dir>\n");
  process.exit(2);
}
if (opts.user && !profile.supportsUser) {
  process.stderr.write(`! --user is not supported for ${profile.label} (project-scoped only)\n`);
  process.exit(2);
}

const skillsBase =
  opts.tool === "custom"
    ? path.resolve(opts.target)
    : opts.user
      ? profile.skillsDirUser
      : path.resolve(process.cwd(), profile.skillsDirProject);

const SKILL_DEST = path.join(skillsBase, SKILL_NAME, "SKILL.md");
const cwd = process.cwd();
const CHECKER_DEST = path.join(cwd, "scripts", "check-doc-coherence.js");
const CONFIG_DEST = path.join(cwd, "coherence.config.json");
const WORKFLOW_DEST = path.join(cwd, ".github", "workflows", "doc-coherence.yml");

// --- Helpers ------------------------------------------------------------
const log = (msg) => process.stdout.write(msg + "\n");
const dry = opts.dryRun ? "[dry-run] " : "";

function copyFile(src, dest, label) {
  if (!fs.existsSync(src)) {
    log(`! source missing: ${src}`);
    process.exit(1);
  }
  if (fs.existsSync(dest) && !opts.force) {
    log(`- ${label} already exists, skipping (use --force to overwrite): ${dest}`);
    return false;
  }
  if (opts.dryRun) {
    log(`${dry}would write ${label} → ${dest}`);
    return true;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  log(`✓ installed ${label} → ${dest}`);
  return true;
}

// --- Run ----------------------------------------------------------------
log(
  `Installing Doc Coherence for ${profile.label}${opts.user ? " (user-global skill)" : ""}${opts.dryRun ? " (dry-run)" : ""}`,
);

copyFile(SKILL_SRC, SKILL_DEST, "skill");

if (!opts.skillOnly) {
  copyFile(CHECKER_SRC, CHECKER_DEST, "checker script");
  // seed the registry at the repo root; never clobber an existing one without --force
  copyFile(CONFIG_SRC, CONFIG_DEST, "starter registry (coherence.config.json)");
} else {
  log("- skipping gate tooling (--skill-only)");
}

if (opts.withCi) {
  copyFile(WORKFLOW_SRC, WORKFLOW_DEST, "CI workflow");
}

log("");
log("Done. Next steps:");
if (opts.tool === "claude") {
  log("  1. Restart Claude Code (or open a new session) so the skill registers.");
  log("  2. Try `/doc-coherence` (or ask the agent to use the doc-coherence skill).");
} else {
  log(`  1. Restart ${profile.label} so it picks up the new skill.`);
  log(`  2. Ask your agent to "use the doc-coherence skill to audit our docs".`);
}
if (!opts.skillOnly) {
  log("  3. Edit coherence.config.json — declare the canonical owner of each fact/term.");
  log("  4. Run the gate:  node scripts/check-doc-coherence.js");
}
