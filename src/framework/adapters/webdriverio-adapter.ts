/**
 * WebDriverIO Framework Adapter
 * Implements the browser automation interface using WebDriverIO
 */

import { remote, type Browser } from 'webdriverio';
import type {
  FrameworkConfig,
  Locator,
  NavigationResult,
  ScreenshotOptions,
  WaitOptions,
} from '../types.js';
import { FrameworkType } from '../types.js';
import { BaseBrowserAdapter } from '../base-adapter.js';

export class WebDriverIOAdapter extends BaseBrowserAdapter {
  declare protected driver: Browser;

  constructor(config: FrameworkConfig) {
    super(config);
  }

  async initialize(): Promise<void> {
    const capabilities: any = {
      browserName: this.config.browser || 'chrome',
      'goog:chromeOptions': {},
      'moz:firefoxOptions': {},
    };

    // Configure headless mode
    if (this.config.headless) {
      if (this.config.browser === 'chrome') {
        capabilities['goog:chromeOptions'].args = [
          '--headless=new',
          '--no-sandbox',
          '--disable-dev-shm-usage',
        ];
      } else if (this.config.browser === 'firefox') {
        capabilities['moz:firefoxOptions'].args = ['-headless'];
      }
    }

    // Configure cache for performance
    if (this.config.browser === 'chrome') {
      capabilities['goog:chromeOptions'].args = [
        ...(capabilities['goog:chromeOptions'].args || []),
        '--disk-cache-size=536870912',
        '--media-cache-size=536870912',
      ];
    }

    this.driver = await remote({
      logLevel: 'error',
      capabilities,
      waitforTimeout: this.config.timeout || 10000,
    });

    // Set viewport size
    if (this.config.viewport) {
      await this.driver.setWindowSize(this.config.viewport.width, this.config.viewport.height);
    }
  }

  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.deleteSession();
    }
  }

  async navigate(url: string): Promise<NavigationResult> {
    try {
      await this.driver.url(url);
      return { success: true, url: await this.driver.getUrl() };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async back(): Promise<void> {
    await this.driver.back();
  }

  async forward(): Promise<void> {
    await this.driver.forward();
  }

  async refresh(): Promise<void> {
    await this.driver.refresh();
  }

  async getCurrentUrl(): Promise<string> {
    return await this.driver.getUrl();
  }

  async getTitle(): Promise<string> {
    return await this.driver.getTitle();
  }

  async click(locator: string | Locator): Promise<void> {
    const element = await this.findElement(locator);
    await element.click();
  }

  async type(locator: string | Locator, text: string): Promise<void> {
    const element = await this.findElement(locator);
    await element.setValue(text);
  }

  async clear(locator: string | Locator): Promise<void> {
    const element = await this.findElement(locator);
    await element.clearValue();
  }

  async hover(locator: string | Locator): Promise<void> {
    const element = await this.findElement(locator);
    await element.moveTo();
  }

  async getText(locator: string | Locator): Promise<string> {
    const element = await this.findElement(locator);
    return await element.getText();
  }

  async getAttribute(locator: string | Locator, attribute: string): Promise<string | null> {
    const element = await this.findElement(locator);
    return await element.getAttribute(attribute);
  }

  async isVisible(locator: string | Locator): Promise<boolean> {
    try {
      const element = await this.findElement(locator);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async isEnabled(locator: string | Locator): Promise<boolean> {
    try {
      const element = await this.findElement(locator);
      return await element.isEnabled();
    } catch {
      return false;
    }
  }

  async exists(locator: string | Locator): Promise<boolean> {
    try {
      const element = await this.findElement(locator);
      return await element.isExisting();
    } catch {
      return false;
    }
  }

  async waitForElement(locator: string | Locator, options?: WaitOptions): Promise<void> {
    const timeout = this.getTimeout(options);
    const element = await this.findElement(locator);

    if (options?.visible) {
      await element.waitForDisplayed({ timeout });
    } else if (options?.enabled) {
      await element.waitForEnabled({ timeout });
    } else {
      await element.waitForExist({ timeout });
    }
  }

  async waitForUrl(url: string, timeout?: number): Promise<void> {
    const maxTimeout = timeout || this.config.timeout || 10000;
    await this.driver.waitUntil(
      async () => {
        const currentUrl = await this.driver.getUrl();
        return currentUrl.includes(url);
      },
      { timeout: maxTimeout, timeoutMsg: `URL did not contain "${url}" within ${maxTimeout}ms` }
    );
  }

  async selectOption(locator: string | Locator, value: string): Promise<void> {
    const element = await this.findElement(locator);
    await element.selectByAttribute('value', value);
  }

  async scrollTo(locator: string | Locator): Promise<void> {
    const element = await this.findElement(locator);
    await element.scrollIntoView();
  }

  async scrollToTop(): Promise<void> {
    await this.driver.execute('window.scrollTo(0, 0)');
  }

  async scrollToBottom(): Promise<void> {
    await this.driver.execute('window.scrollTo(0, document.body.scrollHeight)');
  }

  async takeScreenshot(options?: ScreenshotOptions): Promise<string> {
    const path = options?.path || 'screenshot.png';
    await this.driver.saveScreenshot(path);
    return path;
  }

  async executeScript<T>(script: string, ...args: any[]): Promise<T> {
    return (await this.driver.execute(script, ...args)) as T;
  }

  async getCookies(): Promise<any[]> {
    return await this.driver.getCookies();
  }

  async setCookie(cookie: any): Promise<void> {
    await this.driver.setCookies(cookie);
  }

  async deleteCookie(name: string): Promise<void> {
    await this.driver.deleteCookie(name);
  }

  async deleteAllCookies(): Promise<void> {
    await this.driver.deleteAllCookies();
  }

  async getWindowSize(): Promise<{ width: number; height: number }> {
    const size = await this.driver.getWindowSize();
    return { width: size.width, height: size.height };
  }

  async setWindowSize(width: number, height: number): Promise<void> {
    await this.driver.setWindowSize(width, height);
  }

  async maximizeWindow(): Promise<void> {
    await this.driver.maximizeWindow();
  }

  getFrameworkType(): FrameworkType {
    return FrameworkType.WEBDRIVERIO;
  }

  /**
   * Find element using WebDriverIO selectors
   */
  private async findElement(locator: string | Locator) {
    const loc = this.parseLocator(locator);
    let selector: string;

    switch (loc.type) {
      case 'xpath':
        selector = loc.value;
        break;
      case 'id':
        selector = `#${loc.value}`;
        break;
      case 'testid':
        selector = `[data-testid="${loc.value}"]`;
        break;
      case 'name':
        selector = `[name="${loc.value}"]`;
        break;
      case 'text':
        selector = `=${loc.value}`;
        break;
      default:
        selector = loc.value;
    }

    return await this.driver.$(selector);
  }
}
