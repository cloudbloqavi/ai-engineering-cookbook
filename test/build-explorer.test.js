/**
 * Unit tests for scripts/build-explorer.js.
 *
 * The explorer bundle is a CI gate: the "Build Explorer" job rebuilds it and
 * fails the PR when the committed file differs. These tests pin the behaviour
 * that gate depends on — deterministic output, correct inlining, and loud
 * failures on bad input — using throwaway fixtures, never the real design/ dir.
 *
 * Run: npm test   (uses node:test, built into Node 18+; no dependencies)
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { build } = require("../scripts/build-explorer.js");

/** Create a temp directory holding a host page plus the given jsx files. */
function makeFixture(hostHtml, jsxFiles) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "explorer-fixture-"));
  const hostPath = path.join(dir, "host.html");
  fs.writeFileSync(hostPath, hostHtml);
  for (const [name, contents] of Object.entries(jsxFiles)) {
    fs.writeFileSync(path.join(dir, name), contents);
  }
  test.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return hostPath;
}

const HOST_WITH_TWO_TAGS = [
  "<html><body>",
  '<script type="text/babel" src="one.jsx"></script>',
  '<script type="text/babel" src="two.jsx"></script>',
  "</body></html>",
].join("\n");

test("inlines each referenced jsx file in document order", () => {
  const host = makeFixture(HOST_WITH_TWO_TAGS, {
    "one.jsx": "const ONE = 1;\n",
    "two.jsx": "const TWO = 2;\n",
  });

  const out = build(host);

  assert.match(out, /data-bundled-from="one\.jsx"/);
  assert.match(out, /data-bundled-from="two\.jsx"/);
  assert.ok(out.includes("const ONE = 1;"), "first source is inlined");
  assert.ok(out.includes("const TWO = 2;"), "second source is inlined");
  assert.ok(
    out.indexOf("const ONE = 1;") < out.indexOf("const TWO = 2;"),
    "sources keep the order they appear in the host page",
  );
  assert.ok(!out.includes('src="one.jsx"'), "the original src tag is replaced");
});

test("is deterministic — same input produces byte-identical output", () => {
  const host = makeFixture(HOST_WITH_TWO_TAGS, {
    "one.jsx": "const ONE = 1;\n",
    "two.jsx": "const TWO = 2;\n",
  });

  assert.equal(build(host), build(host));
});

test("normalises the output to exactly one trailing newline", () => {
  const host = makeFixture(HOST_WITH_TWO_TAGS + "\n\n\n", {
    "one.jsx": "const ONE = 1;\n",
    "two.jsx": "const TWO = 2;\n",
  });

  const out = build(host);
  assert.ok(out.endsWith("</html>\n"), "ends with a single newline");
  assert.ok(!out.endsWith("\n\n"), "trailing blank lines are collapsed");
});

test("throws when the host page does not exist", () => {
  const missing = path.join(os.tmpdir(), "definitely-not-here-12345.html");
  assert.throws(() => build(missing), /host page missing/);
});

test("throws when a referenced jsx file is missing", () => {
  const host = makeFixture(HOST_WITH_TWO_TAGS, { "one.jsx": "const ONE = 1;\n" });
  assert.throws(() => build(host), /referenced source missing/);
});

test("throws when a source contains a literal </script (would corrupt the bundle)", () => {
  const host = makeFixture('<script type="text/babel" src="bad.jsx"></script>', {
    // Split so this test file itself stays safe to inline.
    "bad.jsx": 'const s = "</' + 'script>";\n',
  });
  assert.throws(() => build(host), /cannot be safely inlined/);
});

test("throws when the host page references no jsx sources at all", () => {
  const host = makeFixture("<html><body>nothing here</body></html>", {});
  assert.throws(() => build(host), /no <script type="text\/babel"/);
});

test("the committed bundle matches a fresh build of design/src", () => {
  const { build: buildReal, HOST_HTML, OUT_HTML } = require("../scripts/build-explorer.js");
  assert.equal(
    fs.readFileSync(OUT_HTML, "utf8"),
    buildReal(HOST_HTML),
    "design/cookbook-explorer.html is stale — run `npm run build:explorer` and commit it",
  );
});
