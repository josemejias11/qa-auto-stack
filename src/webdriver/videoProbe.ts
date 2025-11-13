/* Reusable Wistia / native video playback probe helper */

export interface VideoProbeResult {
  url: string;
  mode: string;
  played: boolean;
  delta: number;
  before: number;
  after: number;
  paused: boolean;
  skipped: boolean;
  reason?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any;
}
export interface VideoProbeOptions {
  url?: string;
  waitForPlayerMs?: number;
  strict?: boolean;
}
export async function playAndProbeVideo(opts: VideoProbeOptions): Promise<VideoProbeResult> {
  const url = opts.url || (await browser.getUrl());
  if (opts.url) await browser.url(opts.url);
  const waitMs = opts.waitForPlayerMs ?? 12000;
  const found = await browser
    .waitUntil(
      async () =>
        await browser.execute(() => {
          const host = document.querySelector('[wistia-id]');
          const player = document.querySelector('wistia-player[media-id]');
          const nativeVid = document.querySelector('video');
          return !!(host || player || nativeVid);
        }),
      { timeout: waitMs, interval: 300, timeoutMsg: 'video-player-not-detected' }
    )
    .catch(() => false);
  if (!found) {
    return {
      url,
      mode: 'none',
      played: false,
      delta: 0,
      before: 0,
      after: 0,
      paused: false,
      skipped: !opts.strict,
      reason: 'player-not-found',
    };
  }

  // Inject probe (Wistia prioritized, fallback native)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hook: any = await browser.execute(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w: any = window as any;
    const container = document.querySelector('[wistia-id]') as HTMLElement | null;
    const customPlayer = document.querySelector('wistia-player[media-id]') as HTMLElement | null;
    const mediaId =
      customPlayer?.getAttribute('media-id') || container?.getAttribute('wistia-id') || null;

    const installWistiaProbe = (id: string) => {
      w._wq = w._wq || [];
      if (w.__mediaProbe) return 'reused';
      w.__mediaProbe = {
        kind: 'wistia',
        id,
        before: 0,
        after: 0,
        played: false,
        paused: false,
        delta: 0,
      };
      w._wq.push({
        id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onReady: (video: any) => {
          try {
            w.__mediaProbe.before = video.time();
            try {
              (customPlayer || container)?.click();
            } catch {
              // Click failed, continue without interaction
            }
            const p = video.play?.();
            if (p && typeof p.then === 'function') p.catch(() => {});
            setTimeout(() => {
              const now = video.time();
              w.__mediaProbe.played = now > w.__mediaProbe.before;
              setTimeout(() => {
                video.pause?.();
                w.__mediaProbe.after = video.time();
                w.__mediaProbe.paused = video.isPaused ? video.isPaused() : true;
                w.__mediaProbe.delta = w.__mediaProbe.after - w.__mediaProbe.before;
              }, 1500);
            }, 1200);
          } catch {
            // Video playback setup failed, continue
          }
        },
      });
      return 'queued';
    };

    if (mediaId) {
      installWistiaProbe(mediaId);
      return { mode: 'wistia', mediaId };
    }
    const vid = document.querySelector('video') as HTMLVideoElement | null;
    if (vid) {
      if (!w.__mediaProbe) {
        w.__mediaProbe = {
          kind: 'native',
          before: vid.currentTime,
          after: 0,
          played: false,
          paused: false,
          delta: 0,
        };
        try {
          const r = vid.play();
          if (r && typeof (r as Promise<void>).then === 'function') r.catch(() => {});
          setTimeout(() => {
            const now = vid.currentTime;
            w.__mediaProbe.played = now > w.__mediaProbe.before;
            setTimeout(() => {
              vid.pause();
              w.__mediaProbe.after = vid.currentTime;
              w.__mediaProbe.paused = vid.paused;
              w.__mediaProbe.delta = w.__mediaProbe.after - w.__mediaProbe.before;
            }, 1500);
          }, 1200);
        } catch {
          // Native video playback failed, continue
        }
      }
      return { mode: 'native' };
    }
    return { mode: 'none' };
  });

  if (hook.mode === 'none') {
    return {
      url,
      mode: 'none',
      played: false,
      delta: 0,
      before: 0,
      after: 0,
      paused: false,
      skipped: !opts.strict,
      reason: 'no-player-elements-post-inject',
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let probe: any = await browser
    .waitUntil(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async () => await browser.execute(() => (window as any).__mediaProbe || null),
      {
        timeout: 10000,
        interval: 400,
        timeoutMsg: 'probe-timeout',
      }
    )
    .catch(() => null);
  if (probe && (!probe.played || probe.delta <= 0)) {
    await browser.pause(1800);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const probe2: any = await browser.execute(() => (window as any).__mediaProbe || null);
    if (probe2) probe = probe2;
  }

  if (!probe || !probe.played || probe.delta <= 0) {
    // Wistia specific retry via API
    if (hook.mode === 'wistia') {
      await browser.execute(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w: any = window as any;
        if (w.__mediaProbe && w.__mediaProbe.id && w.Wistia && w.Wistia.api) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            w.Wistia.api(w.__mediaProbe.id, (video: any) => {
              try {
                const before = video.time();
                const p = video.play?.();
                if (p && typeof p.then === 'function') p.catch(() => {});
                setTimeout(() => {
                  const now = video.time();
                  w.__mediaProbe.played = now > before;
                  w.__mediaProbe.after = now;
                  w.__mediaProbe.delta = now - before;
                  video.pause?.();
                  w.__mediaProbe.paused = video.isPaused ? video.isPaused() : true;
                }, 1600);
              } catch {
                // Video timing measurement failed
              }
            });
          } catch {
            // Video interaction failed, continue
          }
        }
      });
      await browser.pause(2000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const probe3: any = await browser.execute(() => (window as any).__mediaProbe || null);
      if (probe3) probe = probe3;
    }
  }

  if (!probe) {
    return {
      url,
      mode: hook.mode,
      played: false,
      delta: 0,
      before: 0,
      after: 0,
      paused: false,
      skipped: !opts.strict,
      reason: 'probe-missing',
    };
  }

  return {
    url,
    mode: hook.mode,
    played: !!probe.played && probe.delta > 0,
    delta: probe.delta || 0,
    before: probe.before || 0,
    after: probe.after || 0,
    paused: !!probe.paused,
    skipped: !opts.strict && (!probe.played || probe.delta <= 0),
    reason: !probe.played || probe.delta <= 0 ? 'no-progress' : undefined,
    raw: probe,
  };
}
