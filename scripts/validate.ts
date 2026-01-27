#!/usr/bin/env npx tsx
/**
 * Configuration Validator
 * 
 * Validate settings and configuration files.
 * 
 * Usage:
 *   npm run validate
 *   npx tsx scripts/validate.ts
 *   npx tsx scripts/validate.ts --fix
 */

import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

interface ValidationOptions {
  fix?: boolean;
  verbose?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function parseArgs(): ValidationOptions {
  const args = process.argv.slice(2);
  const options: ValidationOptions = {};

  for (const arg of args) {
    if (arg === '--fix') {
      options.fix = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }

  return options;
}

function validateSettings(settingsPath: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!existsSync(settingsPath)) {
    result.warnings.push('Settings file not found (using defaults)');
    return result;
  }

  try {
    const content = readFileSync(settingsPath, 'utf-8');
    const settings = JSON.parse(content);

    // Validate provider
    if (settings.CLAUDE_RECALL_PROVIDER) {
      const validProviders = ['claude', 'gemini', 'openrouter'];
      if (!validProviders.includes(settings.CLAUDE_RECALL_PROVIDER)) {
        result.errors.push(`Invalid provider: ${settings.CLAUDE_RECALL_PROVIDER}`);
        result.valid = false;
      }
    }

    // Validate port
    if (settings.CLAUDE_RECALL_WORKER_PORT) {
      const port = Number(settings.CLAUDE_RECALL_WORKER_PORT);
      if (isNaN(port) || port < 1024 || port > 65535) {
        result.errors.push(`Invalid port: ${settings.CLAUDE_RECALL_WORKER_PORT}`);
        result.valid = false;
      }
    }

    // Validate log level
    if (settings.CLAUDE_RECALL_LOG_LEVEL) {
      const validLevels = ['debug', 'info', 'warn', 'error'];
      if (!validLevels.includes(settings.CLAUDE_RECALL_LOG_LEVEL)) {
        result.errors.push(`Invalid log level: ${settings.CLAUDE_RECALL_LOG_LEVEL}`);
        result.valid = false;
      }
    }

    // Validate max tokens
    if (settings.CLAUDE_RECALL_MAX_CONTEXT_TOKENS) {
      const tokens = Number(settings.CLAUDE_RECALL_MAX_CONTEXT_TOKENS);
      if (isNaN(tokens) || tokens < 1000 || tokens > 100000) {
        result.errors.push(`Invalid max tokens: ${settings.CLAUDE_RECALL_MAX_CONTEXT_TOKENS}`);
        result.valid = false;
      }
    }

    // Check for API keys if using external providers
    if (settings.CLAUDE_RECALL_PROVIDER === 'openrouter' && !settings.OPENROUTER_API_KEY) {
      result.warnings.push('OpenRouter provider selected but no API key configured');
    }

    if (settings.CLAUDE_RECALL_PROVIDER === 'gemini' && !settings.GEMINI_API_KEY) {
      result.warnings.push('Gemini provider selected but no API key configured');
    }

  } catch (error) {
    result.errors.push(`Failed to parse settings: ${error}`);
    result.valid = false;
  }

  return result;
}

async function main() {
  const options = parseArgs();
  const dataDir = join(homedir(), '.claude-recall');
  const settingsPath = join(dataDir, 'settings.json');

  console.log('\n✅ claude-recall Configuration Validator\n');
  console.log('═'.repeat(50));

  // Validate settings
  console.log('\n📋 Validating settings...');
  const settingsResult = validateSettings(settingsPath);

  if (settingsResult.errors.length > 0) {
    console.log('\n❌ Errors:');
    for (const error of settingsResult.errors) {
      console.log(`   - ${error}`);
    }
  }

  if (settingsResult.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    for (const warning of settingsResult.warnings) {
      console.log(`   - ${warning}`);
    }
  }

  if (settingsResult.valid && settingsResult.errors.length === 0) {
    console.log('\n✅ Configuration is valid');
  }

  // Check data directory
  console.log('\n📁 Checking data directory...');
  if (existsSync(dataDir)) {
    console.log(`   Found: ${dataDir}`);
  } else {
    console.log(`   Not found: ${dataDir}`);
    console.log('   (Will be created on first run)');
  }

  console.log('\n' + '═'.repeat(50));

  if (!settingsResult.valid) {
    process.exit(1);
  }
}

main().catch(console.error);
