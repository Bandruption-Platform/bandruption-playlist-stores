import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Type definitions for environment access
interface ViteImportMeta {
  env: Record<string, string>;
}

interface GlobalWithExpo {
  __expo?: unknown;
}

// Environment variable helper that works across platforms
const getEnvVar = (name: string): string => {
  // Browser environment (Vite)
  if (typeof window !== 'undefined' && typeof import.meta !== 'undefined' && (import.meta as unknown as ViteImportMeta).env) {
    return (import.meta as unknown as ViteImportMeta).env[`VITE_${name}`] || '';
  }
  
  // React Native (Expo) - check for Expo-specific globals
  if (typeof process !== 'undefined' && process.env && (typeof global !== 'undefined' && (global as GlobalWithExpo).__expo)) {
    return process.env[`EXPO_PUBLIC_${name}`] || process.env[name] || '';
  }
  
  // Node.js environment
  if (typeof process !== 'undefined' && process.env && typeof window === 'undefined') {
    return process.env[name] || '';
  }
  
  return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');

// Create Supabase client with proper error handling
const createSupabaseClient = () => {
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isTest) {
      return createClient<Database>('https://mock.supabase.co', 'mock-anon-key');
    }
    
    const isBrowser = typeof window !== 'undefined';
    const prefix = isBrowser ? 'VITE_' : '';
    const envVars = [`${prefix}SUPABASE_URL`, `${prefix}SUPABASE_ANON_KEY`];
    
    throw new Error(
      `Missing Supabase environment variables. ` +
      `Please ensure these are set in your .env file: ${envVars.join(', ')}. ` +
      `Current values: URL=${supabaseUrl || 'undefined'}, KEY=${supabaseAnonKey ? '[SET]' : 'undefined'}`
    );
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

export * from './types.js'; 