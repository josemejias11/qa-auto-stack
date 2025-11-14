/**
 * Scroll and viewport handlers
 */

import type { Handler, HandlerResponse } from './base-handler.js';
import type { WebDriverManager } from '../webdriver/manager.js';

export class ScrollToHandler implements Handler<{ selector?: string; x?: number; y?: number }> {
  async execute(
    args: { selector?: string; x?: number; y?: number },
    webDriverManager: WebDriverManager
  ): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();

    if (args.selector) {
      const element = await driver.$(args.selector);
      await element.scrollIntoView();
      return {
        content: [
          {
            type: 'text',
            text: `Successfully scrolled to element: ${args.selector}`,
          },
        ],
      };
    } else if (args.x !== undefined && args.y !== undefined) {
      await driver.scroll(args.x, args.y);
      return {
        content: [
          {
            type: 'text',
            text: `Successfully scrolled to coordinates: (${args.x}, ${args.y})`,
          },
        ],
      };
    } else {
      throw new Error('Either selector or coordinates (x, y) must be provided');
    }
  }
}
