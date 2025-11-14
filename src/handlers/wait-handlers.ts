/**
 * Wait and synchronization handlers
 */

import type { Handler, HandlerResponse } from './base-handler.js';
import type { WebDriverManager } from '../webdriver/manager.js';

export class WaitForElementHandler implements Handler<{ selector: string; timeout?: number }> {
  async execute(
    args: { selector: string; timeout?: number },
    webDriverManager: WebDriverManager
  ): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    const element = await driver.$(args.selector);
    await element.waitForDisplayed({ timeout: args.timeout || 30000 });

    return {
      content: [
        {
          type: 'text',
          text: `Element ${args.selector} is now visible`,
        },
      ],
    };
  }
}
