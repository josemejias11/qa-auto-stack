/**
 * Framework Configuration
 * Default configurations for each framework
 */

import { FrameworkConfig, FrameworkType } from './types.js';

/**
 * Default configuration for WebDriverIO
 */
export const WEBDRIVERIO_CONFIG: Partial<FrameworkConfig> = {
  framework: FrameworkType.WEBDRIVERIO,
  timeout: 10000,
  screenshots: true,
  viewport: {
    width: 1440,
    height: 900,
  },
};

/**
 * Default configuration for Selenium
 */
export const SELENIUM_CONFIG: Partial<FrameworkConfig> = {
  framework: FrameworkType.SELENIUM,
  timeout: 10000,
  screenshots: true,
  viewport: {
    width: 1440,
    height: 900,
  },
};

/**
 * Default configuration for Cypress
 */
export const CYPRESS_CONFIG: Partial<FrameworkConfig> = {
  framework: FrameworkType.CYPRESS,
  timeout: 10000,
  screenshots: true,
  viewport: {
    width: 1440,
    height: 900,
  },
};

/**
 * Get default configuration for a framework
 */
export function getDefaultConfig(framework: FrameworkType): Partial<FrameworkConfig> {
  switch (framework) {
    case FrameworkType.WEBDRIVERIO:
      return WEBDRIVERIO_CONFIG;
    case FrameworkType.SELENIUM:
      return SELENIUM_CONFIG;
    case FrameworkType.CYPRESS:
      return CYPRESS_CONFIG;
    default:
      return WEBDRIVERIO_CONFIG;
  }
}

/**
 * Merge user config with defaults
 */
export function mergeConfig(userConfig: Partial<FrameworkConfig>): FrameworkConfig {
  const framework = userConfig.framework || FrameworkType.WEBDRIVERIO;
  const defaults = getDefaultConfig(framework);

  return {
    ...defaults,
    ...userConfig,
    framework,
  } as FrameworkConfig;
}
