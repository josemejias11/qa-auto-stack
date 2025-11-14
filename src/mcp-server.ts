import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { WebDriverManager } from './webdriver/manager.js';
import { registerWebAutomationTools } from './tools/index.js';
import { getHandler } from './handlers/index.js';

/**
 * MCP WebDriver Server
 *
 * Implements the Model Context Protocol (MCP) for browser automation using WebDriverIO.
 * Uses the Handler Registry pattern for clean, extensible tool handling.
 */
class MCPWebDriverServer {
  private server: Server;
  private webDriverManager: WebDriverManager;

  constructor() {
    this.server = new Server({
      name: 'webdriver-mcp-server',
      version: '1.0.0',
    });

    this.webDriverManager = new WebDriverManager();
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: registerWebAutomationTools(),
      };
    });

    // Handle tool calls using the handler registry
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Look up the handler from the registry
        const handler = getHandler(name);

        if (!handler) {
          throw new Error(`Unknown tool: ${name}`);
        }

        // Execute the handler with the provided arguments
        return await handler.execute(args, this.webDriverManager);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Tool execution failed: ${errorMessage}`);
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP WebDriver Server running on stdio');
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MCPWebDriverServer();
  server.run().catch(console.error);
}

export { MCPWebDriverServer };
