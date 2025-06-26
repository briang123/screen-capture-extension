#!/usr/bin/env node
/**
 * validate-generated-project.ts
 *
 * Usage:
 *   node scripts/validate-generated-project.ts
 *
 * This script will:
 *   1. Run 'npx tsc --noEmit' to check for TypeScript errors
 *   2. Run 'npm run lint' to check for lint errors
 *
 * Use this after AI generation to ensure your project is error-free.
 */

import { execSync } from 'child_process';

function runCheck(command: string, description: string): boolean {
  try {
    console.log(`\n=== ${description} ===`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} passed.`);
    return true;
  } catch {
    console.error(`❌ ${description} failed.`);
    return false;
  }
}

let allPassed = true;

allPassed = allPassed && runCheck('npx tsc --noEmit', 'TypeScript type check');
allPassed = allPassed && runCheck('npm run lint', 'Lint check');

if (!allPassed) {
  console.error('\nSome checks failed. Please fix the errors above before proceeding.');
  process.exit(1);
} else {
  console.log('\nAll validation checks passed! Your project is ready.');
}
