# QA Automation Stack

🚀 **Multi-Framework Test Automation** with TypeScript - Write tests once, run on Selenium, WebDriverIO, or Cypress.

## 🎯 Key Feature: Framework-Agnostic Testing

**Write tests once, run on ANY framework:**

```typescript
// Same test code runs on Selenium, WebDriverIO, OR Cypress!
import { TestHelper } from './src/framework/test-helper.js';
import { FrameworkType } from './src/framework/types.js';

const browser = await TestHelper.init({
  framework: FrameworkType.SELENIUM, // or WEBDRIVERIO, or CYPRESS
  browser: 'chrome',
  headless: true,
});

await browser.navigate('https://example.com');
await browser.click('.submit-button');
const title = await browser.getTitle();
```

**Switch frameworks with a single environment variable:**
```bash
FRAMEWORK=selenium npm run test:selenium
FRAMEWORK=webdriverio npm run test:webdriverio
FRAMEWORK=cypress npm run test:cypress
```

**📚 See [FRAMEWORK.md](FRAMEWORK.md) for complete architecture documentation.**

## ✨ Features

- **🔄 Multi-Framework Support**: Unified API for Selenium WebDriver, WebDriverIO, and Cypress
- **🎨 Adapter Pattern**: Clean architecture with framework-specific adapters
- **⚡ Easy Framework Switching**: Change frameworks without rewriting tests
- **💪 TypeScript**: Full type safety and modern development experience
- **🔌 Extensible**: Easy to add new frameworks (Playwright, TestCafe, etc.)
- **🤖 MCP Server**: Model Context Protocol server for automation tools
- **📦 Zero Vendor Lock-in**: Not tied to any single framework

## 🛠️ Tech Stack

### Supported Frameworks
- **Selenium WebDriver** (v4.27+) - Industry standard, broadest browser support
- **WebDriverIO** (v9.20+) - Modern wrapper with enhanced features
- **Cypress** (v13.18+) - Fast, in-browser testing framework

### Additional Tools
- **TypeScript** 5.0+ for type safety
- **Mocha** for test running
- **Chai** for assertions
- **Chromedriver/Geckodriver** for browser automation

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Run Example Tests

```bash
# Run with WebDriverIO (default)
npm test

# Run with Selenium
npm run test:selenium

# Run with Cypress
npm run test:cypress

# Run on all frameworks
npm run test:all
```

## 📝 Test Commands

### Framework-Specific Tests

```bash
# Selenium WebDriver
npm run test:selenium
FRAMEWORK=selenium tsx tests/runner.ts

# WebDriverIO
npm run test:webdriverio
FRAMEWORK=webdriverio tsx tests/runner.ts

# Cypress
npm run test:cypress
FRAMEWORK=cypress tsx tests/runner.ts

# All frameworks sequentially
npm run test:all
```

### Browser-Specific Tests

```bash
# Chrome
npm run test:chrome
BROWSER=chrome tsx tests/runner.ts

# Firefox
npm run test:firefox
BROWSER=firefox tsx tests/runner.ts

# Safari (macOS only)
npm run test:safari
BROWSER=safari tsx tests/runner.ts

# Headless mode
npm run test:headless
HEADLESS=1 tsx tests/runner.ts
```

### Custom Test Runs

```bash
# Specific framework + browser + headless
FRAMEWORK=selenium BROWSER=firefox HEADLESS=1 tsx tests/runner.ts

# Run specific test file
FRAMEWORK=cypress SPEC=tests/examples/**/*.spec.ts tsx tests/runner.ts

# Custom timeout
TIMEOUT=15000 tsx tests/runner.ts
```

## 🏗️ Architecture

### Framework Adapter Pattern

```
src/framework/
├── types.ts                    # Common interfaces (IBrowserAdapter)
├── base-adapter.ts             # Abstract base class
├── factory.ts                  # Creates appropriate adapter
├── config.ts                   # Default configurations
├── test-helper.ts              # Simplified test API
└── adapters/
    ├── selenium-adapter.ts     # Selenium implementation
    ├── webdriverio-adapter.ts  # WebDriverIO implementation
    └── cypress-adapter.ts      # Cypress implementation
```

### Unified API

All frameworks support the same operations:

- **Navigation**: navigate, back, forward, refresh, getCurrentUrl, getTitle
- **Interaction**: click, type, clear, hover
- **Inspection**: getText, getAttribute, isVisible, isEnabled, exists
- **Waits**: waitForElement, waitForUrl
- **Forms**: fillForm, selectOption
- **Scroll**: scrollTo, scrollToTop, scrollToBottom
- **Screenshots**: takeScreenshot
- **JavaScript**: executeScript
- **Cookies**: getCookies, setCookie, deleteCookie
- **Window**: getWindowSize, setWindowSize, maximizeWindow

## 📚 Writing Tests

### Basic Test Structure

```typescript
import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { TestHelper } from '../../src/framework/test-helper.js';
import { FrameworkType } from '../../src/framework/types.js';

describe('My Test Suite', () => {
  let browser: any;

  before(async function () {
    this.timeout(30000);

    browser = await TestHelper.init({
      framework: (process.env.FRAMEWORK || 'webdriverio') as FrameworkType,
      browser: process.env.BROWSER || 'chrome',
      headless: process.env.HEADLESS === '1',
      timeout: 10000,
    });
  });

  after(async function () {
    await TestHelper.close();
  });

  it('should navigate and interact', async function () {
    await browser.navigate('https://example.com');

    const title = await browser.getTitle();
    expect(title).to.include('Example');

    await browser.click('h1');
    await browser.scrollToBottom();
  });
});
```

### Using Factory Pattern

```typescript
import { FrameworkFactory, FrameworkType } from './src/framework/index.js';

// Create adapter directly
const browser = FrameworkFactory.createAdapter({
  framework: FrameworkType.SELENIUM,
  browser: 'chrome',
  headless: true,
});

await browser.initialize();
await browser.navigate('https://example.com');
await browser.close();

// Or create from environment variables
const browser2 = FrameworkFactory.createFromEnv();
```

## 🔧 Configuration

### Environment Variables

```bash
# Framework selection
FRAMEWORK=selenium|webdriverio|cypress     # Default: webdriverio

# Browser selection
BROWSER=chrome|firefox|safari              # Default: chrome

# Headless mode
HEADLESS=1                                 # Default: false

# Custom timeout (ms)
TIMEOUT=15000                              # Default: 10000

# Viewport size
VIEWPORT_WIDTH=1920                        # Default: 1440
VIEWPORT_HEIGHT=1080                       # Default: 900

# Base URL
BASE_URL=https://example.com               # Default: none

# Test file pattern
SPEC=tests/**/*.spec.ts                    # Default: tests/examples/**/*.spec.ts
```

### Programmatic Configuration

```typescript
const config: FrameworkConfig = {
  framework: FrameworkType.CYPRESS,
  browser: 'firefox',
  headless: true,
  timeout: 15000,
  baseUrl: 'https://example.com',
  viewport: {
    width: 1920,
    height: 1080,
  },
};

const browser = FrameworkFactory.createAdapter(config);
```

## 🎓 Examples

See `tests/examples/multi-framework-smoke.spec.ts` for a complete working example that demonstrates:

- Framework initialization
- Navigation and page interaction
- Element inspection and assertions
- Screenshots
- JavaScript execution
- Cookie management
- Scroll operations

## 🔌 MCP Server

The project includes an MCP (Model Context Protocol) server for browser automation:

```bash
# Start MCP server
npm run mcp:server

# Or use in development mode
npm run dev
```

## 🧹 Maintenance

### Code Quality

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Cleanup

```bash
# Clean build and reports
npm run clean

# Clean reports only
npm run clean:reports
```

## 🚀 Benefits

### 1. **Framework Independence**
Not locked into any single framework. Switch anytime without rewriting tests.

### 2. **Future-Proof**
When new frameworks emerge (or existing ones improve), add a new adapter without touching tests.

### 3. **Team Flexibility**
Different team members can use their preferred framework for development and debugging.

### 4. **Easy Migration**
Migrate from one framework to another incrementally, test by test.

### 5. **Learning Tool**
Compare framework behaviors and performance side-by-side.

### 6. **Cost Optimization**
Choose the fastest/cheapest framework for different scenarios (CI vs local vs production monitoring).

## 📊 Adding New Frameworks

To add support for a new framework:

1. Create adapter class in `src/framework/adapters/your-framework-adapter.ts`
2. Implement `IBrowserAdapter` interface
3. Extend `BaseBrowserAdapter`
4. Add to `FrameworkFactory`
5. Update `FrameworkType` enum
6. Add npm script
7. Update documentation

Example:
```typescript
export class PlaywrightAdapter extends BaseBrowserAdapter {
  // Implement all IBrowserAdapter methods
  async navigate(url: string): Promise<NavigationResult> {
    // Playwright-specific implementation
  }
  // ... more methods
}
```

## 🤝 Contributing

Contributions welcome! Please ensure:

- All tests pass on all frameworks
- Code follows existing style (run `npm run lint`)
- TypeScript types are properly defined
- Documentation is updated

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Resources

- [Selenium WebDriver Docs](https://www.selenium.dev/documentation/)
- [WebDriverIO Docs](https://webdriver.io/docs/gettingstarted)
- [Cypress Docs](https://docs.cypress.io/)
- [FRAMEWORK.md](FRAMEWORK.md) - Detailed architecture guide

---

**Built with ❤️ for flexible, future-proof test automation**
