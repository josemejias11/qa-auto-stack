/**
 * Multi-Framework Smoke Test Example
 * This test demonstrates how to write framework-agnostic tests
 * that can run on Selenium, WebDriverIO, or Cypress
 */

import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { TestHelper } from '../../src/framework/test-helper.js';
import type { FrameworkType } from '../../src/framework/types.js';

describe('Multi-Framework Smoke Test', () => {
  let browser: any;
  const TEST_URL = 'https://example.com';

  before(async function () {
    this.timeout(30000); // Allow time for browser initialization

    // Initialize browser based on FRAMEWORK environment variable
    const frameworkType = (process.env.FRAMEWORK || 'webdriverio') as FrameworkType;

    browser = await TestHelper.init({
      framework: frameworkType,
      browser: process.env.BROWSER || 'chrome',
      headless: process.env.HEADLESS === '1',
      baseUrl: TEST_URL,
      timeout: 10000,
    });

    console.log(`✓ Initialized ${browser.getFrameworkType()} adapter`);
  });

  after(async function () {
    this.timeout(10000);
    await TestHelper.close();
  });

  it('should navigate to example.com', async function () {
    this.timeout(15000);

    const result = await browser.navigate(TEST_URL);
    expect(result.success).to.equal(true);

    const url = await browser.getCurrentUrl();
    expect(url).to.include('example.com');
  });

  it('should display the correct page title', async function () {
    this.timeout(10000);

    const title = await browser.getTitle();
    expect(title).to.include('Example');
  });

  it('should find and verify page content', async function () {
    this.timeout(15000);

    // Wait for h1 element
    await browser.waitForElement('h1', { visible: true, timeout: 10000 });

    const h1Exists = await browser.exists('h1');
    expect(h1Exists).to.equal(true);

    const h1Visible = await browser.isVisible('h1');
    expect(h1Visible).to.equal(true);
  });

  it('should interact with page elements', async function () {
    this.timeout(15000);

    // Get h1 text
    const h1Text = await browser.getText('h1');
    expect(h1Text).to.be.a('string');
    expect(h1Text.length).to.be.greaterThan(0);

    // Scroll to bottom and back to top
    await browser.scrollToBottom();
    await browser.scrollToTop();
  });

  it('should take a screenshot', async function () {
    this.timeout(10000);

    const screenshotPath = await browser.takeScreenshot({
      path: `reports/screenshots/multi-framework-${browser.getFrameworkType()}-test.png`,
    });

    expect(screenshotPath).to.be.a('string');
    console.log(`✓ Screenshot saved: ${screenshotPath}`);
  });

  it('should execute JavaScript on the page', async function () {
    this.timeout(10000);

    const pageHeight = await browser.executeScript<number>('return document.body.scrollHeight');

    expect(pageHeight).to.be.a('number');
    expect(pageHeight).to.be.greaterThan(0);
    console.log(`✓ Page height: ${pageHeight}px`);
  });

  it('should handle browser navigation', async function () {
    this.timeout(15000);

    // Navigate to about page (if exists)
    const currentUrl = await browser.getCurrentUrl();

    // Test refresh
    await browser.refresh();

    const urlAfterRefresh = await browser.getCurrentUrl();
    expect(urlAfterRefresh).to.equal(currentUrl);
  });

  it('should manage cookies', async function () {
    this.timeout(10000);

    // Get cookies
    const cookies = await browser.getCookies();
    expect(cookies).to.be.an('array');

    console.log(`✓ Found ${cookies.length} cookies`);
  });

  it('should report framework type correctly', async function () {
    const frameworkType = browser.getFrameworkType();
    const expectedFramework = process.env.FRAMEWORK || 'webdriverio';

    expect(frameworkType).to.equal(expectedFramework);
    console.log(`✓ Running on framework: ${frameworkType}`);
  });
});
