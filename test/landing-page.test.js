/**
 * Unit tests for index.html — the GitHub Pages landing page.
 *
 * The landing page is the first thing a new reader sees, and it is the one
 * file in this repo that nothing else validates: markdownlint does not read
 * HTML, and the link checker only walks Markdown. So a guide can be renamed
 * or added and the landing page silently rots — a dead link on the front door,
 * or a new guide nobody can find.
 *
 * These tests close both directions of that gap:
 *   1. every link on the page resolves to a file that exists here, and
 *   2. every guide in docs/ is actually linked from the page.
 *
 * Run: npm test   (uses node:test, built into Node 22+; no dependencies)
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..");
const PAGE = path.join(REPO_ROOT, "index.html");
const REPO_SLUG = "exponen-agi/ai-engineering-cookbook";
const BLOB_PREFIX = `https://github.com/${REPO_SLUG}/blob/main/`;

const html = fs.readFileSync(PAGE, "utf8");

/** Every href on the page, in document order, including duplicates. */
function hrefs() {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
}

/**
 * The repo-relative path a link points at, or null if the link targets
 * something outside the repository (an issue tracker, another site).
 */
function repoPathFor(href) {
  if (href.startsWith(BLOB_PREFIX)) return href.slice(BLOB_PREFIX.length);
  if (href.startsWith("./")) return href.slice(2);
  return null;
}

test("the landing page exists and declares itself an HTML document", () => {
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<title>AI Engineering Cookbook<\/title>/);
});

test("every link points at a file that exists in this repo", () => {
  const missing = [];

  for (const href of hrefs()) {
    const rel = repoPathFor(href);
    if (rel === null) continue;
    // A link to a file must not carry a query or fragment we cannot resolve.
    const clean = rel.split("#")[0];
    if (!fs.existsSync(path.join(REPO_ROOT, ...clean.split("/")))) {
      missing.push(`${href} → ${clean}`);
    }
  }

  assert.deepEqual(missing, [], `index.html links to files that do not exist:\n${missing.join("\n")}`);
});

test("every guide in docs/ is linked from the landing page", () => {
  const linked = new Set(
    hrefs()
      .map(repoPathFor)
      .filter((p) => p !== null)
      .map((p) => p.split("#")[0]),
  );

  const orphans = fs
    .readdirSync(path.join(REPO_ROOT, "docs"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => `docs/${f}`)
    .filter((rel) => !linked.has(rel));

  assert.deepEqual(
    orphans,
    [],
    `these guides exist but nothing on the landing page links to them:\n${orphans.join("\n")}\n` +
      "Add a card for each, or the page stops being a complete index.",
  );
});

test("the top-level documents a newcomer needs are all linked", () => {
  const linked = new Set(
    hrefs()
      .map(repoPathFor)
      .filter((p) => p !== null),
  );

  for (const required of ["QUICKSTART.md", "GLOSSARY.md", "CONTRIBUTING.md", "SECURITY.md", "LICENSE", "AGENTS.md"]) {
    assert.ok(linked.has(required), `index.html must link to ${required}`);
  }
});

test("the interactive explorer is linked by a relative path, not a blob URL", () => {
  // The explorer is real HTML that GitHub Pages serves and renders. A blob URL
  // would show its source instead, which is not what a reader wants.
  assert.ok(
    hrefs().includes("./design/cookbook-explorer.html"),
    "the explorer must be linked relatively so Pages renders it",
  );
  assert.ok(
    !hrefs().some((h) => h.includes("blob/main/design/cookbook-explorer.html")),
    "linking the explorer as a blob URL would show its source, not the app",
  );
});

test("guides are linked on the main branch of the right repository", () => {
  const wrong = hrefs().filter(
    (h) => h.startsWith("https://github.com/") && !h.startsWith(`https://github.com/${REPO_SLUG}`),
  );
  assert.deepEqual(wrong, [], `these links point at a different repository:\n${wrong.join("\n")}`);
});

test("the page loads no external resources", () => {
  // Self-contained on purpose: it must render identically offline, behind a
  // corporate proxy, and on a slow connection. A stray CDN font or script
  // would quietly break that promise.
  assert.ok(!/<script/i.test(html), "the landing page must not include scripts");
  assert.ok(!/<link[^>]+rel="stylesheet"/i.test(html), "styles must be inline, not fetched");
  assert.ok(!/@import/i.test(html), "CSS must not @import an external sheet");
  assert.ok(!/<img[^>]+src="https?:/i.test(html), "images must not be fetched from another host");
});

test("the page states the Node baseline the package actually requires", () => {
  // The landing page tells readers what they need before they run anything.
  // If engines.node moves and this sentence does not, the front page lies.
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  const major = /(\d+)/.exec(pkg.engines.node)[1];
  assert.match(
    html,
    new RegExp(`Node\\.js ${major} or newer`),
    `index.html must say "Node.js ${major} or newer" to match package.json engines`,
  );
});

test("the page is responsive and theme-aware", () => {
  assert.match(html, /<meta name="viewport" content="width=device-width/);
  assert.match(html, /prefers-color-scheme: dark/, "must not force a light theme on a dark-mode reader");
});
