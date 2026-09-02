/**
 * Unit tests for scripts/check-toolchain.js.
 *
 * The toolchain gate is a CI job: it fails the PR when the Node baseline, the
 * `.nvmrc`, the CI matrices and the docs stop agreeing, or when a version pin
 * is dropped from a `npm install -g` step. That makes its *false negatives*
 * the expensive failure — a gate that quietly passes on broken input is worse
 * than no gate — so most of these tests feed it deliberately broken fixtures
 * and assert it complains about the right thing.
 *
 * Fixtures are throwaway temp directories. The one exception is the last
 * block, which runs the gate against this repository, because "the repo it
 * ships in is clean" is exactly the promise CI makes.
 *
 * Run: npm test   (uses node:test, built into Node 22+; no dependencies)
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  checkToolchain,
  parseEnginesMajor,
  parseNvmrcMajor,
  resolveWorkflowEnv,
  parseWorkflowNodeVersions,
  parseGlobalInstalls,
  parseNodeClaims,
  NODE_EOL,
} = require("../scripts/check-toolchain.js");

const REPO_ROOT = path.resolve(__dirname, "..");

/**
 * Build a throwaway repo. `files` maps a repo-relative path (POSIX-style, for
 * readability) to its contents; parent directories are created as needed.
 */
function makeRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "toolchain-fixture-"));
  for (const [rel, contents] of Object.entries(files)) {
    const full = path.join(dir, ...rel.split("/"));
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, contents);
  }
  test.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

/** The smallest repo that passes every check, as a base to break one thing at a time. */
function healthyRepo(overrides = {}) {
  return makeRepo({
    "package.json": JSON.stringify({ name: "x", engines: { node: ">=22" } }),
    ".nvmrc": "24\n",
    ".github/workflows/ci.yml": [
      "env:",
      '  CSPELL_VERSION: "10.2.0"',
      "jobs:",
      "  a:",
      "    steps:",
      "      - uses: actions/setup-node@v4",
      "        with:",
      '          node-version: "24"',
      "      - run: npm install -g cspell@${{ env.CSPELL_VERSION }}",
    ].join("\n"),
    "README.md": "# x\n\nRequires **Node.js 22+**.\n",
    ...overrides,
  });
}

/** Assert that exactly one error mentions `needle`, and return it. */
function oneErrorMatching(result, needle) {
  const hits = result.errors.filter((e) => e.includes(needle));
  assert.equal(
    hits.length,
    1,
    `expected exactly one error mentioning "${needle}", got:\n${result.errors.join("\n")}`,
  );
  return hits[0];
}

// --- parsers ------------------------------------------------------------

test("parseEnginesMajor reads every range form npm accepts", () => {
  assert.equal(parseEnginesMajor(">=22"), 22);
  assert.equal(parseEnginesMajor(">= 22.0.0"), 22);
  assert.equal(parseEnginesMajor("^24"), 24);
  assert.equal(parseEnginesMajor("24.x"), 24);
  assert.equal(parseEnginesMajor("22"), 22);
});

test("parseEnginesMajor returns null rather than guessing", () => {
  assert.equal(parseEnginesMajor("latest"), null);
  assert.equal(parseEnginesMajor(""), null);
  assert.equal(parseEnginesMajor(undefined), null);
  assert.equal(parseEnginesMajor(22), null);
});

test("parseNvmrcMajor ignores comments, blanks and a leading v", () => {
  assert.equal(parseNvmrcMajor("24\n"), 24);
  assert.equal(parseNvmrcMajor("v24.3.0\n"), 24);
  assert.equal(parseNvmrcMajor("# use LTS\n\n  22  \n"), 22);
  assert.equal(parseNvmrcMajor("# nothing here\n"), null);
});

test("resolveWorkflowEnv substitutes top-level env references", () => {
  const yaml = [
    "env:",
    '  CSPELL_VERSION: "10.2.0"',
    "  NODE_DEFAULT: 24  # trailing comment",
    "jobs:",
    "  a:",
    "    steps:",
    "      - run: npm install -g cspell@${{ env.CSPELL_VERSION }}",
    "      - uses: x",
    "        with:",
    "          node-version: ${{ env.NODE_DEFAULT }}",
  ].join("\n");

  const out = resolveWorkflowEnv(yaml);
  assert.match(out, /npm install -g cspell@10\.2\.0/);
  assert.match(out, /node-version: 24/);
});

test("resolveWorkflowEnv leaves unknown references untouched", () => {
  // A job-level env or a repo secret is not resolvable here. Leaving the
  // literal in place is correct: the pin check then reports it, which is the
  // safe direction to be wrong in.
  const out = resolveWorkflowEnv("jobs:\n  a:\n    steps:\n      - run: npm i -g x@${{ env.NOPE }}\n");
  assert.match(out, /\$\{\{\s*env\.NOPE\s*\}\}/);
});

test("resolveWorkflowEnv stops at the end of the top-level env block", () => {
  const yaml = ["env:", '  A: "1.0.0"', "", "  # still in the block", '  B: "2.0.0"', "jobs:", '  C: "3.0.0"'].join(
    "\n",
  );
  const out = resolveWorkflowEnv(
    yaml + "\n      - run: npm i -g a@${{ env.A }} b@${{ env.B }} c@${{ env.C }}\n",
  );
  assert.match(out, /a@1\.0\.0/);
  assert.match(out, /b@2\.0\.0/, "blank lines and comments must not end the block");
  assert.match(out, /c@\$\{\{\s*env\.C\s*\}\}/, "a key nested under jobs: is not a top-level env var");
});

test("parseWorkflowNodeVersions reads both the single and matrix forms", () => {
  const yaml = [
    "        node: [\"22\", \"24\"]",
    "          node-version: '20'",
    "          node-version: 18",
  ].join("\n");
  assert.deepEqual(parseWorkflowNodeVersions(yaml), [20, 18, 22, 24]);
});

test("parseWorkflowNodeVersions skips a matrix indirection", () => {
  // `node-version: ${{ matrix.node }}` carries no version of its own; the
  // matrix line it points at is checked separately. Counting it would either
  // crash or invent a number.
  const yaml = "          node-version: ${{ matrix.node }}\n        node: [\"22\"]\n";
  assert.deepEqual(parseWorkflowNodeVersions(yaml), [22]);
});

test("parseGlobalInstalls distinguishes a pinned install from a floating one", () => {
  const yaml = [
    "      - run: npm install -g markdownlint-cli@0.49.1",
    "      - run: npm i --global cspell",
    "      - run: npm install -g @scope/pkg@1.2.3",
    "      - run: npm install -g a@1.2.3 b@2.0.0",
  ].join("\n");

  assert.deepEqual(parseGlobalInstalls(yaml), [
    { spec: "markdownlint-cli@0.49.1", pinned: true },
    { spec: "cspell", pinned: false },
    { spec: "@scope/pkg@1.2.3", pinned: true },
    { spec: "a@1.2.3", pinned: true },
    { spec: "b@2.0.0", pinned: true },
  ]);
});

test("parseGlobalInstalls rejects a range as a pin", () => {
  // "^1.2.3" and "latest" both let CI resolve a different build tomorrow,
  // which is the exact failure this gate exists to prevent.
  const found = parseGlobalInstalls("      - run: npm install -g a@^1.2.3 b@latest c@1.2\n");
  assert.deepEqual(
    found.map((f) => f.pinned),
    [false, false, false],
  );
});

test("parseGlobalInstalls ignores flags and a local install", () => {
  const yaml = [
    "      - run: npm install -g --no-audit cspell@10.2.0",
    "      - run: npm install markdownlint-cli", // local, not global
  ].join("\n");
  assert.deepEqual(parseGlobalInstalls(yaml), [{ spec: "cspell@10.2.0", pinned: true }]);
});

test("parseNodeClaims finds the minimum-version promises docs actually make", () => {
  const md = [
    "Requires **Node.js 18+**.",
    "You need Node 20 or newer.",
    "This requires Node.js 16 on PATH.",
    "We tested against Node 24 last Tuesday.",
  ].join("\n");

  assert.deepEqual(
    parseNodeClaims(md).map((c) => [c.line, c.major]),
    [
      [1, 18],
      [2, 20],
      [3, 16],
    ],
    "a bare mention of a version is not a promise and must not be flagged",
  );
});

test("parseNodeClaims skips fenced code blocks", () => {
  // This gate's own documentation quotes its own failure output, which
  // contains the very string the patterns look for. A transcript is not a
  // promise to the reader, so fences are skipped.
  const md = [
    "Real prose: requires Node 18.",
    "```text",
    "  • docs/x.md:1 tells readers Node 16 is enough",
    "Requires **Node.js 14+**.",
    "```",
    "~~~markdown",
    "Node 12 or newer.",
    "~~~",
    "More prose: Node 20+.",
  ].join("\n");

  assert.deepEqual(
    parseNodeClaims(md).map((c) => [c.line, c.major]),
    [
      [1, 18],
      [9, 20],
    ],
  );
});

test("parseNodeClaims handles a longer fence wrapping a shorter one", () => {
  const md = ["````markdown", "```", "Requires Node 14+.", "```", "````", "Requires Node 22+."].join("\n");
  assert.deepEqual(
    parseNodeClaims(md).map((c) => c.major),
    [22],
  );
});

test("parseNodeClaims honours the toolchain-ignore escape hatch", () => {
  const md = "Node 18+ was the baseline until 2026. <!-- toolchain-ignore -->\n";
  assert.deepEqual(parseNodeClaims(md), []);
});

// --- the gate end to end ------------------------------------------------

test("a consistent repo passes with no errors or warnings", () => {
  const result = checkToolchain({ root: healthyRepo(), now: new Date("2026-09-02") });
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.baseline, 22);
  assert.equal(result.stats.globalInstalls, 1);
});

test("fails when .nvmrc is older than the engines baseline", () => {
  const result = checkToolchain({ root: healthyRepo({ ".nvmrc": "20\n" }), now: new Date("2026-09-02") });
  assert.equal(result.ok, false);
  oneErrorMatching(result, ".nvmrc pins Node 20");
});

test("fails when .nvmrc is missing entirely", () => {
  const dir = makeRepo({
    "package.json": JSON.stringify({ engines: { node: ">=22" } }),
  });
  const result = checkToolchain({ root: dir, now: new Date("2026-09-02") });
  assert.equal(result.ok, false);
  oneErrorMatching(result, ".nvmrc is missing");
});

test("fails when CI runs a Node version the package says it does not support", () => {
  const result = checkToolchain({
    root: healthyRepo({
      ".github/workflows/ci.yml": '        node: ["20", "24"]\n',
    }),
    now: new Date("2026-09-02"),
  });
  assert.equal(result.ok, false);
  const err = oneErrorMatching(result, "runs on Node 20");
  assert.match(err, /ci\.yml/, "the error must name the file to fix");
});

test("fails when a CI tool install loses its version pin", () => {
  const result = checkToolchain({
    root: healthyRepo({
      ".github/workflows/ci.yml": "      - run: npm install -g markdownlint-cli\n",
    }),
    now: new Date("2026-09-02"),
  });
  assert.equal(result.ok, false);
  const err = oneErrorMatching(result, "markdownlint-cli");
  assert.match(err, /without an exact version/);
});

test("fails when a doc promises an older Node than the package requires", () => {
  const result = checkToolchain({
    root: healthyRepo({ "docs/install.md": "\n\nRequires **Node.js 18+**.\n" }),
    now: new Date("2026-09-02"),
  });
  assert.equal(result.ok, false);
  const err = oneErrorMatching(result, "Node 18 is enough");
  assert.match(err, /docs\/install\.md:3/, "the error must give file and line");
});

test("reports every distinct problem in one run, not just the first", () => {
  // A contributor should be able to fix the whole thing in a single pass.
  const result = checkToolchain({
    root: healthyRepo({
      ".nvmrc": "20\n",
      ".github/workflows/ci.yml": '        node: ["20"]\n      - run: npm install -g cspell\n',
      "docs/install.md": "Requires **Node.js 18+**.\n",
    }),
    now: new Date("2026-09-02"),
  });
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 4);
});

test("warns without failing when the baseline is past its end-of-life", () => {
  // Advisory on purpose: a gate that turns red on a calendar date with no code
  // change is a time bomb. It must inform, not block.
  const result = checkToolchain({
    root: healthyRepo({
      "package.json": JSON.stringify({ engines: { node: ">=20" } }),
      "README.md": "Requires **Node.js 20+**.\n",
    }),
    now: new Date("2026-09-02"),
  });
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /Node 20 reached end-of-life on 2026-04-30/);
});

test("does not warn while the baseline is still supported upstream", () => {
  const result = checkToolchain({ root: healthyRepo(), now: new Date("2027-04-29") });
  assert.deepEqual(result.warnings, []);
});

test("reports a usable error instead of throwing on a broken package.json", () => {
  const missing = checkToolchain({ root: makeRepo({ "README.md": "x" }) });
  assert.equal(missing.ok, false);
  assert.match(missing.errors[0], /package\.json not found/);

  const broken = checkToolchain({ root: makeRepo({ "package.json": "{ not json" }) });
  assert.equal(broken.ok, false);
  assert.match(broken.errors[0], /not valid JSON/);

  const noEngines = checkToolchain({ root: makeRepo({ "package.json": "{}" }) });
  assert.equal(noEngines.ok, false);
  assert.match(noEngines.errors[0], /must declare/);
});

test("append-only history is not scanned for version claims", () => {
  // The reflections journal and the postmortem log record what was true at the
  // time. An entry saying "the floor was Node 18 back then" is accurate history,
  // not a promise to a reader — scanning them would make every future journal
  // entry that mentions a past baseline fail the build.
  const result = checkToolchain({
    root: healthyRepo({
      ".ai/traces/AGENT_LOG_REFLECTIONS.md": "Back then it required Node 18.\n",
      "postmortems/POSTMORTEM_AND_LEARNING_LOG.md": "Requires **Node.js 16+**.\n",
      ".ai/config/GUIDE.md": "Requires **Node.js 18+**.\n",
    }),
    now: new Date("2026-09-02"),
  });

  // .ai/config/ is live guidance, so it IS checked — only the history is exempt.
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 1);
  oneErrorMatching(result, ".ai/config/GUIDE.md");
});

test("a repo with no workflows is still checked, not skipped", () => {
  const dir = makeRepo({
    "package.json": JSON.stringify({ engines: { node: ">=22" } }),
    ".nvmrc": "24\n",
    "README.md": "Requires **Node.js 18+**.\n",
  });
  const result = checkToolchain({ root: dir, now: new Date("2026-09-02") });
  assert.equal(result.ok, false);
  assert.equal(result.stats.workflows, 0);
  oneErrorMatching(result, "Node 18 is enough");
});

test("NODE_EOL covers every LTS line the repo may target", () => {
  // If someone raises the baseline to a major with no entry here, the
  // end-of-life warning silently stops working. This test is the tripwire.
  for (const major of [20, 22, 24, 26]) {
    assert.ok(NODE_EOL[major], `missing an end-of-life date for Node ${major}`);
    assert.match(NODE_EOL[major], /^\d{4}-\d{2}-\d{2}$/);
  }
});

// --- the real repository ------------------------------------------------

test("this repository's own toolchain is consistent", () => {
  const result = checkToolchain({ root: REPO_ROOT });
  assert.equal(
    result.ok,
    true,
    `check-toolchain found problems in this repo:\n${result.errors.join("\n")}`,
  );
});

test("this repository's baseline is a supported Node version", () => {
  const result = checkToolchain({ root: REPO_ROOT });
  assert.deepEqual(
    result.warnings,
    [],
    "the declared Node baseline has reached end-of-life — raise engines.node, .nvmrc and the CI matrix",
  );
});
