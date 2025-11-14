# Multi-Framework Test Automation Architecture

## Overview

This project implements a **Framework Adapter Pattern** that allows you to write tests once and run them on multiple automation frameworks:

- ✅ **Selenium WebDriver** - Industry standard, direct WebDriver API
- ✅ **WebDriverIO** - Modern, feature-rich wrapper around Selenium
- ✅ **Cypress** - Fast, modern in-browser testing framework

## Architecture

### Core Components

```
src/framework/
├── types.ts                    # Common interfaces and types
├── base-adapter.ts             # Abstract base class for all adapters
├── factory.ts                  # Creates appropriate adapter based on config
├── config.ts                   # Default configurations
├── test-helper.ts              # Simplified test API
└── adapters/
    ├── selenium-adapter.ts     # Selenium WebDriver implementation
    ├── webdriverio-adapter.ts  # WebDriverIO implementation
    └── cypress-adapter.ts      # Cypress implementation
```

### Design Pattern

The architecture uses the **Adapter Pattern** to provide a unified interface across different frameworks:

```typescript
interface IBrowserAdapter {
  // Lifecycle
  initialize(): Promise<void>;
  close(): Promise<void>;

  // Navigation
  navigate(url: string): Promise<NavigationResult>;
  getCurrentUrl(): Promise<string>;
  getTitle(): Promise<string>;

  // Interaction
  click(locator: string | Locator): Promise<void>;
  type(locator: string | Locator, text: string): Promise<void>;
  hover(locator: string | Locator): Promise<void>;

  // Inspection
  getText(locator: string | Locator): Promise<string>;
  isVisible(locator: string | Locator): Promise<boolean>;
  exists(locator: string | Locator): Promise<boolean>;

  // And many more...
}
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests with Different Frameworks

```bash
# WebDriverIO (default)
npm test

# Selenium WebDriver
npm run test:selenium

# Cypress
npm run test:cypress
```

### 3. Write Framework-Agnostic Tests

```typescript
import { TestHelper } from '../../src/framework/test-helper.js';
import { FrameworkType } from '../../src/framework/types.js';

describe('My Test Suite', () => {
  let browser: any;

  before(async () => {
    browser = await TestHelper.init({
      framework: FrameworkType.SELENIUM, // or WEBDRIVERIO, or CYPRESS
      browser: 'chrome',
      headless: true,
    });
  });

  after(async () => {
    await TestHelper.close();
  });

  it('should work on any framework', async () => {
    await browser.navigate('https://example.com');
    const title = await browser.getTitle();
    expect(title).to.include('Example');
  });
});
```

## Environment Variables

Control framework behavior with environment variables:

```bash
# Select framework
FRAMEWORK=selenium|webdriverio|cypress

# Select browser
BROWSER=chrome|firefox|safari

# Headless mode
HEADLESS=1

# Custom timeout
TIMEOUT=15000

# Viewport size
VIEWPORT_WIDTH=1920
VIEWPORT_HEIGHT=1080

# Base URL
BASE_URL=https://newsela.com
```

## Examples

### Using Factory Pattern

```typescript
import { FrameworkFactory, FrameworkType } from './src/framework/index.js';

// Create adapter from config
const browser = FrameworkFactory.createAdapter({
  framework: FrameworkType.SELENIUM,
  browser: 'chrome',
  headless: true,
  timeout: 10000,
});

await browser.initialize();
await browser.navigate('https://example.com');
await browser.close();
```

### Using Environment Variables

```typescript
import { FrameworkFactory } from './src/framework/index.js';

// Creates adapter based on FRAMEWORK env var
const browser = FrameworkFactory.createFromEnv();

await browser.initialize();
// ... your tests
await browser.close();
```

### Switching Frameworks at Runtime

```bash
# Run same test on all frameworks
FRAMEWORK=selenium npm run test:examples
FRAMEWORK=webdriverio npm run test:examples
FRAMEWORK=cypress npm run test:examples
```

## Supported Operations

### Navigation
- `navigate(url)` - Navigate to URL
- `back()` - Browser back button
- `forward()` - Browser forward button
- `refresh()` - Reload page
- `getCurrentUrl()` - Get current URL
- `getTitle()` - Get page title

### Element Interaction
- `click(locator)` - Click element
- `type(locator, text)` - Type text into element
- `clear(locator)` - Clear input field
- `hover(locator)` - Hover over element

### Element Inspection
- `getText(locator)` - Get element text
- `getAttribute(locator, attr)` - Get attribute value
- `isVisible(locator)` - Check if visible
- `isEnabled(locator)` - Check if enabled
- `exists(locator)` - Check if exists in DOM

### Wait Operations
- `waitForElement(locator, options)` - Wait for element
- `waitForUrl(url, timeout)` - Wait for URL change

### Form Operations
- `fillForm(fields)` - Fill multiple form fields
- `selectOption(locator, value)` - Select dropdown option

### Scroll Operations
- `scrollTo(locator)` - Scroll to element
- `scrollToTop()` - Scroll to top of page
- `scrollToBottom()` - Scroll to bottom

### Screenshots & JavaScript
- `takeScreenshot(options)` - Capture screenshot
- `executeScript(script, args)` - Execute JavaScript

### Cookie Management
- `getCookies()` - Get all cookies
- `setCookie(cookie)` - Set cookie
- `deleteCookie(name)` - Delete cookie
- `deleteAllCookies()` - Clear all cookies

### Window Management
- `getWindowSize()` - Get window dimensions
- `setWindowSize(width, height)` - Set window size
- `maximizeWindow()` - Maximize window

## Locator Strategies

All frameworks support multiple locator types:

```typescript
// CSS Selector (default)
await browser.click('.button-class');
await browser.click('button.submit');

// ID
await browser.click('#submit-btn');
await browser.click({ type: 'id', value: 'submit-btn' });

// XPath (Selenium & WebDriverIO only)
await browser.click('//button[@type="submit"]');
await browser.click({ type: 'xpath', value: '//button[@type="submit"]' });

// Test ID
await browser.click('[data-testid="submit-button"]');
await browser.click({ type: 'testid', value: 'submit-button' });

// Name attribute
await browser.click({ type: 'name', value: 'username' });

// Text content (partial match)
await browser.click({ type: 'text', value: 'Submit' });
```

## Framework-Specific Notes

### Selenium WebDriver
- Direct WebDriver API access
- Broadest browser support
- Most mature and stable
- Best for cross-browser testing

### WebDriverIO
- Modern API wrapper around Selenium
- Better developer experience
- Built-in retry and wait mechanisms
- Excellent documentation
- Currently used in this project

### Cypress
- Runs IN the browser (different architecture)
- Very fast test execution
- Excellent debugging capabilities
- Limited to Chrome, Firefox, Edge
- **Note:** XPath not natively supported (use CSS selectors)

## Migration Guide

### From WebDriverIO Tests

**Before:**
```typescript
describe('Test', () => {
  it('should work', async () => {
    await browser.url('https://example.com');
    const title = await browser.getTitle();
    await $('button').click();
  });
});
```

**After:**
```typescript
import { TestHelper } from '../../src/framework/test-helper.js';

describe('Test', () => {
  let browser: any;

  before(async () => {
    browser = await TestHelper.init();
  });

  after(async () => {
    await TestHelper.close();
  });

  it('should work', async () => {
    await browser.navigate('https://example.com');
    const title = await browser.getTitle();
    await browser.click('button');
  });
});
```

### From Selenium Tests

**Before:**
```typescript
const driver = await new Builder().forBrowser('chrome').build();
await driver.get('https://example.com');
const element = await driver.findElement(By.css('button'));
await element.click();
await driver.quit();
```

**After:**
```typescript
import { FrameworkFactory, FrameworkType } from './src/framework/index.js';

const browser = FrameworkFactory.createAdapter({
  framework: FrameworkType.SELENIUM,
  browser: 'chrome',
});

await browser.initialize();
await browser.navigate('https://example.com');
await browser.click('button');
await browser.close();
```

## Benefits

### 1. **Framework Independence**
Switch frameworks without rewriting tests. Try new frameworks easily.

### 2. **Future-Proof**
When new frameworks emerge, add a new adapter without changing tests.

### 3. **Team Flexibility**
Team members can use their preferred framework for debugging.

### 4. **Easy Migration**
Migrate from one framework to another incrementally.

### 5. **Learning Tool**
Compare framework behaviors and performance side-by-side.

## Testing the Multi-Framework Setup

Run the example test on all frameworks:

```bash
# Selenium
FRAMEWORK=selenium BROWSER=chrome tsx tests/runner.ts

# WebDriverIO
FRAMEWORK=webdriverio BROWSER=chrome tsx tests/runner.ts

# Cypress
FRAMEWORK=cypress BROWSER=chrome tsx tests/runner.ts
```

## Performance Comparison

Run benchmarks across frameworks:

```bash
# Time each framework
time FRAMEWORK=selenium npm run test:examples
time FRAMEWORK=webdriverio npm run test:examples
time FRAMEWORK=cypress npm run test:examples
```

Generally:
- **Cypress**: Fastest (runs in browser)
- **WebDriverIO**: Fast (optimized Selenium)
- **Selenium**: Reliable (standard WebDriver)

## Best Practices

### 1. Use CSS Selectors When Possible
```typescript
// ✅ Good - works on all frameworks
await browser.click('.submit-button');

// ❌ Avoid - XPath not supported in Cypress
await browser.click('//button[@class="submit-button"]');
```

### 2. Use Data-TestId for Critical Elements
```typescript
// In HTML
<button data-testid="submit-btn">Submit</button>

// In test
await browser.click('[data-testid="submit-btn"]');
```

### 3. Always Clean Up
```typescript
after(async () => {
  await TestHelper.close(); // Always close browser
});
```

### 4. Use Explicit Waits
```typescript
// ✅ Good
await browser.waitForElement('.results', { visible: true, timeout: 5000 });
await browser.click('.results');

// ❌ Bad
await browser.click('.results'); // Might fail if not loaded
```

## Troubleshooting

### Issue: "Framework not found"
**Solution:** Ensure dependencies are installed:
```bash
npm install
```

### Issue: "Element not found"
**Solution:** Add explicit wait:
```typescript
await browser.waitForElement(selector, { visible: true });
```

### Issue: "Timeout errors"
**Solution:** Increase timeout:
```bash
TIMEOUT=30000 npm run test:selenium
```

### Issue: Cypress XPath errors
**Solution:** Use CSS selectors instead of XPath for Cypress compatibility.

## Future Enhancements

Potential additions to the framework:

- [ ] Playwright adapter (you mentioned having separate framework)
- [ ] Puppeteer adapter
- [ ] TestCafe adapter
- [ ] Visual regression testing support
- [ ] Parallel execution across frameworks
- [ ] Performance metrics comparison
- [ ] Framework health dashboard

## Contributing

When adding a new framework adapter:

1. Create adapter class in `src/framework/adapters/`
2. Implement `IBrowserAdapter` interface
3. Extend `BaseBrowserAdapter`
4. Add to `FrameworkFactory`
5. Update `FrameworkType` enum
6. Add npm script
7. Update documentation

## Resources

- [Selenium WebDriver Docs](https://www.selenium.dev/documentation/)
- [WebDriverIO Docs](https://webdriver.io/docs/gettingstarted)
- [Cypress Docs](https://docs.cypress.io/)
- [Adapter Pattern](https://refactoring.guru/design-patterns/adapter)

---

**Created for flexible, future-proof test automation** 🚀
