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
  // Always log to console first so it's visible in dev tools/logs
  console.error(`[RemoteLog] [${context}] ${message}`, metadata);
  
  try {
    // We use a simplified insert that doesn't wait for auth if it might be the cause of the crash
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    const logData = {
      level: 'error',
      message,
      context,
      metadata: {
        ...metadata,
        error_stack: metadata.error?.stack || metadata.error_stack || new Error().stack
      },
      user_id: user?.id,
      user_agent: navigator.userAgent,
      url: window.location.href
    };

    // Use a background task to not block render
    const { error } = await supabase.from('app_logs').insert(logData);
    if (error) {
      console.warn('Supabase log error:', error);
      // Fallback: try to store in localstorage if DB fails (unless localstorage is the problem)
      try {
        const fallbackLogs = JSON.parse(localStorage.getItem('pending_logs') || '[]');
        fallbackLogs.push({ ...logData, timestamp: new Date().toISOString() });
        localStorage.setItem('pending_logs', JSON.stringify(fallbackLogs.slice(-10)));
      } catch (e) {}
    }
  } catch (err) {
    console.error('Critical failure in logError:', err);
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
