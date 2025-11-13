/**
 * Common CSS selectors used throughout the test suite
 * Centralized to avoid magic strings and make maintenance easier
 */

export const SELECTORS = {
  // Header & Navigation
  HEADER: {
    NAV_LINKS: 'header a[href], nav a[href]',
    LOGO: 'header img[alt*="logo" i]',
  },

  // Common Elements
  COMMON: {
    H1: 'h1',
    H2: 'h2',
    BUTTON: 'button',
    LINK: 'a[href]',
  },

  // Video Elements
  VIDEO: {
    PLAYER: 'video',
    WISTIA_HOST: '[wistia-id]',
    WISTIA_PLAYER: 'wistia-player[media-id]',
    PLAY_BUTTON: '[aria-label*="play" i]',
  },

  // Form Elements
  FORM: {
    INPUT: 'input',
    TEXTAREA: 'textarea',
    SELECT: 'select',
    SUBMIT: 'button[type="submit"]',
  },
} as const;
