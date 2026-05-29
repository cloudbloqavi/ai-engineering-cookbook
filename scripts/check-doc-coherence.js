#!/usr/bin/env node
/**
 * check-doc-coherence
 *
 * Deterministic doc-coherence gate. Enforces the "pointers, not copies" rule
 * (CLAUDE.md §8): each canonical fact has ONE owning file; if its distinctive
 * marker text appears in any OTHER doc, that is drift — two docs defining the
 * same thing independently. No LLM, no network, no tokens — just substring
 * matching against a declared registry, so it is safe to run in CI.
 *
 * Usage:
 *   node scripts/check-doc-coherence.js [options]
 *
 * Options:
 *   --config <path>   Registry file. Default: ./coherence.config.json,
 *                     falling back to ./templates/coherence.config.json.
 *   --root <dir>      Repo root to scan. Default: cwd.
 *   --json            Emit machine-readable JSON instead of text.
 *   --quiet           Only print on failure.
 *   -h, --help        Show help.
 *
 * Exit codes: 0 = clean, 1 = drift/violations found, 2 = bad config/usage.
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
function flag(name) {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
}
const opts = {
  config: flag("--config"),
  root: path.resolve(flag("--root") || process.cwd()),
  json: args.includes("--json"),
  quiet: args.includes("--quiet"),
  help: args.includes("-h") || args.includes("--help"),
};

if (opts.help) {
  process.stdout.write(
    [
      "check-doc-coherence — enforce single-source-of-truth across markdown docs",
      "",
      "Usage: node scripts/check-doc-coherence.js [--config <path>] [--root <dir>] [--json] [--quiet]",
      "",
      "Exit codes: 0 clean | 1 drift found | 2 config/usage error",
    ].join("\n") + "\n",
  );
  process.exit(0);
}

// --- locate config ------------------------------------------------------
function resolveConfig() {
  if (opts.config) return path.resolve(opts.config);
  const candidates = [
    path.join(opts.root, "coherence.config.json"),
    path.join(opts.root, "templates", "coherence.config.json"),
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[0];
}
const configPath = resolveConfig();
if (!fs.existsSync(configPath)) {
  process.stderr.write(`! config not found: ${configPath}\n`);
  process.exit(2);
}
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
  process.stderr.write(`! could not parse config ${configPath}: ${e.message}\n`);
  process.exit(2);
}

// --- glob → regex (supports ** and *) -----------------------------------
function globToRegExp(glob) {
  const norm = glob.replace(/\\/g, "/");
  let re = "";
  for (let i = 0; i < norm.length; i++) {
    const c = norm[i];
    if (c === "*") {
      if (norm[i + 1] === "*") {
        re += ".*";
        i++;
        if (norm[i + 1] === "/") i++;
      } else {
        re += "[^/]*";
      }
    } else if ("\\^$+?.()|{}[]".includes(c)) {
      re += "\\" + c;
    } else {
      re += c;
    }
  }
  return new RegExp("^" + re + "$");
}
function anyMatch(relPath, globs) {
  const norm = relPath.replace(/\\/g, "/");
  return (globs || []).some((g) => globToRegExp(g).test(norm));
}

// --- recursive markdown walk -------------------------------------------
function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(opts.root, full).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      if (anyMatch(rel + "/", config.ignore)) continue;
      walk(full, acc);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      if (anyMatch(rel, config.ignore)) continue;
      acc.push(rel);
    }
  }
  return acc;
}

// --- GitHub-style heading slug (emoji/punctuation-tolerant) -------------
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function headingSlugs(content) {
  const slugs = new Set();
  for (const line of content.split(/\r?\n/)) {
    const m = /^#{1,6}\s+(.*?)\s*#*$/.exec(line);
    if (m) slugs.add(slugify(m[1]));
  }
  return slugs;
}

// --- load all docs ------------------------------------------------------
const docPaths = walk(opts.root, []);
const docs = new Map();
for (const rel of docPaths) {
  docs.set(rel, fs.readFileSync(path.join(opts.root, rel), "utf8"));
}

// --- evaluate facts -----------------------------------------------------
const violations = [];
const configWarnings = [];

for (const fact of config.facts || []) {
  const [ownerFileRaw, ownerAnchor] = String(fact.owner || "").split("#");
  const ownerFile = ownerFileRaw.replace(/\\/g, "/");
  const ownerContent = docs.get(ownerFile);

  if (ownerContent === undefined) {
    configWarnings.push(`fact "${fact.id}": owner file not found or not scanned: ${ownerFile}`);
    continue;
  }
  if (ownerAnchor && !headingSlugs(ownerContent).has(ownerAnchor)) {
    configWarnings.push(
      `fact "${fact.id}": owner anchor #${ownerAnchor} has no matching heading in ${ownerFile}`,
    );
  }
  // self-check: every marker must exist in the owner (else registry is stale)
  for (const marker of fact.markers || []) {
    if (!ownerContent.includes(marker)) {
      configWarnings.push(
        `fact "${fact.id}": marker not found in owner ${ownerFile} (stale registry?): "${marker}"`,
      );
    }
  }

  const allow = new Set([ownerFile, ...(fact.allow || []).map((p) => p.replace(/\\/g, "/"))]);

  for (const [rel, content] of docs) {
    if (allow.has(rel)) continue;
    if (anyMatch(rel, config.generated)) continue; // generated output never "wins" — and never blamed
    const lines = content.split(/\r?\n/);
    for (const marker of fact.markers || []) {
      lines.forEach((line, idx) => {
        if (line.includes(marker)) {
          violations.push({
            factId: fact.id,
            owner: fact.owner,
            file: rel,
            line: idx + 1,
            marker,
          });
        }
      });
    }
  }
}

// --- report -------------------------------------------------------------
if (opts.json) {
  process.stdout.write(
    JSON.stringify({ ok: violations.length === 0, violations, configWarnings }, null, 2) + "\n",
  );
} else {
  if (configWarnings.length) {
    process.stdout.write("Registry warnings (fix coherence.config.json):\n");
    for (const w of configWarnings) process.stdout.write(`  ! ${w}\n`);
    process.stdout.write("\n");
  }
  if (violations.length) {
    process.stdout.write(`✗ doc-coherence: ${violations.length} drift violation(s) found.\n\n`);
    for (const v of violations) {
      process.stdout.write(`  ${v.file}:${v.line}\n`);
      process.stdout.write(`    fact "${v.factId}" is owned by ${v.owner}\n`);
      process.stdout.write(`    restated marker: "${v.marker}"\n`);
      process.stdout.write(`    → replace with a link to the owner, or add this file to the fact's "allow" list if intentional.\n\n`);
    }
  } else if (!opts.quiet) {
    process.stdout.write(`✓ doc-coherence: ${docs.size} docs scanned, ${(config.facts || []).length} facts, no drift.\n`);
  }
}

// config warnings are advisory (exit 0); real drift fails the gate
process.exit(violations.length ? 1 : 0);
