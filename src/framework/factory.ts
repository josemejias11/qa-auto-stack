/**
 * Framework Factory
 * Creates the appropriate browser adapter based on configuration
 */

import type { FrameworkConfig, IBrowserAdapter } from './types.js';
import { FrameworkType } from './types.js';
import { WebDriverIOAdapter } from './adapters/webdriverio-adapter.js';
import { SeleniumAdapter } from './adapters/selenium-adapter.js';
import { CypressAdapter } from './adapters/cypress-adapter.js';

export class FrameworkFactory {
  /**
   * Create a browser adapter instance based on the framework type
   */
  static createAdapter(config: FrameworkConfig): IBrowserAdapter {
    switch (config.framework) {
      case FrameworkType.WEBDRIVERIO:
        return new WebDriverIOAdapter(config);

      case FrameworkType.SELENIUM:
        return new SeleniumAdapter(config);

      case FrameworkType.CYPRESS:
        return new CypressAdapter(config);

      default:
        throw new Error(`Unsupported framework: ${config.framework}`);
    }
  }

  /**
   * Create adapter from environment variables
   */
  static createFromEnv(): IBrowserAdapter {
    const framework = (process.env.FRAMEWORK || 'webdriverio') as FrameworkType;
    const browser = process.env.BROWSER || process.env.BROWSERS?.split(',')[0] || 'chrome';
    const headless = process.env.HEADLESS === '1' || process.env.HEADLESS === 'true';
    const baseUrl = process.env.BASE_URL;

    const config: FrameworkConfig = {
      framework,
      browser,
      headless,
      baseUrl,
      timeout: parseInt(process.env.TIMEOUT || '10000', 10),
      screenshots: true,
      viewport: {
        width: parseInt(process.env.VIEWPORT_WIDTH || '1440', 10),
        height: parseInt(process.env.VIEWPORT_HEIGHT || '900', 10),
      },
    };

    return this.createAdapter(config);
  }

  /**
   * Get list of supported frameworks
   */
  static getSupportedFrameworks(): FrameworkType[] {
    return [FrameworkType.WEBDRIVERIO, FrameworkType.SELENIUM, FrameworkType.CYPRESS];
  }

  /**
   * Validate framework configuration
   */
  static validateConfig(config: FrameworkConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.framework) {
      errors.push('Framework type is required');
    } else if (!this.getSupportedFrameworks().includes(config.framework)) {
      errors.push(`Unsupported framework: ${config.framework}`);
    }

    if (config.timeout && config.timeout < 0) {
      errors.push('Timeout must be a positive number');
    }

    if (config.viewport) {
      if (config.viewport.width <= 0 || config.viewport.height <= 0) {
        errors.push('Viewport dimensions must be positive numbers');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
