/**
 * Multi-Framework Automation Types
 * Common interfaces for framework-agnostic test automation
 */

/**
 * Supported automation frameworks
 */
export enum FrameworkType {
  WEBDRIVERIO = 'webdriverio',
  SELENIUM = 'selenium',
  CYPRESS = 'cypress',
}

/**
 * Framework configuration options
 */
export interface FrameworkConfig {
  framework: FrameworkType;
  browser?: string;
  headless?: boolean;
  baseUrl?: string;
  timeout?: number;
  screenshots?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
}

/**
 * Element locator strategies
 */
export interface Locator {
  type: 'css' | 'xpath' | 'id' | 'name' | 'text' | 'testid';
  value: string;
}

/**
 * Screenshot options
 */
export interface ScreenshotOptions {
  fullPage?: boolean;
  path?: string;
}

/**
 * Wait options
 */
export interface WaitOptions {
  timeout?: number;
  visible?: boolean;
  enabled?: boolean;
}

/**
 * Form field definition
 */
export interface FormField {
  locator: string | Locator;
  value: string;
  type?: 'input' | 'select' | 'checkbox' | 'radio';
}

/**
 * Browser navigation result
 */
export interface NavigationResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Common browser automation interface
 * All framework adapters must implement these methods
 */
export interface IBrowserAdapter {
  // Lifecycle methods
  initialize(): Promise<void>;
  close(): Promise<void>;

  // Navigation
  navigate(url: string): Promise<NavigationResult>;
  back(): Promise<void>;
  forward(): Promise<void>;
  refresh(): Promise<void>;
  getCurrentUrl(): Promise<string>;
  getTitle(): Promise<string>;

  // Element interaction
  click(locator: string | Locator): Promise<void>;
  type(locator: string | Locator, text: string): Promise<void>;
  clear(locator: string | Locator): Promise<void>;
  hover(locator: string | Locator): Promise<void>;

  // Element inspection
  getText(locator: string | Locator): Promise<string>;
  getAttribute(locator: string | Locator, attribute: string): Promise<string | null>;
  isVisible(locator: string | Locator): Promise<boolean>;
  isEnabled(locator: string | Locator): Promise<boolean>;
  exists(locator: string | Locator): Promise<boolean>;

  // Wait operations
  waitForElement(locator: string | Locator, options?: WaitOptions): Promise<void>;
  waitForUrl(url: string, timeout?: number): Promise<void>;

  // Form operations
  fillForm(fields: FormField[]): Promise<void>;
  selectOption(locator: string | Locator, value: string): Promise<void>;

  // Scroll operations
  scrollTo(locator: string | Locator): Promise<void>;
  scrollToTop(): Promise<void>;
  scrollToBottom(): Promise<void>;

  // Screenshot
  takeScreenshot(options?: ScreenshotOptions): Promise<string>;

  // JavaScript execution
  executeScript<T>(script: string, ...args: any[]): Promise<T>;

  // Cookie management
  getCookies(): Promise<any[]>;
  setCookie(cookie: any): Promise<void>;
  deleteCookie(name: string): Promise<void>;
  deleteAllCookies(): Promise<void>;

  // Window management
  getWindowSize(): Promise<{ width: number; height: number }>;
  setWindowSize(width: number, height: number): Promise<void>;
  maximizeWindow(): Promise<void>;

  // Framework-specific information
  getFrameworkType(): FrameworkType;
  getDriver<T = any>(): T; // Returns underlying driver instance
}
