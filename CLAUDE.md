# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Building and Setup
```bash
npm run setup              # Install dependencies and build
npm run build              # Compile TypeScript to dist/
```

### Testing
```bash
npm test                   # Run API tests + all UI tests across all browsers + generate Allure report
npm run test:api           # Run Newman API tests only
npm run test:smoke         # Quick smoke test (home page validation)
npm run test:a11y          # Accessibility tests with axe-core
npm run test:forms         # Contact form validation tests
npm run test:links         # Link health checks
npm run test:video         # Video playback tests across browsers

# Browser-specific
npm run test:chrome        # API + all UI tests in Chrome only
npm run test:firefox       # API + all UI tests in Firefox only
npm run test:safari        # API + all UI tests in Safari only (macOS only)
```

### Running Single Tests
```bash
npx wdio run ./wdio.conf.ts --spec ./tests/smoke/home.smoke.spec.ts
BROWSERS=chrome npx wdio run ./wdio.conf.ts --spec ./tests/forms/contact-form.spec.ts
```

### Environment Variables
```bash
BROWSERS=chrome,firefox,safari npm test    # Select specific browsers
HEADLESS=1 npm test                        # Run in headless mode
OBSERVE=1 npm test                         # Keep browser open for debugging
SKIP_ALLURE_OPEN=1 npm test                # Skip auto-opening Allure report
LOG_LEVEL=debug npm test                   # Verbose logging for debugging
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

### Reports
```bash
npm run allure:generate    # Generate static report from allure-results
npm run allure:open        # Open existing report in browser
npm run allure:serve       # Serve results with live reload
```

### Cleanup
```bash
npm run clean              # Remove dist/, reports/, test-results/
npm run clean:reports      # Clear report folders but keep .gitkeep files
npx tsx scripts/clean-cache.ts  # Clean npm and node_modules/.cache
```

## Architecture

### Project Structure
- **src/**: Shared code and MCP server implementation
  - **mcp-server.ts**: Main MCP server entry point using Handler Registry pattern
  - **handlers/**: WebDriver tool handlers (navigation, interaction, inspection, forms, wait, scroll)
  - **tools/**: MCP tool definitions and schemas
  - **webdriver/**: WebDriver manager for browser session management
  - **constants/**: Centralized selectors, timeouts, and URLs
- **tests/**: WebDriverIO test suites
  - **smoke/**: Quick validation tests
  - **accessibility/**: Axe-core accessibility tests
  - **forms/**: Form interaction and validation tests
  - **links/**: Link health checks
  - **functional/**: Feature tests including video playback
  - **helpers/**: Test utility functions
- **scripts/**: Build and automation utilities
  - **newman-to-allure.ts**: Converts Newman JSON results to Allure format
  - **clean-reports.ts**: Report cleanup utility
  - **open-allure.ts**: Opens Allure report in browser
- **postman/**: API test collections and environments
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

### WebDriverIO Configuration
- **Multi-browser support**: Chrome, Firefox, Safari via `BROWSERS` env var
- **Parallel execution**: Multiple browser instances run concurrently (Chrome/Firefox: 2, Safari: 1)
- **Window size**: Fixed 1440x900 for consistency
- **Headless mode**: Enabled with `HEADLESS=1` (Chrome: `--headless=new`, Firefox: `-headless`)
- **Cache optimization**: Disk and memory cache enabled for faster test execution
- **CI mode**: Auto-detected via `process.env.CI` with extended timeouts and retries
- **Safari support**: macOS only, requires `safaridriver --enable` (one-time setup)

### API Testing Integration
- Newman runs Postman collections before UI tests
- Results converted to Allure format via `scripts/newman-to-allure.ts`
- API tests appear in unified Allure report under "Postman" suite
- Collections stored in `postman/collections/`, environments in `postman/environments/`

### TypeScript Configuration
- **ES Modules**: Uses `"type": "module"` with `.js` imports in TypeScript files
- **Two configs**:
  - `tsconfig.json`: Main config with `noEmit: true` for IDE and type checking
  - `tsconfig.build.json`: Build config that actually emits to `dist/`
- **WebDriverIO globals**: Available via `@wdio/globals/types`

### Reporting System
All test artifacts centralized in `reports/`:
- **allure-results/**: Raw Allure test results
- **allure-report/**: Generated HTML report (served at http://127.0.0.1:60551)
- **json/**: Daily aggregated JSON files
- **junit/**: Daily XML reports
- **screenshots/**: Failure screenshots with timestamp + test title
- **wdio/**: WebDriverIO runner logs
- **chromedriver/**, **geckodriver/**: Driver logs
- **api/**: Newman JSON results

### MCP Server Tools
The MCP server exposes these WebDriver automation tools:
- **Navigation**: navigate, go_back, go_forward, refresh_page
- **Interaction**: click, type, hover
- **Inspection**: get_text, get_page_title, get_current_url, screenshot
- **Forms**: fill_form, select_option
- **Wait**: wait_for_element
- **Scroll**: scroll_to

### Constants Organization
Centralized constants in `src/constants/`:
- **selectors.ts**: CSS selectors for common elements
- **timeouts.ts**: Timeout values for waits and retries
- **urls.ts**: Base URLs and route definitions

Import pattern: `import { SELECTORS, TIMEOUTS, BASE_URL } from '../constants/index.js';`

## Development Notes

### Test Execution Flow
1. API tests run first via Newman
2. Newman results converted to Allure format
3. UI tests run across selected browsers in parallel
4. Allure report auto-generated and opened (unless `SKIP_ALLURE_OPEN=1`)

### Browser Selection Logic
- **Local**: Defaults to Chrome
- **CI**:
  - Safari on macOS runners
  - Chrome or Firefox on Ubuntu runners (job-specific)
- Override with `BROWSERS=chrome,firefox,safari`

### Failure Handling
- Screenshots saved to `reports/screenshots/` on test failure
- Allure captures screenshots in report
- Spec file retries in CI: 1 retry with 2s delay
- Connection retry: 3 attempts locally, 5 in CI

### Video Testing
Comprehensive Wistia video testing across product pages:
- Detects Wistia player infrastructure
- Validates playback capability
- Tests: ELA, Social Studies, Science, Writing, Formative pages
- Run with `npm run test:video` (all browsers by default)

### Module System
- ES Modules throughout
- Import TypeScript files with `.js` extension (e.g., `import { foo } from './bar.js'`)
- Use `tsx` for direct TypeScript execution without compilation
