/**
 * hook-command
 *
 * Builds the shell command string that gets written into a Claude Code
 * `settings.json` so the agent can run an installed hook script.
 *
 * This is a separate module for one reason: it used to be two lines inside
 * `install-prompt-optimizer.js`, and those two lines were wrong on Windows.
 * The old code wrote a literal tilde:
 *
 *     node ~\.claude\hooks\prompt-optimizer-gate.js
 *
 * `~` is a convention of POSIX shells. `cmd.exe` does not expand it at all, so
 * a user-scope install on Windows produced a settings.json whose hook could
 * never run — and it failed silently, because a hook that cannot start just
 * does nothing. The installer had no test covering the string it wrote, so
 * nothing caught it.
 *
 * Keeping the rule in a pure function means it can be tested on every platform
 * without installing anything. See `test/hook-command.test.js`.
 */

const path = require("path");

/**
 * Turn a filesystem path into the forward-slash form.
 *
 * Node accepts `/` on Windows as well as `\`, and a settings.json holding
 * forward slashes stays readable when a Windows and a macOS developer look at
 * the same committed file.
 *
 * @param {string} p
 * @returns {string}
 */
function toPosix(p) {
  return p.split(path.sep).join("/");
}

/**
 * Wrap a path for a shell command line.
 *
 * Double quotes are the one quoting style understood by every shell this repo
 * targets — `sh`/`bash`/`zsh` on macOS and Linux, and both `cmd.exe` and
 * PowerShell on Windows. Without them, a home directory containing a space
 * (`C:\Users\Jane Smith\...`, `/Users/Jane Smith/...`) splits into two
 * arguments and the hook never starts.
 *
 * @param {string} p
 * @returns {string}
 */
function quoteForShell(p) {
  return `"${p}"`;
}

/**
 * Build the `node <script>` command for an installed hook.
 *
 * Scope decides whether the path is absolute or relative, and that choice is
 * deliberate:
 *
 *   - **Project scope** — the settings file lives in the repository and is
 *     usually committed. A relative path (`.claude/hooks/...`) is the only form
 *     that still resolves on a teammate's machine, whose home directory and
 *     checkout location differ from yours.
 *   - **User scope** — the settings file lives in the home directory and is
 *     never shared, and the agent's working directory is whatever project the
 *     user happens to have open. Only an absolute path resolves reliably.
 *
 * @param {string} hookPath  Absolute path the hook script was installed to.
 * @param {object} [options]
 * @param {boolean} [options.user]  True for a user-global install.
 * @param {string}  [options.cwd]   Project root a project-scope path is made
 *   relative to. Defaults to the current working directory.
 * @returns {string} a command safe to place in settings.json on any platform
 * @throws {TypeError} if `hookPath` is not a non-empty string
 */
function hookCommandFor(hookPath, { user = false, cwd = process.cwd() } = {}) {
  if (typeof hookPath !== "string" || hookPath.trim() === "") {
    throw new TypeError("hookCommandFor: hookPath must be a non-empty string");
  }

  const absolute = path.resolve(hookPath);
  const target = user ? absolute : toPosix(path.relative(path.resolve(cwd), absolute));

  return `node ${quoteForShell(target)}`;
}

module.exports = { hookCommandFor, toPosix, quoteForShell };
