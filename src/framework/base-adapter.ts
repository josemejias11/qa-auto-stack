/**
 * Base Browser Adapter
 * Abstract base class providing common functionality for all framework adapters
 */

import type {
  FrameworkConfig,
  IBrowserAdapter,
  Locator,
  NavigationResult,
  ScreenshotOptions,
  WaitOptions,
  FormField,
  Cookie,
} from './types.js';
import type { FrameworkType } from './types.js';

export abstract class BaseBrowserAdapter implements IBrowserAdapter {
  protected config: FrameworkConfig;
  protected driver: unknown;

  constructor(config: FrameworkConfig) {
    this.config = {
      timeout: 10000,
      screenshots: true,
      viewport: { width: 1440, height: 900 },
      ...config,
    };
  }

  // Abstract methods that must be implemented by each adapter
  abstract initialize(): Promise<void>;
  abstract close(): Promise<void>;
  abstract navigate(url: string): Promise<NavigationResult>;
  abstract back(): Promise<void>;
  abstract forward(): Promise<void>;
  abstract refresh(): Promise<void>;
  abstract getCurrentUrl(): Promise<string>;
  abstract getTitle(): Promise<string>;
  abstract click(locator: string | Locator): Promise<void>;
  abstract type(locator: string | Locator, text: string): Promise<void>;
  abstract clear(locator: string | Locator): Promise<void>;
  abstract hover(locator: string | Locator): Promise<void>;
  abstract getText(locator: string | Locator): Promise<string>;
  abstract getAttribute(locator: string | Locator, attribute: string): Promise<string | null>;
  abstract isVisible(locator: string | Locator): Promise<boolean>;
  abstract isEnabled(locator: string | Locator): Promise<boolean>;
  abstract exists(locator: string | Locator): Promise<boolean>;
  abstract waitForElement(locator: string | Locator, options?: WaitOptions): Promise<void>;
  abstract waitForUrl(url: string, timeout?: number): Promise<void>;
  abstract selectOption(locator: string | Locator, value: string): Promise<void>;
  abstract scrollTo(locator: string | Locator): Promise<void>;
  abstract scrollToTop(): Promise<void>;
  abstract scrollToBottom(): Promise<void>;
  abstract takeScreenshot(options?: ScreenshotOptions): Promise<string>;
  abstract executeScript<T>(script: string, ...args: unknown[]): Promise<T>;
  abstract getCookies(): Promise<Cookie[]>;
  abstract setCookie(cookie: Cookie): Promise<void>;
  abstract deleteCookie(name: string): Promise<void>;
  abstract deleteAllCookies(): Promise<void>;
  abstract getWindowSize(): Promise<{ width: number; height: number }>;
  abstract setWindowSize(width: number, height: number): Promise<void>;
  abstract maximizeWindow(): Promise<void>;

  /**
   * Fill multiple form fields
   */
  async fillForm(fields: FormField[]): Promise<void> {
    for (const field of fields) {
      const { locator, value, type = 'input' } = field;

      switch (type) {
        case 'select':
          await this.selectOption(locator, value);
          break;
        case 'checkbox': {
          const isChecked = await this.getAttribute(locator, 'checked');
          const shouldCheck = value === 'true' || value === '1';
          if ((isChecked !== null) !== shouldCheck) {
            await this.click(locator);
          }
          break;
        }
        case 'radio':
          await this.click(locator);
          break;
        default:
          await this.clear(locator);
          await this.type(locator, value);
      }
    }
  }

  /**
   * Get the framework type
   */
  abstract getFrameworkType(): FrameworkType;

  /**
   * Get the underlying driver instance
   */
  getDriver<T = unknown>(): T {
    return this.driver as T;
  }

  /**
   * Convert string locator to Locator object
   */
  protected parseLocator(locator: string | Locator): Locator {
    if (typeof locator === 'object') {
      return locator;
    }

    // Default to CSS selector if string is provided
    if (locator.startsWith('//')) {
      return { type: 'xpath', value: locator };
    } else if (locator.startsWith('#')) {
      return { type: 'id', value: locator.substring(1) };
    } else if (locator.startsWith('[data-testid=')) {
      return {
        type: 'testid',
        value: locator.match(/\[data-testid=['"](.+)['"]\]/)?.[1] || locator,
      };
    }

    return { type: 'css', value: locator };
  }

  /**
   * Get timeout from options or use default
   */
  protected getTimeout(options?: WaitOptions): number {
    return options?.timeout || this.config.timeout || 10000;
  }
}
