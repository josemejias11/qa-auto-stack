/**
 * Form interaction handlers
 */

import type { Handler, HandlerResponse } from './base-handler.js';
import type { WebDriverManager } from '../webdriver/manager.js';

export class FillFormHandler
  implements Handler<{ fields: Array<{ selector: string; value: string }> }>
{
  async execute(
    args: { fields: Array<{ selector: string; value: string }> },
    webDriverManager: WebDriverManager
  ): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();

    for (const field of args.fields) {
      const element = await driver.$(field.selector);
      await element.setValue(field.value);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Successfully filled ${args.fields.length} form fields`,
        },
      ],
    };
  }
}

export class SelectOptionHandler implements Handler<{ selector: string; value: string }> {
  async execute(
    args: { selector: string; value: string },
    webDriverManager: WebDriverManager
  ): Promise<HandlerResponse> {
    const driver = await webDriverManager.getDriver();
    const element = await driver.$(args.selector);
    await element.selectByVisibleText(args.value);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully selected option "${args.value}" in ${args.selector}`,
        },
      ],
    };
  }
}
