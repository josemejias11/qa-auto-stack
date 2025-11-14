/**
 * Handler Registry - Central registry for all tool handlers
 *
 * This module implements the Handler Registry pattern, replacing the
 * monolithic switch statement with a modular, extensible architecture.
 *
 * Benefits:
 * - Open/Closed Principle: New handlers can be added without modifying existing code
 * - Single Responsibility: Each handler focuses on one specific tool
 * - Testability: Handlers can be unit tested independently
 * - Maintainability: Changes to one tool don't affect others
 */

import type { Handler } from './base-handler.js';

// Navigation handlers
import {
  NavigateHandler,
  GoBackHandler,
  GoForwardHandler,
  RefreshPageHandler,
} from './navigation-handlers.js';

// Interaction handlers
import { ClickHandler, TypeHandler, HoverHandler } from './interaction-handlers.js';

// Inspection handlers
import {
  GetTextHandler,
  GetPageTitleHandler,
  GetCurrentUrlHandler,
  ScreenshotHandler,
} from './inspection-handlers.js';

// Form handlers
import { FillFormHandler, SelectOptionHandler } from './form-handlers.js';

// Wait handlers
import { WaitForElementHandler } from './wait-handlers.js';

// Scroll handlers
import { ScrollToHandler } from './scroll-handlers.js';

/**
 * Handler registry - maps tool names to their handler instances
 */
export const handlerRegistry = new Map<string, Handler>([
  // Navigation
  ['navigate', new NavigateHandler()],
  ['go_back', new GoBackHandler()],
  ['go_forward', new GoForwardHandler()],
  ['refresh_page', new RefreshPageHandler()],

  // Interaction
  ['click', new ClickHandler()],
  ['type', new TypeHandler()],
  ['hover', new HoverHandler()],

  // Inspection
  ['get_text', new GetTextHandler()],
  ['get_page_title', new GetPageTitleHandler()],
  ['get_current_url', new GetCurrentUrlHandler()],
  ['screenshot', new ScreenshotHandler()],

  // Forms
  ['fill_form', new FillFormHandler()],
  ['select_option', new SelectOptionHandler()],

  // Wait
  ['wait_for_element', new WaitForElementHandler()],

  // Scroll
  ['scroll_to', new ScrollToHandler()],
]);

/**
 * Get a handler by tool name
 * @param toolName - Name of the tool
 * @returns Handler instance or undefined if not found
 */
export function getHandler(toolName: string): Handler | undefined {
  return handlerRegistry.get(toolName);
}

/**
 * Register a new handler
 * @param toolName - Name of the tool
 * @param handler - Handler instance
 */
export function registerHandler(toolName: string, handler: Handler): void {
  handlerRegistry.set(toolName, handler);
}

// Export types for external use
export type { Handler, HandlerResponse } from './base-handler.js';
