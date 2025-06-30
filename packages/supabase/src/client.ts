import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variable helper that works across platforms
const getEnvVar = (name: string): string => {
  // Browser environment (Vite)
  if (typeof window !== 'undefined' && typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[`VITE_${name}`] || '';
  }
  
  // React Native (Expo)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[`EXPO_PUBLIC_${name}`] || process.env[name] || '';
  }
  
  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || '';
  }
  
  return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');

// Create a mock client for tests when environment variables are not available
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for tests or when env vars are missing
    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    if (isTest || !supabaseUrl || !supabaseAnonKey) {
      return createClient<Database>('https://mock.supabase.co', 'mock-anon-key');
    }
    throw new Error('Missing Supabase environment variables');
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

export * from './types.js'; 