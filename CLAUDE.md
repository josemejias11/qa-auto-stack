# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Multi-Framework Architecture

This project supports **THREE automation frameworks** with a unified interface:
- **Selenium WebDriver** - Industry standard, direct WebDriver API
- **WebDriverIO** - Modern wrapper with enhanced features
- **Cypress** - Fast, in-browser testing framework

**See [FRAMEWORK.md](FRAMEWORK.md) for detailed architecture documentation.**

### Framework Selection
```bash
# Run tests with Selenium
FRAMEWORK=selenium npm run test:selenium

# Run tests with WebDriverIO (default)
npm test

# Run tests with Cypress
FRAMEWORK=cypress npm run test:cypress

# Run specific test on any framework
FRAMEWORK=selenium SPEC=tests/examples/**/*.spec.ts tsx tests/runner.ts
```

## Common Commands

### Building and Setup
```bash
npm run setup              # Install dependencies and build
npm run build              # Compile TypeScript to dist/
```

### Testing
```bash
npm test                   # Run tests with WebDriverIO (default)
npm run test:all           # Run tests on ALL frameworks sequentially
npm run test:selenium      # Run tests with Selenium WebDriver
npm run test:webdriverio   # Run tests with WebDriverIO
npm run test:cypress       # Run tests with Cypress

# Browser-specific
npm run test:chrome        # Run tests in Chrome
npm run test:firefox       # Run tests in Firefox
npm run test:safari        # Run tests in Safari (macOS only)

# Headless mode
npm run test:headless      # Run tests in headless mode
```

### Running Single Tests
```bash
FRAMEWORK=selenium tsx tests/runner.ts
FRAMEWORK=webdriverio BROWSER=chrome tsx tests/runner.ts
FRAMEWORK=cypress HEADLESS=1 tsx tests/runner.ts
```

### Environment Variables
```bash
FRAMEWORK=selenium|webdriverio|cypress  # Select framework
BROWSER=chrome|firefox|safari           # Select browser
HEADLESS=1                              # Run in headless mode
TIMEOUT=15000                           # Custom timeout in ms
SPEC=tests/**/*.spec.ts                 # Test file pattern
```

### Code Quality
```bash
npm run lint               # Check code style with ESLint
npm run lint:fix           # Auto-fix linting issues
npm run format             # Format code with Prettier
npm run format:check       # Check formatting without changes
```

### MCP Server
```bash
npm run mcp:server         # Run MCP server directly with tsx
npm start                  # Run compiled MCP server (requires npm run build)
npm run dev                # Development mode with hot reload
```

### Cleanup
```bash
npm run clean              # Remove dist/, reports/, test-results/
npm run clean:reports      # Clear report folders but keep .gitkeep files
```

## Architecture

### Project Structure
- **src/**: Shared code and MCP server implementation
  - **framework/**: Multi-framework adapter system
    - **types.ts**: Common interfaces for all frameworks
    - **base-adapter.ts**: Abstract base class
    - **factory.ts**: Creates appropriate adapter based on config
    - **adapters/**: Framework-specific implementations (Selenium, WebDriverIO, Cypress)
    - **test-helper.ts**: Simplified test API
    - **config.ts**: Default configurations
  - **mcp-server.ts**: Main MCP server entry point using Handler Registry pattern
  - **handlers/**: WebDriver tool handlers (navigation, interaction, inspection, forms, wait, scroll)
  - **tools/**: MCP tool definitions and schemas
  - **webdriver/**: WebDriver manager for browser session management
- **tests/**: Test suites (framework-agnostic)
  - **examples/**: Multi-framework example tests
  - **runner.ts**: Multi-framework test runner
- **scripts/**: Build and automation utilities
  - **clean-reports.ts**: Report cleanup utility
- **reports/**: Test artifacts (gitignored except .gitkeep files)

### Handler Registry Pattern
The MCP server uses a Handler Registry pattern for clean, modular tool handling:
- **Base Handler Interface** (`src/handlers/base-handler.ts`): All handlers implement the `Handler<TArgs>` interface
- **Handler Registry** (`src/handlers/index.ts`): Maps tool names to handler instances
- **Specialized Handlers**: Each tool has its own handler class (e.g., `NavigateHandler`, `ClickHandler`)
- **Benefits**: Open/Closed principle, single responsibility, independent testability

To add a new tool:
1. Create handler class in appropriate `src/handlers/*-handlers.ts` file
2. Register in `handlerRegistry` Map in `src/handlers/index.ts`
3. Add tool definition in `src/tools/index.ts`

### Framework Configuration
- **Multi-framework support**: Selenium, WebDriverIO, Cypress via `FRAMEWORK` env var
- **Multi-browser support**: Chrome, Firefox, Safari via `BROWSER` env var
- **Window size**: Fixed 1440x900 for consistency (configurable)
- **Headless mode**: Enabled with `HEADLESS=1`
- **Cache optimization**: Disk and memory cache enabled for faster test execution
- **Safari support**: macOS only, requires `safaridriver --enable` (one-time setup)

### TypeScript Configuration
- **ES Modules**: Uses `"type": "module"` with `.js` imports in TypeScript files
- **Two configs**:
  - `tsconfig.json`: Main config with `noEmit: true` for IDE and type checking
  - `tsconfig.build.json`: Build config that actually emits to `dist/`

### MCP Server Tools
The MCP server exposes these WebDriver automation tools:
- **Navigation**: navigate, go_back, go_forward, refresh_page
- **Interaction**: click, type, hover
- **Inspection**: get_text, get_page_title, get_current_url, screenshot
- **Forms**: fill_form, select_option
- **Wait**: wait_for_element
- **Scroll**: scroll_to

## Development Notes

### Test Execution Flow
1. Initialize framework adapter based on FRAMEWORK env var
2. Run tests using Mocha test runner
3. Tests use unified IBrowserAdapter interface
4. Framework-specific implementation handles browser automation
5. Clean up browser session after tests complete

### Browser Selection Logic
- **Local**: Defaults to Chrome
- Override with `BROWSER=chrome|firefox|safari`
- Framework support varies:
  - Selenium: All browsers
  - WebDriverIO: All browsers
  - Cypress: Chrome, Firefox, Edge (no Safari)

### Framework-Specific Notes

#### Selenium WebDriver
- Direct WebDriver API access
- Broadest browser support
- Most mature and stable
- Best for cross-browser testing

#### WebDriverIO
- Modern API wrapper around Selenium
- Better developer experience
- Built-in retry and wait mechanisms
- Excellent documentation

#### Cypress
- Runs IN the browser (different architecture)
- Very fast test execution
- Excellent debugging capabilities
- Limited to Chrome, Firefox, Edge
- **Note:** XPath not natively supported (use CSS selectors)

### Module System
- ES Modules throughout
- Import TypeScript files with `.js` extension (e.g., `import { foo } from './bar.js'`)
- Use `tsx` for direct TypeScript execution without compilation