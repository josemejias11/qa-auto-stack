#!/usr/bin/env tsx
/**
 * Clean cache directories and npm cache for the project.
 * - npm cache
 * - node_modules/.cache
 */
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

async function cleanNpmCache() {
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('npm cache cleaned.');
  } catch (err) {
    console.warn('Failed to clean npm cache:', err);
  }
}

async function cleanNodeModulesCache() {
  const cacheDir = path.resolve('node_modules/.cache');
  try {
    await fs.rm(cacheDir, { recursive: true, force: true });
    console.log('node_modules/.cache removed.');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn('Failed to remove node_modules/.cache:', err);
    }
  }
}

async function main() {
  await cleanNpmCache();
  await cleanNodeModulesCache();
  console.log('Cache cleanup complete.');
}

main();
