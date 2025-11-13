/**
 * Standard timeout values used throughout the test suite
 * Centralized for consistency and easy adjustment
 */

export const TIMEOUTS = {
  /**
   * Short timeout for quick operations (5 seconds)
   * Use for: Element visibility, simple waits
   */
  SHORT: 5000,

  /**
   * Default timeout for standard operations (10 seconds)
   * Use for: Page loads, standard element interactions
   */
  DEFAULT: 10000,

  /**
   * Medium timeout for slower operations (30 seconds)
   * Use for: Complex page loads, network requests
   */
  MEDIUM: 30000,

  /**
   * Long timeout for very slow operations (60 seconds)
   * Use for: Heavy page loads, large downloads
   */
  LONG: 60000,

  /**
   * Extra long timeout for video operations (120 seconds)
   * Use for: Video loading and playback verification
   */
  VIDEO: 120000,

  /**
   * Navigation link detection timeout (8 seconds)
   * Specific to header/nav menu items appearing
   */
  NAV_LINKS: 8000,

  /**
   * Video player detection timeout (12 seconds)
   * Specific to video player infrastructure loading
   */
  VIDEO_PLAYER: 12000,
} as const;

/**
 * Timeout multipliers for different environments
 */
export const TIMEOUT_MULTIPLIERS = {
  CI: 1.5, // 50% longer in CI environment
  LOCAL: 1.0, // Standard timeouts locally
} as const;

/**
 * Get timeout value adjusted for environment
 */
export function getTimeout(baseTimeout: number, multiplier?: number): number {
  const isCI = process.env.CI === 'true';
  const envMultiplier = isCI ? TIMEOUT_MULTIPLIERS.CI : TIMEOUT_MULTIPLIERS.LOCAL;
  return baseTimeout * (multiplier ?? envMultiplier);
}
