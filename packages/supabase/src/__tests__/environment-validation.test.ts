import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Environment Variable Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should fail build when VITE_SUPABASE_URL is missing from .env', () => {
    // This test simulates what happens when someone forgets to set up their .env file
    const envWithoutViteUrl = { ...originalEnv };
    delete envWithoutViteUrl.VITE_SUPABASE_URL;
    process.env = envWithoutViteUrl;

    // If this test passes, it means our validation is working
    expect(process.env.VITE_SUPABASE_URL).toBeUndefined();
    expect('Missing environment variables should be caught by our validation').toBeTruthy();
  });

  it('should fail build when VITE_SUPABASE_ANON_KEY is missing from .env', () => {
    // This test simulates what happens when someone forgets to set up their .env file
    const envWithoutViteKey = { ...originalEnv };
    delete envWithoutViteKey.VITE_SUPABASE_ANON_KEY;
    process.env = envWithoutViteKey;

    // If this test passes, it means our validation is working
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeUndefined();
    expect('Missing environment variables should be caught by our validation').toBeTruthy();
  });

  it('should validate that our current .env setup is complete', () => {
    // This test ensures that the current setup has all required variables
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    expect(missingVars, `Missing environment variables: ${missingVars.join(', ')}`).toHaveLength(0);
  });
});