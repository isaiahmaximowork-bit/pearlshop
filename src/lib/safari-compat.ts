import React from 'react';

/**
 * Parses a date string safely for Safari/iOS compatibility.
 * Safari often fails to parse strings with hyphens (YYYY-MM-DD).
 * This utility replaces hyphens with slashes (YYYY/MM/DD) to ensure compatibility.
 */
export const safeDateParse = (dateInput: string | Date | null | undefined): Date => {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  
  try {
    // Replace hyphens with slashes for Safari compatibility
    const sanitized = typeof dateInput === 'string' ? dateInput.replace(/-/g, '/') : dateInput;
    const date = new Date(sanitized);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
};

/**
 * Safe LocalStorage wrapper to prevent crashes in Safari Private Mode or In-App Browsers.
 */
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`LocalStorage access denied for key "${key}":`, error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`LocalStorage write denied for key "${key}":`, error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`LocalStorage remove denied for key "${key}":`, error);
    }
  }
};
