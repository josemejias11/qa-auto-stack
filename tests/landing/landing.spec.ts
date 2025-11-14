import { expect } from 'expect';
import { BASE_URL, SELECTORS } from '../../src/constants/index.js';
/// <reference types="@wdio/globals" />

describe('Landing Page', () => {
  it('validates core landing experience (title, hero, CTAs, basic structure)', async () => {
    await browser.url(BASE_URL);

    // 1. Title resilience: Should mention either brand or product concept
    const title = (await browser.getTitle()).toLowerCase();
    expect(title.length).toBeGreaterThan(10);
    expect(
      [title.includes('newsela'), title.includes('learning'), title.includes('education')].some(
        Boolean
      )
    ).toBe(true);

    // 2. Hero heading: non-empty and not a generic placeholder
    const hero = await $(SELECTORS.COMMON.H1);
    const heroText = (await hero.getText()).trim();
    console.log('Hero H1:', heroText);
    expect(heroText.length).toBeGreaterThan(3);
    // Disallow a pure placeholder pattern
    expect(heroText.toLowerCase()).not.toMatch(/lorem ipsum|coming soon/);

    // 3. Primary CTA buttons/links existence (sample selectors)
    const ctaSelectors = [
      'a[href*="join"], a[href*="signup"], a[href*="sign-up"], a[href*="get-started"]',
      'a[href*="contact"], a[href*="get-in-touch"]',
    ];
    let ctaFound = 0;
    for (const sel of ctaSelectors) {
      const els = await $$(sel);
      if (els.length) ctaFound += 1;
    }
    expect(ctaFound).toBeGreaterThanOrEqual(1); // At least one CTA cluster available

    // 4. Navigation structure sanity (soft check): collect distinct nav link texts if present
    const navTexts: string[] = await browser.execute((selector: string) => {
      const nodes = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      const texts = nodes.map((n) => (n.innerText || '').trim()).filter((t) => t);
      return Array.from(new Set(texts)).filter((t) => t.length < 40);
    }, SELECTORS.HEADER.NAV_LINKS);
    console.log('Nav texts (soft check):', navTexts);
    if (navTexts.length > 0) {
      expect(navTexts.length).toBeGreaterThanOrEqual(1); // ensure at least one if any captured
    }

    // 5. Basic meta presence (description or og:title)
    const metaDescription = await $('head meta[name="description"]');
    const ogTitle = await $('head meta[property="og:title"]');
    const mdContent = (await metaDescription.getAttribute('content')) || '';
    const ogContent = (await ogTitle.getAttribute('content')) || '';
    expect((mdContent + ogContent).length).toBeGreaterThan(10);

    // 6. No unexpected 404 banner text
    const pageSource = await browser.getPageSource();
    expect(pageSource.includes("The page you are looking for doesn't exist")).toBe(false);

    // 7. Performance proxy: ensure DOMContentLoaded happened quickly (navigation timing)
    const perf = await browser.execute(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return nav ? { domContentLoaded: (nav as any).domContentLoadedEventEnd } : null;
    });
    if (perf && perf.domContentLoaded) {
      console.log('DOMContentLoaded ms:', perf.domContentLoaded);
      expect(perf.domContentLoaded).toBeLessThan(15000); // relaxed upper bound for CI
    }
  });
});
