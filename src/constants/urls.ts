/**
 * URL constants and paths used throughout the test suite
 */

/**
 * Base URL for the application (can be overridden by environment variable)
 */
export const BASE_URL = process.env.QA_BASE_URL || 'https://newsela.com';

/**
 * Product page paths
 */
export const PRODUCTS = {
  ELA: '/products/ela',
  SOCIAL_STUDIES: '/products/social-studies',
  SCIENCE: '/products/science',
  SEL: '/products/sel',
  WRITING: '/products/writing',
  FORMATIVE: '/products/formative',
} as const;

/**
 * Common page paths
 */
export const PATHS = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRICING: '/pricing',
} as const;

/**
 * Get full URL for a path
 */
export function getUrl(path: string, baseUrl: string = BASE_URL): string {
  return `${baseUrl}${path}`;
}

/**
 * Get product URL
 */
export function getProductUrl(product: keyof typeof PRODUCTS): string {
  return getUrl(PRODUCTS[product]);
}
