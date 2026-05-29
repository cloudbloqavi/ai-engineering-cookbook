#!/usr/bin/env node
/**
 * UserPromptSubmit hook — Prompt Optimizer Gate
 *
 * On the FIRST user prompt of a new Claude Code session, if the prompt is
 * substantive (> MIN_LENGTH chars), inject a system reminder instructing
 * Claude to offer the `/prompt-optimizer` skill before doing the work.
 *
 * Behavior:
 *   - Fires only once per session_id (tracked via sentinel file).
 *   - Skips short prompts (greetings, one-liners, slash commands).
 *   - UserPromptSubmit does NOT fire inside subagent (Task tool) scope,
 *     so subagents are naturally excluded.
 *
 * Hook contract: https://docs.claude.com/en/docs/claude-code/hooks
 *   stdin  → JSON { session_id, prompt, cwd, hook_event_name, ... }
 *   stdout → JSON { hookSpecificOutput: { hookEventName, additionalContext } }
 */

const fs = require("fs");
const path = require("path");

const MIN_LENGTH = 30;

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

function passThrough() {
  // Empty output = no context injected, prompt proceeds normally.
  process.exit(0);
}

(async () => {
  let payload;
  try {
    const raw = await readStdin();
    payload = JSON.parse(raw);
  } catch {
    passThrough();
    return;
  }

  const sessionId = payload.session_id;
  const prompt = (payload.prompt || "").trim();
  const cwd = payload.cwd || process.cwd();

  if (!sessionId || !prompt) passThrough();

  // Skip slash commands — user is explicitly invoking something.
  if (prompt.startsWith("/")) passThrough();

  // Skip short prompts — not worth optimizing.
  if (prompt.length <= MIN_LENGTH) passThrough();

  // Session-state sentinel: fire only on first prompt per session.
  const stateDir = path.join(cwd, ".claude", "state", "prompt-optimizer");
  const sentinel = path.join(stateDir, `${sessionId}.seen`);
  try {
    if (fs.existsSync(sentinel)) passThrough();
    fs.mkdirSync(stateDir, { recursive: true });
    fs.writeFileSync(sentinel, new Date().toISOString());
  } catch {
    // If we can't write state, fail open (don't block the user).
    passThrough();
  }

  const additionalContext = [
    "<prompt-optimizer-gate>",
    "This is the first substantive user prompt of this session.",
    "Before doing ANY work on the request, follow this gate:",
    "",
    "1. Ask the user (one short question): \"Would you like me to run the",
    "   `prompt-optimizer` skill on your prompt before I proceed? (yes / no)\"",
    "2. If the user declines → proceed with the original request as normal.",
    "3. If the user confirms → invoke the `prompt-optimizer` skill on their",
    "   original prompt, show the optimized version, and ask: \"Approve this",
    "   optimized prompt? (yes / edit / no)\".",
    "   - yes  → use the optimized prompt as the working request and proceed.",
    "   - edit → incorporate their edits, re-confirm, then proceed.",
    "   - no   → fall back to the original prompt and proceed.",
    "",
    "Rules:",
    "- Do this gate exactly ONCE, right now. Do not repeat it later in the session.",
    "- Do not run this gate inside subagent scope (it will not fire there anyway).",
    "- Keep the gate interaction terse — two short questions, no preamble.",
    "</prompt-optimizer-gate>",
  ].join("\n");

  const out = {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext,
    },
  };

  process.stdout.write(JSON.stringify(out));
  process.exit(0);
})();
