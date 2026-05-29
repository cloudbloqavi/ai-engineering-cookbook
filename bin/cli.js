#!/usr/bin/env node

const { fork } = require('child_process');
const path = require('path');
const readline = require('readline');

const subcommands = {
  'doc-coherence': './install-doc-coherence.js',
  'install-doc-coherence': './install-doc-coherence.js',
  'prompt-optimizer': './install-prompt-optimizer.js',
  'install-prompt-optimizer': './install-prompt-optimizer.js'
};

function showHelp() {
  process.stdout.write(
    [
      '\x1b[1m\x1b[36mAI Engineering Cookbook Skill Installer\x1b[0m',
      'Installs portable Agent Skills (SKILL.md) and supporting hooks/gates into your repositories.',
      '',
      '\x1b[1mUsage:\x1b[0m',
      '  npx github:cloudbloqavi/ai-engineering-cookbook <skill-name> [options]',
      '',
      '\x1b[1mAvailable Skills:\x1b[0m',
      '  \x1b[1mdoc-coherence\x1b[0m     Kills cross-document drift with a single-source-of-truth gate.',
      '  \x1b[1mprompt-optimizer\x1b[0m  Optimizes agent prompts on session-start with custom scorecards.',
      '',
      '\x1b[1mOptions (passed through to installer):\x1b[0m',
      '  --tool <name>    Target tool: claude (default) | cursor | roo | vscode | codex | antigravity | custom',
      '  --target <dir>   With --tool custom, directory where SKILL.md will land',
      '  --user           Install the skill to the tool\'s user-global config directory',
      '  --force          Overwrite existing files',
      '  --dry-run        Print planned actions; write nothing',
      '  -h, --help       Show help',
      '',
      '\x1b[1mExamples:\x1b[0m',
      '  npx github:cloudbloqavi/ai-engineering-cookbook doc-coherence',
      '  npx github:cloudbloqavi/ai-engineering-cookbook prompt-optimizer --tool cursor',
      ''
    ].join('\n')
  );
}

function runScript(scriptPath, args) {
  const fullPath = path.resolve(__dirname, scriptPath);
  const child = fork(fullPath, args, { stdio: 'inherit' });
  child.on('close', (code) => {
    process.exit(code ?? 0);
  });
}

function promptUser() {
  process.stdout.write('\n\x1b[1m\x1b[36m=== AI Engineering Cookbook — Skill Installer ===\x1b[0m\n\n');
  process.stdout.write('Select a skill to install:\n');
  process.stdout.write('  \x1b[1m1)\x1b[0m \x1b[32mDoc Coherence\x1b[0m (Single-source-of-truth registry & CI gate)\n');
  process.stdout.write('  \x1b[1m2)\x1b[0m \x1b[32mPrompt Optimizer\x1b[0m (Calibrate & optimize agent prompts)\n');
  process.stdout.write('  \x1b[1m3)\x1b[0m Exit\n\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\x1b[1mEnter choice [1-3]:\x1b[0m ', (choice) => {
    rl.close();
    const trimmed = choice.trim();
    if (trimmed === '1') {
      runScript(subcommands['doc-coherence'], []);
    } else if (trimmed === '2') {
      runScript(subcommands['prompt-optimizer'], []);
    } else if (trimmed === '3' || trimmed.toLowerCase() === 'exit') {
      process.stdout.write('Exiting.\n');
      process.exit(0);
    } else {
      process.stderr.write('\x1b[31mInvalid selection.\x1b[0m Please run again and select 1, 2, or 3.\n');
      process.exit(1);
    }
  });
}

// Main execution
const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd) {
  if (process.stdin.isTTY) {
    promptUser();
  } else {
    showHelp();
    process.exit(0);
  }
} else if (cmd === 'help' || cmd === '-h' || cmd === '--help') {
  showHelp();
  process.exit(0);
} else if (subcommands[cmd]) {
  runScript(subcommands[cmd], args.slice(1));
} else {
  process.stderr.write(`\x1b[31mUnknown command:\x1b[0m "${cmd}"\n\n`);
  showHelp();
  process.exit(1);
}
