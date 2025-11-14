/**
 * Navigation-related handlers
 */

import type { Handler, HandlerResponse } from './base-handler.js';
import type { WebDriverManager } from '../webdriver/manager.js';

export class NavigateHandler implements Handler<{ url: string }> {
  async execute(
    args: { url: string },
    webDriverManager: WebDriverManager
  ): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    await driver.url(args.url);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully navigated to ${args.url}`,
        },
      ],
    };
  }
}

export class GoBackHandler implements Handler {
  async execute(_args: unknown, webDriverManager: WebDriverManager): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    await driver.back();

    return {
      content: [
        {
          type: 'text',
          text: 'Navigated back to previous page',
        },
      ],
    };
  }
}

export class GoForwardHandler implements Handler {
  async execute(_args: unknown, webDriverManager: WebDriverManager): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    await driver.forward();

    return {
      content: [
        {
          type: 'text',
          text: 'Navigated forward to next page',
        },
      ],
    };
  }
}

export class RefreshPageHandler implements Handler {
  async execute(_args: unknown, webDriverManager: WebDriverManager): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    await driver.refresh();

    return {
      content: [
        {
          type: 'text',
          text: 'Page refreshed successfully',
        },
      ],
    };
  }
}
