#!/usr/bin/env npx tsx
/**
 * Statistics Script
 * 
 * Display memory statistics from the command line.
 * 
 * Usage:
 *   npm run stats
 *   npx tsx scripts/stats.ts
 *   npx tsx scripts/stats.ts --project my-project
 */

import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

interface StatsOptions {
  project?: string;
  json?: boolean;
}

function parseArgs(): StatsOptions {
  const args = process.argv.slice(2);
  const options: StatsOptions = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--project' || args[i] === '-p') {
      options.project = args[++i];
    } else if (args[i] === '--json') {
      options.json = true;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();
  const dataDir = join(homedir(), '.claude-recall');
  const dbPath = join(dataDir, 'memory.db');

  if (!existsSync(dbPath)) {
    console.error('Database not found. Run claude-recall first.');
    process.exit(1);
  }

  // In a real implementation, this would query the database
  const stats = {
    totalObservations: 0,
    totalSessions: 0,
    totalSummaries: 0,
    projects: 0,
    tokensUsed: 0,
  };

  if (options.json) {
    console.log(JSON.stringify(stats, null, 2));
  } else {
    console.log('\n📊 claude-recall Statistics\n');
    console.log('═'.repeat(40));
    console.log(`  Observations:  ${stats.totalObservations}`);
    console.log(`  Sessions:      ${stats.totalSessions}`);
    console.log(`  Summaries:     ${stats.totalSummaries}`);
    console.log(`  Projects:      ${stats.projects}`);
    console.log(`  Tokens Used:   ${stats.tokensUsed}`);
    console.log('═'.repeat(40));
  }
}

main().catch(console.error);
