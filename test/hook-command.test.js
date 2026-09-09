/**
 * Unit tests for bin/hook-command.js.
 *
 * These cover a bug that shipped and went unnoticed, because the installer had
 * no test for the one string it writes into somebody else's settings.json.
 *
 * A user-scope install used to register:
 *
 *     node ~\.claude\hooks\prompt-optimizer-gate.js
 *
 * `~` is a POSIX shell convention. `cmd.exe` does not expand it, so on Windows
 * the hook could never start — and a hook that cannot start fails silently, so
 * the user just saw a feature that "did not work" with nothing to search for.
 *
 * The rules asserted here are deliberately about the *string*, not the
 * filesystem, so the whole file runs identically on macOS, Windows and Linux.
 *
 * Run: npm test   (uses node:test, built into Node 22+; no dependencies)
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");

const { hookCommandFor, toPosix, quoteForShell } = require("../bin/hook-command.js");

const HOOK = "prompt-optimizer-gate.js";

test("a user-scope command carries an absolute path, never a tilde", () => {
  const dest = path.join(os.homedir(), ".claude", "hooks", HOOK);
  const command = hookCommandFor(dest, { user: true });

  assert.ok(!command.includes("~"), `command still contains a tilde: ${command}`);
  assert.ok(path.isAbsolute(command.replace(/^node "|"$/g, "")), command);
  assert.ok(command.startsWith("node "), command);
  assert.ok(command.includes(HOOK), command);
});

test("a project-scope command stays relative, so a teammate's checkout works", () => {
  // An absolute path here would be worse than a tilde: settings.json in a
  // repository is committed, and a path under /Users/alice resolves on exactly
  // one machine.
  const cwd = path.resolve(path.sep, "work", "repo");
  const dest = path.join(cwd, ".claude", "hooks", HOOK);

  assert.equal(hookCommandFor(dest, { user: false, cwd }), `node ".claude/hooks/${HOOK}"`);
});

test("the path is quoted, so a home directory with a space still runs", () => {
  // "C:\Users\Jane Smith\..." and "/Users/Jane Smith/..." both split into two
  // arguments without quoting, and node then reports a file it cannot find.
  const cwd = path.resolve(path.sep, "Users", "Jane Smith", "repo");
  const dest = path.join(cwd, ".claude", "hooks", HOOK);
  const project = hookCommandFor(dest, { user: false, cwd });
  const user = hookCommandFor(path.join(os.homedir(), "a b", HOOK), { user: true });

  for (const command of [project, user]) {
    assert.match(command, /^node "(.+)"$/, `not quoted: ${command}`);
  }
});

test("a project-scope command uses forward slashes on every platform", () => {
  // Node accepts "/" on Windows, and a committed settings.json that reads the
  // same for everyone is one less diff for no reason.
  const cwd = path.resolve(path.sep, "work", "repo");
  const dest = path.join(cwd, ".claude", "hooks", HOOK);
  const command = hookCommandFor(dest, { user: false, cwd });

  assert.ok(!command.includes("\\"), `backslash leaked into the command: ${command}`);
});

test("the command survives a JSON round trip unchanged", () => {
  // It is written with JSON.stringify and read back by the agent. A Windows
  // absolute path is full of backslashes, which JSON escapes; this asserts
  // nothing is lost or doubled in the process.
  const command = hookCommandFor(path.join(os.homedir(), ".claude", "hooks", HOOK), {
    user: true,
  });
  const roundTripped = JSON.parse(JSON.stringify({ command })).command;

  assert.equal(roundTripped, command);
});

test("toPosix converts this platform's separator and leaves the rest alone", () => {
  assert.equal(toPosix(path.join("a", "b", "c.js")), "a/b/c.js");
  assert.equal(toPosix("already/posix.js"), "already/posix.js");
  assert.equal(toPosix(""), "");
});

test("quoteForShell wraps in the one style every target shell understands", () => {
  // sh, bash, zsh, cmd.exe and PowerShell all accept double quotes. Single
  // quotes are not understood by cmd.exe, which is why they are not used.
  assert.equal(quoteForShell("/a/b"), '"/a/b"');
  assert.equal(quoteForShell("C:\\a b\\c"), '"C:\\a b\\c"');
});

test("an empty or non-string path is rejected rather than silently wrong", () => {
  for (const bad of ["", "   ", null, undefined, 42, {}]) {
    assert.throws(() => hookCommandFor(bad), TypeError, `accepted ${JSON.stringify(bad)}`);
  }
});

test("the installer registers the command this module builds", () => {
  // Guards against the installer drifting back to its own inline version of
  // this rule, which is how the tilde got there in the first place.
  const fs = require("node:fs");
  const src = fs.readFileSync(
    path.resolve(__dirname, "..", "bin", "install-prompt-optimizer.js"),
    "utf8",
  );

  assert.match(src, /require\("\.\/hook-command"\)/);
  assert.match(src, /hookCommandFor\(/);
  assert.ok(
    !/path\.join\("~"/.test(src),
    "the installer builds a tilde path again — see this file's header",
  );
});
