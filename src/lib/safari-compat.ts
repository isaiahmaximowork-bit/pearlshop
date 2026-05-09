import { supabase } from "@/integrations/supabase/client";

/**
 * Parses a date string safely for Safari/iOS compatibility.
 */
export const safeDateParse = (dateInput: string | Date | null | undefined): Date => {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  
  try {
    const sanitized = typeof dateInput === 'string' ? dateInput.replace(/-/g, '/') : dateInput;
    const date = new Date(sanitized);
    if (isNaN(date.getTime())) return new Date();
    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
};

/**
 * Log error to Supabase database for remote debugging.
 */
export const logError = async (message: string, context: string, metadata: any = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('app_logs').insert({
      level: 'error',
      message,
      context,
      metadata: {
        ...metadata,
        error_stack: metadata.error?.stack
      },
      user_id: user?.id,
      user_agent: navigator.userAgent,
      url: window.location.href
    });
  } catch (err) {
    console.error('Failed to send log to Supabase:', err);
  }
};

/**
 * Safe LocalStorage wrapper.
 */
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logError(`LocalStorage access denied for key "${key}"`, 'Storage', { error });
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      logError(`LocalStorage write denied for key "${key}"`, 'Storage', { error });
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logError(`LocalStorage remove denied for key "${key}"`, 'Storage', { error });
    }
  }
};
