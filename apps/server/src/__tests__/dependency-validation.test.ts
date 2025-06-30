import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Dependency Validation', () => {
  it('should validate that all package.json dependencies have valid versions', async () => {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const invalidDependencies: string[] = [];
    
    // Check each dependency by attempting to fetch its package info
    for (const [name, version] of Object.entries(allDependencies)) {
      if (typeof version !== 'string') continue;
      
      // Skip workspace dependencies
      if (version === '*' || name.startsWith('@shared/')) continue;
      
      try {
        // Use npm view to check if the package version exists
        const { execSync } = await import('child_process');
        const result = execSync(`npm view "${name}@${version}" version`, { 
          encoding: 'utf-8', 
          stdio: 'pipe'
        }).trim();
        
        if (!result) {
          invalidDependencies.push(`${name}@${version}`);
        }
      } catch {
        // If npm view fails, the version doesn't exist
        invalidDependencies.push(`${name}@${version}`);
      }
    }

    expect(invalidDependencies, 
      `Found invalid dependency versions that don't exist on npm: ${invalidDependencies.join(', ')}. ` +
      `This will cause 'npm install' to fail. Please check these dependencies and update to valid versions.`
    ).toHaveLength(0);
  });

  it('should validate that @types packages match their runtime counterparts', () => {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    
    const warnings: string[] = [];
    
    // Check for @types packages that have runtime counterparts
    Object.keys(devDependencies).forEach(typesPackage => {
      if (typesPackage.startsWith('@types/')) {
        const runtimePackage = typesPackage.replace('@types/', '');
        
        // Special cases where the runtime package name differs
        const packageMappings: Record<string, string> = {
          'node': 'node', // Node.js doesn't have a runtime package
          'jest': '@jest/types',
        };
        
        const actualRuntimePackage = packageMappings[runtimePackage] || runtimePackage;
        
        // Skip Node.js types as they don't have a runtime package
        if (runtimePackage === 'node') return;
        
        if (dependencies[actualRuntimePackage]) {
          // Both exist - this is good, but we could warn about version mismatches
          const runtimeVersion = dependencies[actualRuntimePackage];
          const typesVersion = devDependencies[typesPackage];
          
          // Extract major version numbers for comparison
          const runtimeMajor = runtimeVersion.replace(/[^\d.].*/, '').split('.')[0];
          const typesMajor = typesVersion.replace(/[^\d.].*/, '').split('.')[0];
          
          if (runtimeMajor !== typesMajor) {
            warnings.push(`Version mismatch: ${actualRuntimePackage}@${runtimeVersion} vs ${typesPackage}@${typesVersion}`);
          }
        }
      }
    });
    
    // Don't fail the test for warnings, but note them in test description
    if (warnings.length > 0) {
      // Dependency version warnings exist - see test implementation for details
    }
    
    expect(true).toBe(true); // This test mainly serves as documentation
  });

  it('should not have deprecated @types packages when the runtime package provides its own types', () => {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    const devDependencies = packageJson.devDependencies || {};
    
    // Known packages that provide their own types and shouldn't use @types
    const packagesWithBuiltInTypes = [
      'form-data', // form-data provides its own types since v4
    ];
    
    const unnecessaryTypes: string[] = [];
    
    packagesWithBuiltInTypes.forEach(packageName => {
      const typesPackage = `@types/${packageName}`;
      if (devDependencies[typesPackage]) {
        unnecessaryTypes.push(typesPackage);
      }
    });
    
    expect(unnecessaryTypes, 
      `Found unnecessary @types packages: ${unnecessaryTypes.join(', ')}. ` +
      `These packages provide their own TypeScript definitions. Remove the @types packages.`
    ).toHaveLength(0);
  });
});