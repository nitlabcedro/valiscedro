// start-dev.js — bypass Console Ninja
delete process.env.NODE_OPTIONS;
process.env.CONSOLE_NINJA_ENABLED = 'false';

const { execSync } = require('child_process');
const path = require('path');

// Remove any --require flags that Console Ninja may have injected
const cleanEnv = { ...process.env };
if (cleanEnv.NODE_OPTIONS) {
  cleanEnv.NODE_OPTIONS = cleanEnv.NODE_OPTIONS
    .replace(/--require\s+[^\s]+console-ninja[^\s]*/gi, '')
    .trim();
}

const { spawn } = require('child_process');
const next = spawn('node', [
  path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next'),
  'dev',
  '-p', '3000'
], {
  stdio: 'inherit',
  env: cleanEnv,
  cwd: __dirname,
});

next.on('close', (code) => process.exit(code));
