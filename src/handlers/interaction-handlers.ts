/**
 * User interaction handlers (click, type, hover)
 */

import type { Handler, HandlerResponse } from './base-handler.js';
import type { WebDriverManager } from '../webdriver/manager.js';

export class ClickHandler implements Handler<{ selector: string }> {
  async execute(
    args: { selector: string },
    webDriverManager: WebDriverManager
  ): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    const element = await driver.$(args.selector);
    await element.click();

    return {
      content: [
        {
          type: 'text',
          text: `Successfully clicked element with selector: ${args.selector}`,
        },
      ],
    };
  }
}

export class TypeHandler implements Handler<{ selector: string; text: string }> {
  async execute(
    args: { selector: string; text: string },
    webDriverManager: WebDriverManager
  ): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    const element = await driver.$(args.selector);
    await element.setValue(args.text);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully typed "${args.text}" into element: ${args.selector}`,
        },
      ],
    };
  }
}

export class HoverHandler implements Handler<{ selector: string }> {
  async execute(
    args: { selector: string },
    webDriverManager: WebDriverManager
  ): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    const element = await driver.$(args.selector);
    await element.moveTo();

    return {
      content: [
        {
          type: 'text',
          text: `Successfully hovered over element: ${args.selector}`,
        },
      ],
    };
  }
}
