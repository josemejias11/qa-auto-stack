import { expect } from 'expect';
import { BASE_URL, SELECTORS } from '../../src/constants/index.js';
/// <reference types="@wdio/globals" />

// Very fast canary to ensure site core renders
describe('Smoke: Home', () => {
  it('renders title & hero quickly', async () => {
    await browser.url(BASE_URL);
    const title = await browser.getTitle();
    expect(title.toLowerCase()).toContain('newsela');
    const h1 = await $(SELECTORS.COMMON.H1);
    expect(await h1.isExisting()).toBe(true);
  });
});
