#!/usr/bin/env node
/**
 * install-prompt-optimizer
 *
 * Installs the Prompt Optimizer skill (an Agent Skills / SKILL.md open-standard
 * skill, https://agentskills.io) into any compatible agentic tool.
 *
 * For Claude Code, also installs the optional UserPromptSubmit "session-start
 * gate" hook that offers prompt optimization on the first substantive prompt
 * of every new session. Hooks are NOT part of the open standard, so this
 * piece is Claude Code–only.
 *
 * Usage:
 *   install-prompt-optimizer [options]
 *
 * Options:
 *   --tool <name>   Target tool: claude | cursor | roo | vscode | codex | antigravity | custom.
 *                   Default: claude.
 *   --target <dir>  With --tool custom, install SKILL.md under <dir>/<name>/.
 *   --user          Install to the tool's user-global config dir if supported.
 *                   (Claude Code: ~/.claude/. Cursor/Roo: not supported — project only.)
 *   --no-hook       Claude Code only: install the skill but skip the gate hook.
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
  noHook: args.includes("--no-hook"),
  force: args.includes("--force"),
  dryRun: args.includes("--dry-run"),
  help: args.includes("-h") || args.includes("--help"),
};

if (opts.help) {
  process.stdout.write(
    [
      "install-prompt-optimizer — install the Prompt Optimizer skill into your agentic tool",
      "",
      "Usage:",
      "  install-prompt-optimizer [options]",
      "",
      "Options:",
      "  --tool <name>   claude (default) | cursor | roo | vscode | codex | antigravity | custom",
      "  --target <dir>  Required with --tool custom. Skill lands at <dir>/prompt-optimizer/SKILL.md.",
      "  --user          Install to user-global dir if supported (claude, codex, antigravity, vscode).",
      "  --no-hook       Claude Code only: skill only; skip the session-start gate hook.",
      "  --force         Overwrite existing files.",
      "  --dry-run       Print planned actions; write nothing.",
      "  -h, --help      Show this help.",
      "",
      "Examples:",
      "  # Claude Code, project scope, with auto-gate (default)",
      "  install-prompt-optimizer",
      "",
      "  # Cursor",
      "  install-prompt-optimizer --tool cursor",
      "",
      "  # Roo Code",
      "  install-prompt-optimizer --tool roo",
      "",
      "  # Any tool that loads SKILL.md from a custom directory",
      "  install-prompt-optimizer \\",
      "      --tool custom --target ./my-skills",
      "",
    ].join("\n"),
  );
  process.exit(0);
}

const SKILL_NAME = "prompt-optimizer";
const PKG_ROOT = path.resolve(__dirname, "..");
const SKILL_SRC = path.join(PKG_ROOT, "skills", SKILL_NAME, "SKILL.md");
const HOOK_SRC = path.join(PKG_ROOT, "hooks", "prompt-optimizer-gate.js");

// --- Resolve target paths per tool --------------------------------------
const TOOL_PROFILES = {
  claude: {
    label: "Claude Code",
    skillsDirProject: ".claude/skills",
    skillsDirUser: path.join(os.homedir(), ".claude", "skills"),
    supportsUser: true,
    supportsHook: true,
    hooksDirProject: ".claude/hooks",
    hooksDirUser: path.join(os.homedir(), ".claude", "hooks"),
    settingsPathProject: ".claude/settings.json",
    settingsPathUser: path.join(os.homedir(), ".claude", "settings.json"),
  },
  cursor: { label: "Cursor", skillsDirProject: ".cursor/skills", supportsUser: false, supportsHook: false },
  roo: { label: "Roo Code", skillsDirProject: ".roo/skills", supportsUser: false, supportsHook: false },
  vscode: {
    label: "VS Code Copilot",
    skillsDirProject: ".github/skills",
    skillsDirUser:
      process.platform === "win32" && process.env.APPDATA
        ? path.join(process.env.APPDATA, "github-copilot", "skills")
        : path.join(os.homedir(), ".copilot", "skills"),
    supportsUser: true,
    supportsHook: false,
  },
  codex: {
    label: "OpenAI Codex",
    skillsDirProject: ".codex/skills",
    skillsDirUser: path.join(os.homedir(), ".codex", "skills"),
    supportsUser: true,
    supportsHook: false,
  },
  antigravity: {
    label: "Google Antigravity",
    skillsDirProject: ".agents/skills",
    skillsDirUser: path.join(os.homedir(), ".gemini", "antigravity", "skills"),
    supportsUser: true,
    supportsHook: false,
  },
  custom: { label: "Custom", supportsUser: false, supportsHook: false },
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

function installClaudeHook() {
  const hookDest = path.join(
    opts.user ? profile.hooksDirUser : path.resolve(process.cwd(), profile.hooksDirProject),
    "prompt-optimizer-gate.js",
  );
  const settingsPath = opts.user
    ? profile.settingsPathUser
    : path.resolve(process.cwd(), profile.settingsPathProject);

  copyFile(HOOK_SRC, hookDest, "gate hook");

  const command = opts.user
    ? `node ${path.join("~", ".claude", "hooks", "prompt-optimizer-gate.js")}`
    : "node .claude/hooks/prompt-optimizer-gate.js";
  const hookEntry = { type: "command", command };

  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    } catch (e) {
      log(`! could not parse existing settings.json: ${e.message}`);
      log("  resolve manually, then re-run.");
      process.exit(1);
    }
  }
  settings.hooks = settings.hooks || {};
  settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit || [];

  const alreadyRegistered = settings.hooks.UserPromptSubmit.some((group) =>
    (group.hooks || []).some(
      (h) => typeof h.command === "string" && h.command.includes("prompt-optimizer-gate.js"),
    ),
  );

  if (alreadyRegistered) {
    log(`- hook already registered in settings.json, skipping`);
    return;
  }

  settings.hooks.UserPromptSubmit.push({ hooks: [hookEntry] });

  if (opts.dryRun) {
    log(`${dry}would register UserPromptSubmit hook in ${settingsPath}`);
    return;
  }
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
  log(`✓ registered hook in ${settingsPath}`);
}

// --- Run ----------------------------------------------------------------
log(
  `Installing Prompt Optimizer for ${profile.label}${opts.user ? " (user-global)" : ""}${opts.dryRun ? " (dry-run)" : ""}`,
);

copyFile(SKILL_SRC, SKILL_DEST, "skill");

if (profile.supportsHook && !opts.noHook) {
  installClaudeHook();
} else if (profile.supportsHook && opts.noHook) {
  log("- skipping gate hook (--no-hook)");
} else if (opts.tool !== "custom") {
  log(`- gate hook is Claude Code–only; ${profile.label} will use the skill via manual invocation.`);
}

log("");
log("Done. Next steps:");
if (opts.tool === "claude") {
  log("  1. Restart Claude Code (or open a new session) so settings.json reloads.");
  log("  2. Try `/prompt-optimizer` to verify the skill is registered.");
  if (!opts.noHook) {
    log("  3. Start a new session with a prompt > 30 chars — the gate should ask if you want to optimize.");
  }
} else {
  log(`  1. Restart ${profile.label} so it picks up the new skill.`);
  log(`  2. Invoke the skill by asking your agent to "use the prompt-optimizer skill on this: ..."`);
}
