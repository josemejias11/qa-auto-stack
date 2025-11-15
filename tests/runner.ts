/**
 * Multi-Framework Test Runner
 * Runs tests using the framework specified in FRAMEWORK environment variable
 */

import Mocha from 'mocha';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  const framework = process.env.FRAMEWORK || 'webdriverio';
  const specPattern = process.env.SPEC || 'tests/examples/**/*.spec.ts';

  console.log(`\n========================================`);
  console.log(`🚀 Running tests with ${framework.toUpperCase()}`);
  console.log(`========================================\n`);

  // Warn about Cypress limitations
  if (framework === 'cypress') {
    console.log(`⚠️  WARNING: Cypress has a different architecture than Selenium/WebDriverIO.`);
    console.log(`⚠️  Cypress tests should ideally be run through Cypress's own CLI:`);
    console.log(`⚠️    npx cypress run --spec "tests/examples/**/*.spec.ts"\n`);
    console.log(`⚠️  This runner provides limited Cypress compatibility.\n`);
  }

  // Create Mocha instance
  const mocha = new Mocha({
    timeout: 30000,
    reporter: 'spec',
    color: true,
    bail: false,
  });

  // Find all test files
  const testFiles = await glob(specPattern, {
    cwd: process.cwd(),
    absolute: true,
  });

  if (testFiles.length === 0) {
    console.error(`❌ No test files found matching pattern: ${specPattern}`);
    process.exit(1);
  }

  console.log(`Found ${testFiles.length} test file(s):\n`);
  testFiles.forEach((file) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`  - ${relativePath}`);
    mocha.addFile(file);
  });

  console.log('\n');

  // Run the tests
  mocha.run((failures) => {
    console.log('\n========================================');
    if (failures) {
      console.log(`❌ ${failures} test(s) failed`);
      console.log(`========================================\n`);
      process.exit(failures);
    } else {
      console.log(`✅ All tests passed!`);
      console.log(`========================================\n`);
      process.exit(0);
    }
  });
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Run tests
runTests().catch((error) => {
  console.error('Error running tests:', error);
  process.exit(1);
});
