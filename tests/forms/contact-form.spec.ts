import { expect } from 'expect';
import { getUrl } from '../../src/constants/index.js';
/// <reference types="@wdio/globals" />

// Non-submitting validation of presence of contact/demo form fields

describe('Forms: contact/demo presence', () => {
  it('detects a lead/contact form and required fields', async () => {
    await browser.url(getUrl('/contact-us'));
    // Look for common required fields (first name, last name, email)
    const selectors = ['input[name*="first" i]', 'input[name*="last" i]', 'input[type="email"]'];
    let found = 0;
    for (const sel of selectors) {
      const el = await $(sel);
      if (await el.isExisting()) found += 1;
    }
    expect(found).toBeGreaterThanOrEqual(2); // expect at least two core fields to exist
  });
});
