#!/usr/bin/env node
/**
 * Bun Wrapper Script
 * 
 * Finds bun executable and runs the given command with it.
 * This handles cases where bun is not in PATH.
 */
import { existsSync } from 'fs';
import { spawn, spawnSync } from 'child_process';
import { join } from 'path';
import { homedir } from 'os';

const IS_WINDOWS = process.platform === 'win32';

/**
 * Get the Bun executable path (from PATH or common install locations)
 */
function getBunPath() {
  // Try PATH first
  try {
    const result = spawnSync('bun', ['--version'], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: IS_WINDOWS
    });
    if (result.status === 0) return 'bun';
  } catch {
    // Not in PATH
  }

  // Check common installation paths
  const bunPaths = IS_WINDOWS
    ? [join(homedir(), '.bun', 'bin', 'bun.exe')]
    : [join(homedir(), '.bun', 'bin', 'bun'), '/usr/local/bin/bun', '/opt/homebrew/bin/bun'];

  for (const bunPath of bunPaths) {
    if (existsSync(bunPath)) return bunPath;
  }

  throw new Error('Bun not found. Please install bun: https://bun.sh');
}

// Get bun path and execute command
const bunPath = getBunPath();
const args = process.argv.slice(2);

const child = spawn(bunPath, args, {
  stdio: 'inherit',
  shell: IS_WINDOWS
});

child.on('error', (error) => {
  console.error(`Failed to execute bun: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
