# QA Automation Stack - MCP Server

 **Model Context Protocol Server for Multi-Framework Browser Automation** - WebDriver automation tools accessible via MCP with support for Selenium, WebDriverIO, and Cypress.

##  Overview

An MCP (Model Context Protocol) server that provides browser automation capabilities through a unified interface. The server exposes WebDriver automation tools that AI assistants can use to interact with web browsers.

**Key Features:**
- **MCP Server**: Exposes browser automation as MCP tools
- **Multi-Framework Support**: Adapters for Selenium, WebDriverIO, and Cypress
- **Unified API**: Framework-agnostic interface for browser automation
- **Type-Safe**: Full TypeScript implementation with proper type definitions
- **Clean Architecture**: Handler Registry pattern for extensible tool handling

##  Tech Stack

### Core Dependencies
- **@modelcontextprotocol/sdk** (^1.22.0) - MCP server implementation
- **yaml** (^2.8.1) - Configuration file support
- **TypeScript** (5.0+) - Type safety and modern development

### Optional Framework Adapters (Peer Dependencies)
- **Selenium WebDriver** (^4.27.0) - Industry standard WebDriver API
- **WebDriverIO** (^9.20.0) - Modern wrapper with enhanced features
- **Cypress** (^13.16.0) - Fast, in-browser testing framework

> **Note:** Framework dependencies are optional peer dependencies. Install only what you need:
> ```bash
> npm install selenium-webdriver webdriverio cypress
> ```

##  Quick Start

### 1. Install Dependencies

```bash
# Use --ignore-scripts to avoid binary download failures
npm install --ignore-scripts
```

Or use the setup script:

```bash
npm run setup
```

### 2. Build the Project

```bash
npm run build
```

### 3. Start MCP Server

```bash
# Development mode (TypeScript)
npm run dev

# Production mode (compiled)
npm start

# Or directly
npm run mcp:server
```

## Available Scripts

```bash
npm run build          # Compile TypeScript to dist/
npm start              # Run compiled MCP server
npm run dev            # Run MCP server in development mode
npm run setup          # Install deps (--ignore-scripts) + build
npm run clean          # Remove dist/, reports/, test-results/
npm run lint           # Check code style with ESLint
npm run lint:fix       # Auto-fix linting issues
npm run format         # Format code with Prettier
npm run format:check   # Check formatting without changes
npm run mcp:server     # Run MCP server with tsx
```

## MCP Tools

The MCP server exposes the following browser automation tools:

### Navigation Tools
- `navigate` - Navigate to a URL
- `go_back` - Go back in browser history
- `go_forward` - Go forward in browser history
- `refresh_page` - Refresh the current page

### Interaction Tools
- `click` - Click an element
- `type` - Type text into an element
- `hover` - Hover over an element

### Inspection Tools
- `get_text` - Get text content of an element
- `get_page_title` - Get the current page title
- `get_current_url` - Get the current URL
- `screenshot` - Take a screenshot

### Form Tools
- `fill_form` - Fill multiple form fields
- `select_option` - Select an option from a dropdown

### Wait Tools
- `wait_for_element` - Wait for an element to appear

### Scroll Tools
- `scroll_to` - Scroll to a specific element

## Architecture

### Project Structure

```
src/
├── mcp-server.ts              # MCP server entry point
├── framework/                 # Multi-framework adapter system
│   ├── types.ts              # Common interfaces
│   ├── base-adapter.ts       # Abstract base class
│   ├── factory.ts            # Creates appropriate adapter
│   ├── config.ts             # Default configurations
│   ├── test-helper.ts        # Simplified API
│   └── adapters/             # Framework implementations
│       ├── selenium-adapter.ts
│       ├── webdriverio-adapter.ts
│       └── cypress-adapter.ts
├── handlers/                  # MCP tool handlers
│   ├── base-handler.ts       # Handler interface
│   ├── navigation-handlers.ts
│   ├── interaction-handlers.ts
│   ├── inspection-handlers.ts
│   ├── form-handlers.ts
│   ├── wait-handlers.ts
│   ├── scroll-handlers.ts
│   └── index.ts              # Handler registry
├── tools/                     # MCP tool definitions
│   └── index.ts              # Tool schemas
└── webdriver/                 # WebDriver manager
    └── manager.ts            # Browser session management
```

### Handler Registry Pattern

The MCP server uses a clean Handler Registry pattern:

1. **Base Handler Interface**: All handlers implement `Handler<TArgs>`
2. **Handler Registry**: Maps tool names to handler instances
3. **Specialized Handlers**: Each tool has its own handler class
4. **Benefits**: Open/Closed principle, single responsibility, testable

#### Adding New Tools

1. Create handler class in `src/handlers/*-handlers.ts`
2. Register in `handlerRegistry` Map in `src/handlers/index.ts`
3. Add tool definition in `src/tools/index.ts`

### Framework Adapter Pattern

The unified browser automation API works across multiple frameworks:

```typescript
// All frameworks support the same interface
interface IBrowserAdapter {
  // Navigation
  navigate(url: string): Promise<NavigationResult>;
  back(): Promise<void>;
  forward(): Promise<void>;

  // Interaction
  click(locator: string | Locator): Promise<void>;
  type(locator: string | Locator, text: string): Promise<void>;

  // Inspection
  getText(locator: string | Locator): Promise<string>;
  isVisible(locator: string | Locator): Promise<boolean>;

  // ... and many more
}
```

## Configuration

### Framework Selection

Configure which browser automation framework to use:

```typescript
import { FrameworkFactory, FrameworkType } from './src/framework/index.js';

// Create adapter
const browser = FrameworkFactory.createAdapter({
  framework: FrameworkType.SELENIUM, // or WEBDRIVERIO, CYPRESS
  browser: 'chrome',
  headless: true,
  timeout: 10000,
  viewport: { width: 1440, height: 900 }
});

await browser.initialize();
await browser.navigate('https://example.com');
await browser.close();
```

### Environment Variables

```bash
FRAMEWORK=selenium|webdriverio|cypress   # Framework selection
BROWSER=chrome|firefox|safari            # Browser selection
HEADLESS=1                               # Headless mode
TIMEOUT=15000                            # Custom timeout (ms)
```

## Installation Notes

### Why `--ignore-scripts`?

We use `--ignore-scripts` to avoid:
- **Binary downloads** - chromedriver, geckodriver, Cypress binary
- **Network failures** - Download 403 errors in CI/CD environments
- **Deprecation warnings** - Cleaner install output

The `.npmrc` file sets `loglevel=error` to suppress deprecation warnings from deep dependency chains.

### Installing Framework Dependencies

Framework dependencies are **optional peer dependencies**. Install only what you need:

```bash
# Install all frameworks
npm install selenium-webdriver webdriverio cypress --ignore-scripts

# Or install specific frameworks
npm install selenium-webdriver --save-dev
npm install webdriverio --save-dev
npm install cypress --save-dev --ignore-scripts
```

## Type Safety

All `any` types have been replaced with proper TypeScript types:

- `Cookie` interface for cookie operations
- `unknown` for generic driver and script arguments
- Proper type guards for framework capabilities
- Full type inference throughout the codebase

## Benefits

### 1. **MCP Integration**
Browser automation accessible to AI assistants via Model Context Protocol.

### 2. **Framework Independence**
Not locked into any single framework. Switch adapters without rewriting tools.

### 3. **Clean Architecture**
Handler Registry pattern makes adding new tools straightforward.

### 4. **Type Safety**
Full TypeScript support with proper type definitions.

### 5. **Extensible**
Easy to add new automation frameworks or MCP tools.

### 6. **Production Ready**
Clean install, no deprecation warnings, proper error handling.

## Adding New Frameworks

To add support for a new framework (e.g., Playwright):

1. Create `src/framework/adapters/playwright-adapter.ts`
2. Implement `IBrowserAdapter` interface
3. Extend `BaseBrowserAdapter` base class
4. Add to `FrameworkFactory` in `factory.ts`
5. Update `FrameworkType` enum in `types.ts`
6. Add as peer dependency in `package.json`

Example:

```typescript
import { BaseBrowserAdapter } from '../base-adapter.js';
import type { IBrowserAdapter } from '../types.js';

export class PlaywrightAdapter extends BaseBrowserAdapter implements IBrowserAdapter {
  async initialize(): Promise<void> {
    // Playwright-specific initialization
  }

  async navigate(url: string): Promise<NavigationResult> {
    // Playwright-specific navigation
  }

  // ... implement all interface methods
}
```

## Code Quality

```bash
# Linting
npm run lint           # Check code style
npm run lint:fix       # Auto-fix issues

# Formatting
npm run format         # Format all files
npm run format:check   # Check without changes

# Type Checking
npm run build          # TypeScript compilation check
```

