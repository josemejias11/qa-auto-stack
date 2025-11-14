# QA Automation Stack

🚀 **Multi-Framework Test Automation** with TypeScript, supporting Selenium, WebDriverIO, and Cypress through a unified interface.

## 🎯 Key Feature: Multi-Framework Architecture

**Write tests once, run on ANY framework:**

```typescript
// Same test runs on Selenium, WebDriverIO, OR Cypress!
const browser = await TestHelper.init({ framework: FrameworkType.SELENIUM });
await browser.navigate('https://example.com');
await browser.click('.submit-button');
const title = await browser.getTitle();
```

Switch frameworks with a single environment variable:
```bash
FRAMEWORK=selenium npm run test:selenium
FRAMEWORK=webdriverio npm test
FRAMEWORK=cypress npm run test:cypress
```

**📚 See [FRAMEWORK.md](FRAMEWORK.md) for complete architecture documentation.**

## ✨ Features

- **🔄 Multi-Framework Support**: Selenium WebDriver, WebDriverIO, Cypress with unified API
- **⚡ Parallel Browser Testing**: Chrome, Firefox, Safari with cache optimization
- **📊 Comprehensive Test Coverage**: Smoke, accessibility, forms, links, video playback
- **🔌 API Testing**: Newman/Postman integration with Allure reporting
- **📈 Allure Reports**: Rich HTML reports with automatic server startup
- **🤖 MCP Server**: Model Context Protocol server for automation tools
- **💪 TypeScript**: Full type safety and modern development experience
- **🎨 Framework Adapter Pattern**: Easy to extend with new frameworks

## 🛠️ Tech Stack

### Supported Frameworks
- **Selenium WebDriver** (v4.27+) - Industry standard
- **WebDriverIO** (v9.20+) - Modern wrapper (default)
- **Cypress** (v13.18+) - Fast, in-browser testing

### Additional Tools
- **TypeScript** for type safety
- **Allure Reports** with JSON, JUnit, and screenshot capture
- **Axe-core** for accessibility testing
- **Newman** for API testing
- **Chromedriver/Geckodriver** services
- **Video Testing** with Wistia integration

## Quick Start

Install dependencies and build:

```bash
npm run setup
```

Run all tests (API + UI across all browsers):

```bash
npm test
```

## Test Commands

### Multi-Framework Tests (NEW!)

Run the same tests on different frameworks:

```bash
# Selenium WebDriver
npm run test:selenium
FRAMEWORK=selenium BROWSER=chrome tsx tests/runner.ts

# WebDriverIO (default)
npm test

# Cypress
npm run test:cypress
FRAMEWORK=cypress BROWSER=chrome tsx tests/runner.ts
```

Run example multi-framework test:
```bash
# On all frameworks
FRAMEWORK=selenium tsx tests/runner.ts
FRAMEWORK=webdriverio tsx tests/runner.ts
FRAMEWORK=cypress tsx tests/runner.ts
```

### Individual Test Suites

```bash
# Smoke tests (quick validation)
npm run test:smoke

# Accessibility tests
npm run test:a11y

# Contact form tests
npm run test:forms

# Link health checks
npm run test:links

# Video playback tests
npm run test:video

# API tests only
npm run test:api
```

### Browser-Specific Tests

```bash
# Chrome only
npm run test:chrome

# Firefox only
npm run test:firefox

# Safari only
npm run test:safari
```

## Configuration

### Environment Variables

```bash
# Skip browser selection, use all browsers
BROWSERS=chrome,firefox,safari npm test

# Run in headless mode
HEADLESS=1 npm test

# Skip Allure report auto-opening
SKIP_ALLURE_OPEN=1 npm test

# Enable observation mode (keeps browser open)
OBSERVE=1 npm test
```

## Reports

Allure reports are automatically generated and served at `http://127.0.0.1:60551` after test runs.

### Report Commands

```bash
# Generate report from existing results
npm run allure:generate

# Open existing report in browser
npm run allure:open

# Serve results with live reload
npm run allure:serve
```

## Development

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### MCP Server

```bash
# Start MCP server
npm start

# Development mode with hot reload
npm run dev

# Run demo
npm run demo
```

### Cleanup

```bash
# Clean all build artifacts and reports
npm run clean

# Clean only reports
npm run clean:reports

# Clean cache (npm and node_modules/.cache)
npx tsx scripts/clean-cache.ts
```

## Video Testing

The project includes comprehensive video playback testing for Newsela product pages:

- **Wistia Integration**: Detects and validates Wistia video players
- **Cross-Browser**: Tests video functionality across Chrome, Firefox, and Safari
- **Smart Detection**: Identifies video infrastructure and validates playback capability
- **Product Coverage**: Tests all pages with videos present (ELA, Social Studies, Science, Writing, Formative)

Run video tests:

```bash
npm run test:video
```

## MCP Server

Start locally (compiled):

```bash
npm run build && npm start
```

Or direct TS execution:

```bash
npm run mcp:server
```

## Scripts

### Core Development

- `build`: compile TypeScript
- `start`: run compiled MCP server
- `dev`: run MCP server in development mode (live tsx)
- `setup`: install dependencies and build
- `clean`: remove build + report artifacts
- `clean:reports`: clear report folders but keep .gitkeep

### Code Quality

- `lint`: check code style
- `lint:fix`: fix code style issues
- `format`: format code with Prettier
- `format:check`: check code formatting

### Reporting

- `allure:generate`: build static report from allure-results
- `allure:open`: serve an existing report
- `allure:regen-open`: generate then open (auto run after every test script)

### Utilities

- `mcp:server`: run MCP server directly
- `demo`: run sample script in examples/
- `validate:workflow`: YAML workflow validator script

## Reports

Generated under `reports/`:

- `allure-results` / `allure-report`
- `json` (daily aggregated JSON file)
- `junit` (daily XML)
- `wdio` (runner logs)
- `chromedriver` / `geckodriver` logs
- `screenshots` (only on failure)

- `reports/` : output artifacts (gitignored except keep files)

## Failure Artifacts

On test failure a PNG screenshot is saved under `reports/screenshots/` with a timestamp + test title.

## Cleaning

- Fast cleanup (keep folders): `npm run clean:reports`
- Full cleanup: `npm run clean`

## License

MIT
