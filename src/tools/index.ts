import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Helper function to create a tool with selector-only input
 */
function createSelectorTool(
  name: string,
  description: string,
  selectorDesc: string = 'CSS selector for the element'
): Tool {
  return {
    name,
    description,
    inputSchema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: selectorDesc,
        },
      },
      required: ['selector'],
    },
  };
}

/**
 * Helper function to create a tool with no input parameters
 */
function createNoInputTool(name: string, description: string): Tool {
  return {
    name,
    description,
    inputSchema: {
      type: 'object',
      properties: {},
    },
  };
}

export function registerWebAutomationTools(): Tool[] {
  return [
    // Navigation
    {
      name: 'navigate',
      description: 'Navigate to a specific URL in the browser',
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to navigate to',
          },
        },
        required: ['url'],
      },
    },
    createNoInputTool('go_back', 'Navigate back to the previous page'),
    createNoInputTool('go_forward', 'Navigate forward to the next page'),
    createNoInputTool('refresh_page', 'Refresh the current page'),

    // Interaction
    createSelectorTool('click', 'Click on an element specified by a CSS selector'),
    {
      name: 'type',
      description: 'Type text into an input field specified by a CSS selector',
      inputSchema: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description: 'CSS selector for the input element',
          },
          text: {
            type: 'string',
            description: 'Text to type into the element',
          },
        },
        required: ['selector', 'text'],
      },
    },
    createSelectorTool('hover', 'Hover over an element specified by a CSS selector'),

    // Inspection
    createSelectorTool(
      'get_text',
      'Get the text content of an element specified by a CSS selector',
      'CSS selector for the element to get text from'
    ),
    createNoInputTool('get_page_title', 'Get the title of the current page'),
    createNoInputTool('get_current_url', 'Get the current URL of the page'),
    createNoInputTool('screenshot', 'Take a screenshot of the current page'),

    // Forms
    {
      name: 'fill_form',
      description: 'Fill multiple form fields at once',
      inputSchema: {
        type: 'object',
        properties: {
          fields: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector for the form field',
                },
                value: {
                  type: 'string',
                  description: 'Value to enter in the field',
                },
              },
              required: ['selector', 'value'],
            },
            description: 'Array of form fields to fill',
          },
        },
        required: ['fields'],
      },
    },
    {
      name: 'select_option',
      description: 'Select an option from a dropdown menu',
      inputSchema: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description: 'CSS selector for the select element',
          },
          value: {
            type: 'string',
            description: 'Value or text of the option to select',
          },
        },
        required: ['selector', 'value'],
      },
    },

    // Wait
    {
      name: 'wait_for_element',
      description: 'Wait for an element to become visible on the page',
      inputSchema: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description: 'CSS selector for the element to wait for',
          },
          timeout: {
            type: 'number',
            description: 'Maximum time to wait in milliseconds (default: 30000)',
          },
        },
        required: ['selector'],
      },
    },

    // Scroll
    {
      name: 'scroll_to',
      description: 'Scroll to an element or specific coordinates',
      inputSchema: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description:
              'CSS selector for the element to scroll to (optional if using coordinates)',
          },
          x: {
            type: 'number',
            description: 'X coordinate to scroll to',
          },
          y: {
            type: 'number',
            description: 'Y coordinate to scroll to',
          },
        },
      },
    },
  ];
}
