#!/usr/bin/env tsx

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function openAllureReport() {
  console.log('Starting Allure server...');

  // Start allure server in background
  const allureServer = spawn('allure', ['open', 'reports/allure-report'], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Wait a moment for server to start
  await setTimeout(3000);

  // Just inform about the server without opening browser
  console.log('Allure server started at http://127.0.0.1:60551');
  console.log(
    'Note: Server will continue running in background. Kill with: pkill -f "allure.*open"'
  );

  // Detach the process so it continues running
  allureServer.unref();
  process.exit(0);
}

openAllureReport().catch(console.error);
