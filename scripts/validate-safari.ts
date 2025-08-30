#!/usr/bin/env tsx
/**
 * Validate Safari WebDriver setup before running tests
 */
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function validateSafari(): Promise<boolean> {
  console.log('🔍 Validating Safari WebDriver setup...');
  
  // Check if running on macOS
  if (process.platform !== 'darwin') {
    console.log('❌ Safari is only available on macOS');
    return false;
  }
  
  try {
    // Check if safaridriver is available
    await execAsync('which safaridriver');
    console.log('✅ safaridriver found');
  } catch {
    console.log('❌ safaridriver not found. Install Xcode or Safari Technology Preview');
    return false;
  }
  
  try {
    // Check if safaridriver is enabled
    const { stdout } = await execAsync('safaridriver --version');
    console.log(`✅ safaridriver version: ${stdout.trim()}`);
  } catch (error: unknown) {
    const errorObj = error as Error;
    if (errorObj.message.includes('Enable Remote Automation')) {
      console.log('❌ Safari Remote Automation not enabled. Run: sudo safaridriver --enable');
      console.log('   Also enable "Allow Remote Automation" in Safari > Develop menu');
      return false;
    }
    const err = error as Error;
    console.log('⚠️  Could not get safaridriver version:', err.message);
  }
  
  try {
    // Test if we can start safaridriver briefly
    console.log('🧪 Testing safaridriver startup...');
    const child = exec('safaridriver --port=0', { timeout: 5000 });
    
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        child.kill();
        resolve(true);
      }, 2000);
      
      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
      
      child.stderr?.on('data', (data) => {
        if (data.includes('Enable Remote Automation')) {
          clearTimeout(timer);
          child.kill();
          reject(new Error('Remote Automation not enabled'));
        }
      });
    });
    
    console.log('✅ safaridriver startup test passed');
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('❌ Safari setup validation failed:', errorMessage);
    return false;
  }
}

async function main() {
  const isValid = await validateSafari();
  process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

export { validateSafari };
