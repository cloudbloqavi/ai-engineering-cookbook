#!/usr/bin/env node
/**
 * build-explorer
 *
 * Bundles the interactive Cookbook Explorer from its editable source in
 * `design/src/` into the single self-contained file `design/cookbook-explorer.html`.
 *
 * The host page (`design/src/AI Engineering Cookbook.html`) loads four JSX files
 * via `<script type="text/babel" src="...">`. This builder inlines each of those
 * files in document order so the result is one portable HTML file (React + Babel
 * are still loaded from their CDN, exactly as the host page declares them).
 *
 * The build is deterministic: same source in → byte-identical HTML out. CI relies
 * on that to detect drift (rebuild + `git diff --exit-code`). There are no
 * dependencies — plain Node, no bundler, no network.
 *
 * Usage:
 *   node scripts/build-explorer.js            # write the bundle
 *   node scripts/build-explorer.js --check    # build in memory; exit 1 if the
 *                                             # committed bundle is stale
 */

const fs = require("fs");
const path = require("path");

const DESIGN_DIR = path.resolve(__dirname, "..", "design");
const SRC_DIR = path.join(DESIGN_DIR, "src");
const HOST_HTML = path.join(SRC_DIR, "AI Engineering Cookbook.html");
const OUT_HTML = path.join(DESIGN_DIR, "cookbook-explorer.html");

const SCRIPT_TAG_RE =
  /<script type="text\/babel" src="([^"]+\.jsx)"><\/script>/g;

/**
 * Inline every `<script type="text/babel" src="*.jsx">` tag of a host page.
 *
 * @param {string} [hostHtml] Absolute path to the host page. Defaults to the
 *   repo's own explorer source, so callers (and the CLI) need no arguments.
 * @param {string} [srcDir] Directory the `src="..."` names resolve against.
 *   Defaults to the directory holding `hostHtml`.
 * @returns {string} The bundled HTML, always ending in exactly one newline.
 */
function build(hostHtml = HOST_HTML, srcDir = path.dirname(hostHtml)) {
  if (!fs.existsSync(hostHtml)) {
    throw new Error(`host page missing: ${hostHtml}`);
  }

  let inlinedCount = 0;
  const html = fs.readFileSync(hostHtml, "utf8").replace(
    SCRIPT_TAG_RE,
    (_match, jsxName) => {
      const jsxPath = path.join(srcDir, jsxName);
      if (!fs.existsSync(jsxPath)) {
        throw new Error(`referenced source missing: ${jsxPath}`);
      }
      const code = fs.readFileSync(jsxPath, "utf8");
      if (/<\/script/i.test(code)) {
        // Inlining a literal </script> would terminate the block early and
        // corrupt the bundle. Fail loudly instead of shipping broken HTML.
        throw new Error(
          `${jsxName} contains a literal "</script" which cannot be safely inlined`,
        );
      }
      inlinedCount += 1;
      return [
        `<script type="text/babel" data-bundled-from="${jsxName}">`,
        code.replace(/\n$/, ""),
        `</script>`,
      ].join("\n");
    },
  );

  if (inlinedCount === 0) {
    throw new Error("no <script type=\"text/babel\" src=\"*.jsx\"> tags found in host page");
  }

  // Normalise to a single trailing newline so output is stable across platforms.
  return html.replace(/\n*$/, "\n");
}

function main() {
  const check = process.argv.includes("--check");
  const out = build();

  if (check) {
    const current = fs.existsSync(OUT_HTML) ? fs.readFileSync(OUT_HTML, "utf8") : "";
    if (current !== out) {
      process.stderr.write(
        "✗ design/cookbook-explorer.html is out of date.\n" +
          "  Run `npm run build:explorer` and commit the result.\n",
      );
      process.exit(1);
    }
    process.stdout.write("✓ design/cookbook-explorer.html is up to date\n");
    return;
  }

  fs.writeFileSync(OUT_HTML, out);
  process.stdout.write(
    `✓ built ${path.relative(path.resolve(__dirname, ".."), OUT_HTML)} (${out.length} bytes)\n`,
  );
}

// Only run the CLI when invoked directly, so unit tests can `require()` this
// file and exercise `build()` against fixtures without writing the bundle.
if (require.main === module) {
  main();
}

module.exports = { build, HOST_HTML, SRC_DIR, OUT_HTML };
