import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Vite Configuration', () => {
  it('should not exclude lucide-react from optimizeDeps to prevent infinite icon loading', () => {
    const viteConfigPath = join(process.cwd(), 'vite.config.ts')
    const viteConfigContent = readFileSync(viteConfigPath, 'utf-8')
    
    // Check that lucide-react is not excluded from optimization
    expect(viteConfigContent).not.toContain("exclude: ['lucide-react']")
    expect(viteConfigContent).not.toContain('exclude: ["lucide-react"]')
    expect(viteConfigContent).not.toContain("'lucide-react'")
    
    // More specific check for optimizeDeps exclude pattern
    const excludePattern = /optimizeDeps:\s*{\s*exclude:\s*\[.*?lucide-react.*?\]/s
    expect(viteConfigContent).not.toMatch(excludePattern)
  })

  it('should have proper icon dependencies in package.json', () => {
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    // Ensure lucide-react is properly listed as a dependency
    expect(packageJson.dependencies).toHaveProperty('lucide-react')
    expect(packageJson.dependencies['lucide-react']).toBeTruthy()
  })

  it('should allow Vite to optimize lucide-react for better performance', () => {
    const viteConfigPath = join(process.cwd(), 'vite.config.ts')
    const viteConfigContent = readFileSync(viteConfigPath, 'utf-8')
    
    // If optimizeDeps exists, lucide-react should not be in the exclude list
    if (viteConfigContent.includes('optimizeDeps')) {
      // Extract the optimizeDeps section
      const optimizeDepsMatch = viteConfigContent.match(/optimizeDeps:\s*{([^}]*)}/s)
      if (optimizeDepsMatch) {
        const optimizeDepsSection = optimizeDepsMatch[1]
        expect(optimizeDepsSection).not.toContain('lucide-react')
      }
    }
  })
})