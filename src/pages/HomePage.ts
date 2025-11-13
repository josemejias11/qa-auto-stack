/// <reference types="@wdio/globals" />

export class HomePage {
  constructor(private baseUrl: string = process.env.QA_BASE_URL || 'https://newsela.com') {}

  async open() {
    await browser.url(this.baseUrl + '/');
  }

  async getHeroHeadingText(): Promise<string> {
    const h1 = await $('h1');
    return h1.getText();
  }

  async navMenuItems(): Promise<string[]> {
    await browser.waitUntil(
      async () => {
        const elements = await $$('header a[href], nav a[href]');
        const count = await elements.length;
        return count > 0;
      },
      { timeout: 8000, timeoutMsg: 'Navigation links did not appear' }
    );
    const els = await $$('header a[href], nav a[href]');
    const texts: string[] = [];
    for (const el of els) {
      try {
        const t = (await el.getText()).trim();
        if (t && t.length < 60) texts.push(t);
      } catch (_err) {
        // swallow individual element text retrieval failures (e.g., stale element) intentionally
      }
    }
    return Array.from(new Set(texts));
  }
}
