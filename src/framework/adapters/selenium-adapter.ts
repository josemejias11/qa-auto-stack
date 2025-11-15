/**
 * Selenium WebDriver Framework Adapter
 * Implements the browser automation interface using Selenium WebDriver
 */

import { Builder, By, until } from 'selenium-webdriver';
import type { WebDriver, WebElement } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import safari from 'selenium-webdriver/safari.js';
import type {
  FrameworkConfig,
  Locator,
  NavigationResult,
  ScreenshotOptions,
  WaitOptions,
} from '../types.js';
import { FrameworkType } from '../types.js';
import { BaseBrowserAdapter } from '../base-adapter.js';

export class SeleniumAdapter extends BaseBrowserAdapter {
  declare protected driver: WebDriver;

  constructor(config: FrameworkConfig) {
    super(config);
  }

  async initialize(): Promise<void> {
    const browser = this.config.browser || 'chrome';
    let builder = new Builder().forBrowser(browser);

    // Configure browser-specific options
    switch (browser) {
      case 'chrome': {
        const chromeOptions = new chrome.Options();
        if (this.config.headless) {
          chromeOptions.addArguments('--headless=new');
        }
        chromeOptions.addArguments(
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disk-cache-size=536870912',
          '--media-cache-size=536870912'
        );
        if (this.config.viewport) {
          chromeOptions.addArguments(
            `--window-size=${this.config.viewport.width},${this.config.viewport.height}`
          );
        }
        builder = builder.setChromeOptions(chromeOptions);
        break;
      }

      case 'firefox': {
        const firefoxOptions = new firefox.Options();
        if (this.config.headless) {
          firefoxOptions.addArguments('-headless');
        }
        if (this.config.viewport) {
          firefoxOptions.addArguments(`--width=${this.config.viewport.width}`);
          firefoxOptions.addArguments(`--height=${this.config.viewport.height}`);
        }
        builder = builder.setFirefoxOptions(firefoxOptions);
        break;
      }

      case 'safari': {
        const safariOptions = new safari.Options();
        builder = builder.setSafariOptions(safariOptions);
        break;
      }
    }

    this.driver = await builder.build();

    // Set viewport if not already set via options
    if (this.config.viewport && browser === 'safari') {
      await this.driver.manage().window().setRect({
        width: this.config.viewport.width,
        height: this.config.viewport.height,
        x: 0,
        y: 0,
      });
    }

    // Set implicit wait timeout
    await this.driver.manage().setTimeouts({ implicit: this.config.timeout || 10000 });
  }

  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.quit();
    }
  }

  async navigate(url: string): Promise<NavigationResult> {
    try {
      await this.driver.get(url);
      const currentUrl = await this.driver.getCurrentUrl();
      return { success: true, url: currentUrl };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async back(): Promise<void> {
    await this.driver.navigate().back();
  }

  async forward(): Promise<void> {
    await this.driver.navigate().forward();
  }

  async refresh(): Promise<void> {
    await this.driver.navigate().refresh();
  }

  async getCurrentUrl(): Promise<string> {
    return await this.driver.getCurrentUrl();
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
    await element.sendKeys(text);
  }

  async clear(locator: string | Locator): Promise<void> {
    const element = await this.findElement(locator);
    await element.clear();
  }

  async hover(locator: string | Locator): Promise<void> {
    const element = await this.findElement(locator);
    const actions = this.driver.actions({ async: true });
    await actions.move({ origin: element }).perform();
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
      await this.findElement(locator);
      return true;
    } catch {
      return false;
    }
  }

  async waitForElement(locator: string | Locator, options?: WaitOptions): Promise<void> {
    const timeout = this.getTimeout(options);
    const by = this.getByLocator(locator);

    if (options?.visible) {
      await this.driver.wait(until.elementIsVisible(await this.driver.findElement(by)), timeout);
    } else if (options?.enabled) {
      await this.driver.wait(until.elementIsEnabled(await this.driver.findElement(by)), timeout);
    } else {
      await this.driver.wait(until.elementLocated(by), timeout);
    }
  }

  async waitForUrl(url: string, timeout?: number): Promise<void> {
    const maxTimeout = timeout || this.config.timeout || 10000;
    await this.driver.wait(until.urlContains(url), maxTimeout);
  }

  async selectOption(locator: string | Locator, value: string): Promise<void> {
    const element = await this.findElement(locator);
    const options = await element.findElements(By.css('option'));

    for (const option of options) {
      const optionValue = await option.getAttribute('value');
      if (optionValue === value) {
        await option.click();
        return;
      }
    }

    throw new Error(`Option with value "${value}" not found`);
  }

  async scrollTo(locator: string | Locator): Promise<void> {
    const element = await this.findElement(locator);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', element);
  }

  async scrollToTop(): Promise<void> {
    await this.driver.executeScript('window.scrollTo(0, 0);');
  }

  async scrollToBottom(): Promise<void> {
    await this.driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
  }

  async takeScreenshot(_options?: ScreenshotOptions): Promise<string> {
    const screenshot = await this.driver.takeScreenshot();
    return screenshot;
  }

  async executeScript<T>(script: string, ...args: any[]): Promise<T> {
    return (await this.driver.executeScript(script, ...args)) as T;
  }

  async getCookies(): Promise<any[]> {
    return await this.driver.manage().getCookies();
  }

  async setCookie(cookie: any): Promise<void> {
    await this.driver.manage().addCookie(cookie);
  }

  async deleteCookie(name: string): Promise<void> {
    await this.driver.manage().deleteCookie(name);
  }

  async deleteAllCookies(): Promise<void> {
    await this.driver.manage().deleteAllCookies();
  }

  async getWindowSize(): Promise<{ width: number; height: number }> {
    const rect = await this.driver.manage().window().getRect();
    return { width: rect.width, height: rect.height };
  }

  async setWindowSize(width: number, height: number): Promise<void> {
    await this.driver.manage().window().setRect({ width, height, x: 0, y: 0 });
  }

  async maximizeWindow(): Promise<void> {
    await this.driver.manage().window().maximize();
  }

  getFrameworkType(): FrameworkType {
    return FrameworkType.SELENIUM;
  }

  /**
   * Find element using Selenium By locators
   */
  private async findElement(locator: string | Locator): Promise<WebElement> {
    const by = this.getByLocator(locator);
    return await this.driver.findElement(by);
  }

  /**
   * Convert locator to Selenium By object
   */
  private getByLocator(locator: string | Locator): By {
    const loc = this.parseLocator(locator);

    switch (loc.type) {
      case 'xpath':
        return By.xpath(loc.value);
      case 'id':
        return By.id(loc.value);
      case 'css':
        return By.css(loc.value);
      case 'name':
        return By.name(loc.value);
      case 'testid':
        return By.css(`[data-testid="${loc.value}"]`);
      case 'text':
        return By.xpath(`//*[contains(text(), "${loc.value}")]`);
      default:
        return By.css(loc.value);
    }
  }
}
