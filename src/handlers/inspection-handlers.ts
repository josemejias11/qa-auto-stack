/**
 * Page inspection handlers (get text, title, URL, screenshot)
 */

import type { Handler, HandlerResponse } from './base-handler.js';
import type { WebDriverManager } from '../webdriver/manager.js';

export class GetTextHandler implements Handler<{ selector: string }> {
  async execute(
    args: { selector: string },
    webDriverManager: WebDriverManager
  ): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    const element = await driver.$(args.selector);
    const text = await element.getText();

    return {
      content: [
        {
          type: 'text',
          text: `Text from ${args.selector}: ${text}`,
        },
      ],
    };
  }
}

export class GetPageTitleHandler implements Handler {
  async execute(_args: unknown, webDriverManager: WebDriverManager): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    const title = await driver.getTitle();

    return {
      content: [
        {
          type: 'text',
          text: `Page title: ${title}`,
        },
      ],
    };
  }
}

export class GetCurrentUrlHandler implements Handler {
  async execute(_args: unknown, webDriverManager: WebDriverManager): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    const url = await driver.getUrl();

    return {
      content: [
        {
          type: 'text',
          text: `Current URL: ${url}`,
        },
      ],
    };
  }
}

export class ScreenshotHandler implements Handler {
  async execute(_args: unknown, webDriverManager: WebDriverManager): Promise<HandlerResponse> {
    const screenshotPath = await webDriverManager.takeScreenshot();
    const driver = await webDriverManager.getDriver();
    const screenshot = await driver.takeScreenshot();

    return {
      content: [
        {
          type: 'text',
          text: `Screenshot captured successfully and saved to: ${screenshotPath}`,
        },
        {
          type: 'image',
          data: screenshot,
          mimeType: 'image/png',
        },
      ],
    };
  }
}
