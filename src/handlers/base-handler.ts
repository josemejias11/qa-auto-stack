/**
 * Base handler interface for all WebDriver tool handlers
 */

import type { WebDriverManager } from '../webdriver/manager.js';

/**
 * Standard response format for all handlers
 * Using `any` for flexibility with MCP SDK types
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandlerResponse = any;

/**
 * Base interface that all handlers must implement
 */
export interface Handler<TArgs = unknown> {
  /**
   * Execute the handler with the given arguments
   * @param args - Tool-specific arguments
   * @param webDriverManager - WebDriver manager instance
   * @returns Response to send back to the client
   */
  execute(args: TArgs, webDriverManager: WebDriverManager): Promise<HandlerResponse>;
}
