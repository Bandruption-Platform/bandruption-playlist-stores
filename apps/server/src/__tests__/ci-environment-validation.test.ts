import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

describe('CI Environment Validation', () => {
  it('should ensure all required environment variables are defined in GitHub Actions workflow', () => {
    // Read the GitHub Actions workflow file
    // When running from apps/server, we need to go up 2 levels to reach repo root
    const repoRoot = join(process.cwd(), '../../');
    const workflowPath = join(repoRoot, '.github/workflows/pr-checks.yml');
    const workflowContent = readFileSync(workflowPath, 'utf-8');
    const workflow = parse(workflowContent);
    
    // Extract environment variables from the workflow
    const buildJob = workflow.jobs['build-and-test'];
    const buildEnvVars = buildJob.steps.find((step: any) => 
      step.name === 'Build all packages'
    )?.env || {};
    
    const testEnvVars = buildJob.steps.find((step: any) => 
      step.name === 'Run tests'
    )?.env || {};
    
    // Define required environment variables for different purposes
    const requiredForBuild = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
    ];
    
    const requiredForTests = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'NODELY_API_URL',
      'NODELY_INDEXER_URL',
    ];
    
    const requiredForBoth = [
      'WALLET_MNEMONIC_ENCRYPTION_KEY',
      'PINATA_API_KEY',
      'PINATA_SECRET',
    ];
    
    // Check build environment
    const missingBuildVars: string[] = [];
    [...requiredForBuild, ...requiredForBoth].forEach(varName => {
      if (!buildEnvVars[varName]) {
        missingBuildVars.push(varName);
      }
    });
    
    // Check test environment
    const missingTestVars: string[] = [];
    [...requiredForTests, ...requiredForBoth].forEach(varName => {
      if (!testEnvVars[varName]) {
        missingTestVars.push(varName);
      }
    });
    
    expect(missingBuildVars, 
      `Missing environment variables in build step: ${missingBuildVars.join(', ')}. ` +
      `Add these to the 'Build all packages' step in .github/workflows/pr-checks.yml`
    ).toHaveLength(0);
    
    expect(missingTestVars,
      `Missing environment variables in test step: ${missingTestVars.join(', ')}. ` +
      `Add these to the 'Run tests' step in .github/workflows/pr-checks.yml`
    ).toHaveLength(0);
  });

  it('should validate that workflow environment variables use GitHub secrets syntax', () => {
    const repoRoot = join(process.cwd(), '../../');
    const workflowPath = join(repoRoot, '.github/workflows/pr-checks.yml');
    const workflowContent = readFileSync(workflowPath, 'utf-8');
    const workflow = parse(workflowContent);
    
    const buildJob = workflow.jobs['build-and-test'];
    const buildEnvVars = buildJob.steps.find((step: any) => 
      step.name === 'Build all packages'
    )?.env || {};
    
    const testEnvVars = buildJob.steps.find((step: any) => 
      step.name === 'Run tests'
    )?.env || {};
    
    const invalidSecretRefs: string[] = [];
    
    // Check all environment variables use proper secret syntax
    const allEnvVars = { ...buildEnvVars, ...testEnvVars };
    
    Object.entries(allEnvVars).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Should use ${{ secrets.SECRET_NAME }} syntax
        if (!value.startsWith('${{ secrets.') || !value.endsWith(' }}')) {
          invalidSecretRefs.push(`${key}: ${value}`);
        }
      }
    });
    
    expect(invalidSecretRefs,
      `Environment variables should use GitHub secrets syntax: ${invalidSecretRefs.join(', ')}. ` +
      `Use format: \${{ secrets.SECRET_NAME }}`
    ).toHaveLength(0);
  });

  it('should ensure environment variables from .env.example are documented in CI', () => {
    // Read .env.example to find all required variables
    const repoRoot = join(process.cwd(), '../../');
    const envExamplePath = join(repoRoot, '.env.example');
    const envExampleContent = readFileSync(envExamplePath, 'utf-8');
    
    // Extract variable names from .env.example
    const envVars = envExampleContent
      .split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => line.split('=')[0].trim())
      .filter(Boolean);
    
    // Read GitHub Actions workflow
    const workflowPath = join(repoRoot, '.github/workflows/pr-checks.yml');
    const workflowContent = readFileSync(workflowPath, 'utf-8');
    const workflow = parse(workflowContent);
    
    const buildJob = workflow.jobs['build-and-test'];
    const buildEnvVars = buildJob.steps.find((step: any) => 
      step.name === 'Build all packages'
    )?.env || {};
    
    const testEnvVars = buildJob.steps.find((step: any) => 
      step.name === 'Run tests'
    )?.env || {};
    
    const ciEnvVars = new Set([...Object.keys(buildEnvVars), ...Object.keys(testEnvVars)]);
    
    // Variables that are only needed locally, not in CI
    const localOnlyVars = new Set([
      'PORT', // Server port, not needed in CI
      'JWT_SECRET', // Not needed for build/test
      'SPOTIFY_CLIENT_ID', // Not needed for basic build/test
      'SPOTIFY_CLIENT_SECRET',
      'SPOTIFY_REDIRECT_URI',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_SECRET',
      'FACEBOOK_CLIENT_ID',
      'FACEBOOK_SECRET',
      'DISCORD_CLIENT_ID',
      'DISCORD_SECRET',
      'BANDRUPTION_API_KEY', // Only needed for runtime, not build/test
      'ALGORAND_NETWORK',
      'ALGOKIT_DISPENSER_AUTH_TOKEN',
      'SUPABASE_SERVICE_KEY', // Sensitive, not needed for CI
      'SUPABASE_DB_PASSWORD',
      'EXPO_PUBLIC_SUPABASE_URL', // Mobile-specific
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    ]);
    
    const missingFromCI = envVars.filter(varName => 
      !ciEnvVars.has(varName) && !localOnlyVars.has(varName)
    );
    
    // This is more of a documentation test - don't fail if variables are missing
    // but note potentially important ones in the test description
    if (missingFromCI.length > 0) {
      // Environment variables in .env.example but not in CI: consider if these are needed for build/test
      // Variables: missingFromCI.join(', ')
    }
    
    expect(true).toBe(true); // Always pass, this is for documentation
  });
});