/**
 * Test Helper
 * Simplified API for writing framework-agnostic tests
 */

import { FrameworkFactory } from './factory.js';
import { FrameworkConfig, IBrowserAdapter } from './types.js';

export class TestHelper {
  private static instance: IBrowserAdapter | null = null;

  /**
   * Initialize the browser with the specified configuration
   */
  static async init(config?: FrameworkConfig): Promise<IBrowserAdapter> {
    if (this.instance) {
      return this.instance;
    }

    const adapter = config ? FrameworkFactory.createAdapter(config) : FrameworkFactory.createFromEnv();

    await adapter.initialize();
    this.instance = adapter;
    return adapter;
  }

  /**
   * Get the current browser instance
   */
  static getBrowser(): IBrowserAdapter {
    if (!this.instance) {
      throw new Error('Browser not initialized. Call TestHelper.init() first.');
    }
    return this.instance;
  }

  /**
   * Close the browser and cleanup
   */
  static async close(): Promise<void> {
    if (this.instance) {
      await this.instance.close();
      this.instance = null;
    }
  }

  /**
   * Reset the instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }
}

/**
 * Global browser instance for convenience
 * Usage: import { browser } from './framework/test-helper.js';
 */
export const getBrowser = (): IBrowserAdapter => TestHelper.getBrowser();
