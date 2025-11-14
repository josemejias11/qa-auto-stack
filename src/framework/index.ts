/**
 * Multi-Framework Automation
 * Main entry point for framework-agnostic browser automation
 */

// Types
export * from './types.js';

// Base adapter
export { BaseBrowserAdapter } from './base-adapter.js';

// Framework adapters
export { WebDriverIOAdapter } from './adapters/webdriverio-adapter.js';
export { SeleniumAdapter } from './adapters/selenium-adapter.js';
export { CypressAdapter } from './adapters/cypress-adapter.js';

// Factory
export { FrameworkFactory } from './factory.js';

// Re-export the main interface for convenience
export type { IBrowserAdapter } from './types.js';
