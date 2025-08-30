# QA Automation Stack

TypeScript WebDriverIO automation framework with parallel browser execution, Allure reporting, and comprehensive test coverage including API, UI, accessibility, forms, links, and video testing.

## Features

- **Parallel Browser Testing**: Chrome, Firefox, Safari with cache optimization
- **Comprehensive Test Coverage**: Smoke, accessibility, forms, links, video playback
- **API Testing**: Newman/Postman integration with Allure reporting
- **Allure Reports**: Rich HTML reports with automatic server startup
- **MCP Server**: Model Context Protocol server for automation tools
- **TypeScript**: Full type safety and modern development experience

## Tech Stack

- **WebDriverIO** with Mocha framework
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
```

## Project Structure

```
src/              # Source code
tests/            # Test specifications
  ├── smoke/      # Quick validation tests
  ├── accessibility/ # A11y tests
  ├── forms/      # Form interaction tests
  ├── links/      # Link health tests
  └── functional/ # Feature-specific tests
postman/          # API test collections
reports/          # Generated test reports
scripts/          # Utility scripts
examples/         # Usage examples
```

## Parallel Execution

The framework supports parallel browser execution with shared cache optimization:

- **Chrome**: 2 parallel instances with disk/media cache
- **Firefox**: 2 parallel instances with cache preferences
- **Safari**: 1 instance (Safari limitations)

Tests run significantly faster with parallel execution while maintaining reliability.
```

## Video Testing

The project includes comprehensive video playback testing for Newsela product pages:

- **Wistia Integration**: Detects and validates Wistia video players
- **Cross-Browser**: Tests video functionality across Chrome, Firefox, and Safari
- **Smart Detection**: Identifies video infrastructure and validates playback capability
- **Product Coverage**: Tests all main product pages (ELA, Social Studies, Science, Writing, Formative)

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

### Testing

- `test`: full test suite on all browsers (Chrome, Firefox, Safari) + generate & open Allure
- `test:chrome`: run tests on Chrome only
- `test:firefox`: run tests on Firefox only
- `test:safari`: run tests on Safari only
- `test:observe`: headed multi-browser with observe pauses (set OBSERVE=1 / OBSERVE_END=1)

### Specific Test Suites

- `test:smoke`: smoke spec only
- `test:a11y`: accessibility spec only
- `test:links`: link health spec
- `test:forms`: form spec
- `test:video`: video playback validation across all browsers

### Reporting

- `allure:generate`: build static report from allure-results
- `allure:open`: serve an existing report
- `allure:regen-open`: generate then open (auto run after every test script)

### Utilities

- `mcp:server`: run MCP server directly
- `demo`: run sample script in examples/
- `validate:workflow`: YAML workflow validator script

## Environment Variables

- `BROWSERS=chrome,firefox,safari` (default: chrome)
- `HEADLESS=1` (force headless for chrome/firefox)
- `OBSERVE=1` (slow start & end pauses) + `OBSERVE_END=1`
- `LOG_LEVEL=debug` (override WDIO log level)
- `SAFARI_TP=1` (use Safari Technology Preview)
- `SKIP_ALLURE_OPEN=1` (suppress auto-open of report)
- `CI` (enables single retry for flaky specs)

## Reports

Generated under `reports/`:

- `allure-results` / `allure-report`
- `json` (daily aggregated JSON file)
- `junit` (daily XML)
- `wdio` (runner logs)
- `chromedriver` / `geckodriver` logs
- `screenshots` (only on failure)

## Directory Layout

- `src/` : MCP server code & utilities
- `tests/` : spec files grouped by domain
  - `smoke/` : basic functionality tests
  - `accessibility/` : a11y validation tests
  - `links/` : link health checks
  - `forms/` : form interaction tests
  - `functional/` : advanced feature tests (e.g., video playback)
  - `helpers/` : reusable test utilities
- `scripts/` : utility scripts (clean-reports, validate-workflow)
- `examples/` : demo usage
- `reports/` : output artifacts (gitignored except keep files)

## Failure Artifacts

On test failure a PNG screenshot is saved under `reports/screenshots/` with a timestamp + test title.

## Cleaning

- Fast cleanup (keep folders): `npm run clean:reports`
- Full cleanup: `npm run clean`

## License

MIT
