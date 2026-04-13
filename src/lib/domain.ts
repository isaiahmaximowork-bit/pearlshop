/**
 * Domain routing helper.
 * pearlshop.io        → public site (landing, stores, legal pages)
 * app.pearlshop.io    → authenticated dashboard
 * In dev/preview      → all routes available
 */

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

export const isAppDomain = hostname === 'app.pearlshop.io';
export const isPublicDomain = hostname === 'pearlshop.io' || hostname === 'www.pearlshop.io';
export const isDevMode = !isAppDomain && !isPublicDomain;

export const APP_ORIGIN = isDevMode
  ? ''  // same origin in dev
  : 'https://app.pearlshop.io';

export const PUBLIC_ORIGIN = isDevMode
  ? ''
  : 'https://pearlshop.io';
