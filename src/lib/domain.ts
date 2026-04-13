/**
 * Domain routing helper.
 * Currently everything runs on a single domain (pearlshop.io).
 * All routes (public + app) are available everywhere.
 */

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

export const isAppDomain = false; // disabled for now
export const isPublicDomain = hostname === 'pearlshop.io' || hostname === 'www.pearlshop.io';
export const isDevMode = true; // all routes always available

export const APP_ORIGIN = ''; // same origin

export const PUBLIC_ORIGIN = '';
