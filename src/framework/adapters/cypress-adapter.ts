/**
 * Cypress Framework Adapter
 * Implements the browser automation interface using Cypress
 *
 * Note: Cypress has a unique architecture where tests run IN the browser.
 * This adapter provides a programmatic interface similar to other frameworks,
 * but some operations are deferred to Cypress's command queue.
 */

import type Cypress from 'cypress';
import {
  FrameworkConfig,
  FrameworkType,
  Locator,
  NavigationResult,
  ScreenshotOptions,
  WaitOptions,
} from '../types.js';
import { BaseBrowserAdapter } from '../base-adapter.js';

export class CypressAdapter extends BaseBrowserAdapter {
  protected driver!: typeof Cypress;
  private cypressInstance: any;

  constructor(config: FrameworkConfig) {
    super(config);
  }

  async initialize(): Promise<void> {
    // Dynamic import of Cypress to avoid bundling issues
    const cypress = await import('cypress');

    const cypressConfig: Partial<Cypress.ConfigOptions> = {
      browser: this.config.browser || 'chrome',
      headless: this.config.headless ?? true,
      viewportWidth: this.config.viewport?.width || 1440,
      viewportHeight: this.config.viewport?.height || 900,
      defaultCommandTimeout: this.config.timeout || 10000,
      screenshotsFolder: 'reports/screenshots',
      videosFolder: 'reports/videos',
      video: false,
    };

    // Open Cypress programmatically
    this.cypressInstance = await cypress.default.open({
      configFile: false,
      config: cypressConfig,
      browser: this.config.browser || 'chrome',
    });
  }

  async close(): Promise<void> {
    if (this.cypressInstance) {
      await this.cypressInstance.close();
    }
  }

  async navigate(url: string): Promise<NavigationResult> {
    try {
      return await this.runCypressCommand(() => {
        cy.visit(url);
        return cy.url().then((currentUrl) => ({
          success: true,
          url: currentUrl,
        }));
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async back(): Promise<void> {
    await this.runCypressCommand(() => {
      cy.go('back');
    });
  }

  async forward(): Promise<void> {
    await this.runCypressCommand(() => {
      cy.go('forward');
    });
  }

  async refresh(): Promise<void> {
    await this.runCypressCommand(() => {
      cy.reload();
    });
  }

  async getCurrentUrl(): Promise<string> {
    return await this.runCypressCommand(() => {
      return cy.url();
    });
  }

  async getTitle(): Promise<string> {
    return await this.runCypressCommand(() => {
      return cy.title();
    });
  }

  async click(locator: string | Locator): Promise<void> {
    await this.runCypressCommand(() => {
      this.getCypressElement(locator).click();
    });
  }

  async type(locator: string | Locator, text: string): Promise<void> {
    await this.runCypressCommand(() => {
      this.getCypressElement(locator).type(text);
    });
  }

  async clear(locator: string | Locator): Promise<void> {
    await this.runCypressCommand(() => {
      this.getCypressElement(locator).clear();
    });
  }

  async hover(locator: string | Locator): Promise<void> {
    await this.runCypressCommand(() => {
      this.getCypressElement(locator).trigger('mouseover');
    });
  }

  async getText(locator: string | Locator): Promise<string> {
    return await this.runCypressCommand(() => {
      return this.getCypressElement(locator).invoke('text');
    });
  }

  async getAttribute(locator: string | Locator, attribute: string): Promise<string | null> {
    return await this.runCypressCommand(() => {
      return this.getCypressElement(locator).invoke('attr', attribute);
    });
  }

  async isVisible(locator: string | Locator): Promise<boolean> {
    return await this.runCypressCommand(() => {
      return this.getCypressElement(locator)
        .should('exist')
        .then(($el) => $el.is(':visible'));
    });
  }

  async isEnabled(locator: string | Locator): Promise<boolean> {
    return await this.runCypressCommand(() => {
      return this.getCypressElement(locator)
        .should('exist')
        .then(($el) => !$el.is(':disabled'));
    });
  }

  async exists(locator: string | Locator): Promise<boolean> {
    return await this.runCypressCommand(() => {
      const selector = this.getCypressSelector(locator);
      return cy.get('body').then(($body) => {
        return $body.find(selector).length > 0;
      });
    });
  }

  async waitForElement(locator: string | Locator, options?: WaitOptions): Promise<void> {
    const timeout = this.getTimeout(options);
    await this.runCypressCommand(() => {
      const element = this.getCypressElement(locator);

      if (options?.visible) {
        element.should('be.visible', { timeout });
      } else if (options?.enabled) {
        element.should('be.enabled', { timeout });
      } else {
        element.should('exist', { timeout });
      }
    });
  }

  async waitForUrl(url: string, timeout?: number): Promise<void> {
    const maxTimeout = timeout || this.config.timeout || 10000;
    await this.runCypressCommand(() => {
      cy.url({ timeout: maxTimeout }).should('include', url);
    });
  }

  async selectOption(locator: string | Locator, value: string): Promise<void> {
    await this.runCypressCommand(() => {
      this.getCypressElement(locator).select(value);
    });
  }

  async scrollTo(locator: string | Locator): Promise<void> {
    await this.runCypressCommand(() => {
      this.getCypressElement(locator).scrollIntoView();
    });
  }

  async scrollToTop(): Promise<void> {
    await this.runCypressCommand(() => {
      cy.scrollTo('top');
    });
  }

  async scrollToBottom(): Promise<void> {
    await this.runCypressCommand(() => {
      cy.scrollTo('bottom');
    });
  }

  async takeScreenshot(options?: ScreenshotOptions): Promise<string> {
    return await this.runCypressCommand(() => {
      const filename = options?.path || 'screenshot';
      cy.screenshot(filename, { overwrite: true });
      return Promise.resolve(filename);
    });
  }

  async executeScript<T>(script: string, ...args: any[]): Promise<T> {
    return await this.runCypressCommand(() => {
      return cy.window().then((win) => {
        const func = new Function('window', ...args.map((_, i) => `arg${i}`), `return ${script}`);
        return func(win, ...args);
      });
    });
  }

  async getCookies(): Promise<any[]> {
    return await this.runCypressCommand(() => {
      return cy.getCookies();
    });
  }

  async setCookie(cookie: any): Promise<void> {
    await this.runCypressCommand(() => {
      cy.setCookie(cookie.name, cookie.value, cookie);
    });
  }

  async deleteCookie(name: string): Promise<void> {
    await this.runCypressCommand(() => {
      cy.clearCookie(name);
    });
  }

  async deleteAllCookies(): Promise<void> {
    await this.runCypressCommand(() => {
      cy.clearCookies();
    });
  }

  async getWindowSize(): Promise<{ width: number; height: number }> {
    return await this.runCypressCommand(() => {
      return cy.window().then((win) => ({
        width: win.innerWidth,
        height: win.innerHeight,
      }));
    });
  }

  async setWindowSize(width: number, height: number): Promise<void> {
    await this.runCypressCommand(() => {
      cy.viewport(width, height);
    });
  }

  async maximizeWindow(): Promise<void> {
    // Cypress doesn't have native maximize, set to common large size
    await this.setWindowSize(1920, 1080);
  }

  getFrameworkType(): FrameworkType {
    return FrameworkType.CYPRESS;
  }

  /**
   * Get Cypress element using the appropriate selector
   */
  private getCypressElement(locator: string | Locator) {
    const selector = this.getCypressSelector(locator);
    return cy.get(selector);
  }

  /**
   * Convert locator to Cypress selector string
   */
  private getCypressSelector(locator: string | Locator): string {
    const loc = this.parseLocator(locator);

    switch (loc.type) {
      case 'xpath':
        // Cypress doesn't natively support XPath, need plugin
        throw new Error('XPath selectors require cypress-xpath plugin. Use CSS selectors instead.');
      case 'id':
        return `#${loc.value}`;
      case 'testid':
        return `[data-testid="${loc.value}"]`;
      case 'name':
        return `[name="${loc.value}"]`;
      case 'text':
        return `:contains("${loc.value}")`;
      default:
        return loc.value;
    }
  }

  /**
   * Run Cypress command and return the result
   * This wraps Cypress commands to work with our Promise-based API
   */
  private async runCypressCommand<T>(command: () => T | Cypress.Chainable<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        const result = command();
        if (result && typeof result === 'object' && 'then' in result) {
          (result as Cypress.Chainable<T>).then(
            (value) => resolve(value as T),
            (error) => reject(error)
          );
        } else {
          resolve(result as T);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
