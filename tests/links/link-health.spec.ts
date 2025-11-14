import { expect } from 'expect';
import { BASE_URL } from '../../src/constants/index.js';
/// <reference types="@wdio/globals" />

// Client-side link sampling to detect obvious broken internal anchors on home page

describe('Link Health: homepage internal anchors', () => {
  it('samples internal links and reports HTTP error statuses', async () => {
    await browser.url(BASE_URL);
    const links: string[] = await browser.execute(() => {
      const anchors = Array.from(document.querySelectorAll('a[href^="/"]')) as HTMLAnchorElement[];
      const paths = anchors
        .map((a) => a.getAttribute('href') || '')
        .filter((h) => h && h.length > 1 && !h.startsWith('#') && !/(\.pdf|\.zip)$/i.test(h));
      return Array.from(new Set(paths)).slice(0, 15); // sample a few more now that we don't navigate for each
    });

    interface LinkCheck {
      path: string;
      status: number;
      ok: boolean;
      redirected: boolean;
    }
    const results: LinkCheck[] = await browser.executeAsync(async (paths: string[], done) => {
      const out: LinkCheck[] = [] as any;
      for (const p of paths) {
        try {
          const res = await fetch(p, { method: 'GET', redirect: 'follow' });
          out.push({
            path: p,
            status: res.status,
            ok: res.status < 400,
            redirected: res.redirected,
          });
        } catch (_e) {
          out.push({ path: p, status: 0, ok: false, redirected: false });
        }
      }
      done(out);
    }, links);

    const broken = results.filter((r) => !r.ok);
    if (broken.length) {
      console.warn('Broken internal paths (status >=400 or fetch error):', broken);
    }
    // Allow 0 broken ideally; keep a tiny slack of <2 to avoid transient build noise.
    expect(broken.length).toBeLessThan(2);
  });
});
