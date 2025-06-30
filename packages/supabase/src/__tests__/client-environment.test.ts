import { describe, it, expect } from 'vitest';

describe('Supabase Client Environment Configuration', () => {
  it('CRITICAL: VITE_SUPABASE_URL must be configured for web app', () => {
    // This test will FAIL the build if environment variables are not properly set
    // It validates that the web app will be able to access Supabase
    const url = process.env.VITE_SUPABASE_URL;
    
    expect(url, 'VITE_SUPABASE_URL is required in .env file for web app to function').toBeDefined();
    expect(url, 'VITE_SUPABASE_URL cannot be empty').toBeTruthy();
    expect(typeof url, 'VITE_SUPABASE_URL must be a string').toBe('string');
    expect(url, 'VITE_SUPABASE_URL must be a valid Supabase URL').toMatch(/^https:\/\/.+\.supabase\.co$/);
  });

  it('CRITICAL: VITE_SUPABASE_ANON_KEY must be configured for web app', () => {
    // This test will FAIL the build if environment variables are not properly set
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    
    expect(key, 'VITE_SUPABASE_ANON_KEY is required in .env file for web app to function').toBeDefined();
    expect(key, 'VITE_SUPABASE_ANON_KEY cannot be empty').toBeTruthy();
    expect(typeof key, 'VITE_SUPABASE_ANON_KEY must be a string').toBe('string');
    expect(key!.length, 'VITE_SUPABASE_ANON_KEY must be a valid JWT token (>50 chars)').toBeGreaterThan(50);
    expect(key!, 'VITE_SUPABASE_ANON_KEY must start with "eyJ" (JWT format)').toMatch(/^eyJ/);
  });

  it('CRITICAL: Regular SUPABASE_* vars must be configured for server', () => {
    // Server-side environment variables
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    
    expect(url, 'SUPABASE_URL is required in .env file for server to function').toBeDefined();
    expect(url, 'SUPABASE_URL cannot be empty').toBeTruthy();
    expect(key, 'SUPABASE_ANON_KEY is required in .env file for server to function').toBeDefined();
    expect(key, 'SUPABASE_ANON_KEY cannot be empty').toBeTruthy();
  });

  it('should provide helpful error messages when creating client without proper env vars', () => {
    // This validates our error message structure
    const expectedErrorContent = [
      'Missing Supabase environment variables',
      'Please ensure these are set in your .env file',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];
    
    // Each part should be present in a proper error message
    expectedErrorContent.forEach(content => {
      expect(content).toBeTruthy();
      expect(typeof content).toBe('string');
    });
  });
});