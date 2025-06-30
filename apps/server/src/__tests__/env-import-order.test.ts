import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

describe('Environment Variable Import Order', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env }
    
    // Clear environment variables that we're testing
    delete process.env.SPOTIFY_CLIENT_ID
    delete process.env.SPOTIFY_CLIENT_SECRET
    delete process.env.SPOTIFY_REDIRECT_URI
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  it('should have dotenv.config() before any imports that use process.env in spotifyService.ts', () => {
    const servicePath = join(process.cwd(), 'src/services/spotifyService.ts')
    const serviceContent = readFileSync(servicePath, 'utf-8')
    
    const lines = serviceContent.split('\n')
    let dotenvConfigLine = -1
    let firstProcessEnvUsage = -1
    let spotifyWebApiImport = -1
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Find dotenv.config() call
      if (line.includes('dotenv.config()')) {
        dotenvConfigLine = i
      }
      
      // Find SpotifyWebApi import (which uses process.env in constructor)
      if (line.includes("import SpotifyWebApi from 'spotify-web-api-node'")) {
        spotifyWebApiImport = i
      }
      
      // Find first usage of process.env
      if (line.includes('process.env.SPOTIFY_') && firstProcessEnvUsage === -1) {
        firstProcessEnvUsage = i
      }
    }
    
    // dotenv.config() must be called before SpotifyWebApi import
    expect(dotenvConfigLine).toBeGreaterThan(-1)
    expect(spotifyWebApiImport).toBeGreaterThan(-1)
    expect(dotenvConfigLine).toBeLessThan(spotifyWebApiImport)
    
    // And before any process.env usage
    if (firstProcessEnvUsage > -1) {
      expect(dotenvConfigLine).toBeLessThan(firstProcessEnvUsage)
    }
  })

  it('should load environment variables correctly when spotifyService is imported', () => {
    const servicePath = join(process.cwd(), 'src/services/spotifyService.ts')
    const serviceContent = readFileSync(servicePath, 'utf-8')
    
    // Check that the service file itself calls dotenv.config()
    // This ensures env vars are available when the class constructor runs
    expect(serviceContent).toContain('dotenv.config()')
    
    // The dotenv.config() should be at the very top before any other imports
    const lines = serviceContent.split('\n').filter(line => line.trim() !== '')
    const firstNonCommentLine = lines.find(line => !line.trim().startsWith('//') && !line.trim().startsWith('/*'))
    
    // First real line should be importing dotenv or calling dotenv.config()
    expect(firstNonCommentLine).toMatch(/import.*dotenv|dotenv\.config/)
  })

  it('should have proper error handling structure for missing credentials', () => {
    const servicePath = join(process.cwd(), 'src/services/spotifyService.ts')
    const serviceContent = readFileSync(servicePath, 'utf-8')
    
    // Service should handle cases where env vars might be undefined
    // Look for the constructor that accesses process.env
    expect(serviceContent).toContain('process.env.SPOTIFY_CLIENT_ID')
    expect(serviceContent).toContain('process.env.SPOTIFY_CLIENT_SECRET')
    expect(serviceContent).toContain('process.env.SPOTIFY_REDIRECT_URI')
    
    // Should have error handling in getClientCredentialsToken method
    expect(serviceContent).toContain('catch')
    expect(serviceContent).toContain('throw new Error')
  })

  it('should have dotenv.config() before any imports in bandruptionService.ts', () => {
    const servicePath = join(process.cwd(), 'src/services/bandruptionService.ts')
    const serviceContent = readFileSync(servicePath, 'utf-8')
    
    const lines = serviceContent.split('\n')
    let dotenvConfigLine = -1
    let firstProcessEnvUsage = -1
    let nodeEnvUsage = -1
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Find dotenv.config() call
      if (line.includes('dotenv.config()')) {
        dotenvConfigLine = i
      }
      
      // Find first usage of process.env
      if (line.includes('process.env.BANDRUPTION_API_KEY') && firstProcessEnvUsage === -1) {
        firstProcessEnvUsage = i
      }
      
      // Find node-fetch import
      if (line.includes("import fetch from 'node-fetch'")) {
        nodeEnvUsage = i
      }
    }
    
    // dotenv.config() must be called before node-fetch import
    expect(dotenvConfigLine).toBeGreaterThan(-1)
    expect(nodeEnvUsage).toBeGreaterThan(-1)
    expect(dotenvConfigLine).toBeLessThan(nodeEnvUsage)
    
    // And before any process.env usage
    if (firstProcessEnvUsage > -1) {
      expect(dotenvConfigLine).toBeLessThan(firstProcessEnvUsage)
    }
  })

  it('should have dotenv.config() before any imports in algorandService.ts', () => {
    const servicePath = join(process.cwd(), 'src/services/algorandService.ts')
    const serviceContent = readFileSync(servicePath, 'utf-8')
    
    const lines = serviceContent.split('\n')
    let dotenvConfigLine = -1
    let firstProcessEnvUsage = -1
    let algosdkImport = -1
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Find dotenv.config() call
      if (line.includes('dotenv.config()')) {
        dotenvConfigLine = i
      }
      
      // Find first usage of process.env
      if (line.includes('process.env.NODELY_') && firstProcessEnvUsage === -1) {
        firstProcessEnvUsage = i
      }
      
      // Find algosdk import
      if (line.includes("import algosdk from 'algosdk'")) {
        algosdkImport = i
      }
    }
    
    // dotenv.config() must be called before algosdk import
    expect(dotenvConfigLine).toBeGreaterThan(-1)
    expect(algosdkImport).toBeGreaterThan(-1)
    expect(dotenvConfigLine).toBeLessThan(algosdkImport)
    
    // And before any process.env usage
    if (firstProcessEnvUsage > -1) {
      expect(dotenvConfigLine).toBeLessThan(firstProcessEnvUsage)
    }
  })

  it('should automatically detect all service files that use process.env and validate dotenv pattern', () => {
    const servicesPath = join(process.cwd(), 'src/services')
    
    // Get all .ts files in services directory
    const serviceFiles = readdirSync(servicesPath)
      .filter((file: string) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
      .map((file: string) => join(servicesPath, file))
    
    const servicesWithEnvVarIssues: string[] = []
    
    serviceFiles.forEach((filePath: string) => {
      const content = readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      
      // Check if file uses process.env
      const usesProcessEnv = content.includes('process.env.')
      if (!usesProcessEnv) return
      
      // Check if it has dotenv.config()
      const hasDotenvConfig = content.includes('dotenv.config()')
      
      // Find positions
      let dotenvConfigLine = -1
      let firstProcessEnvUsage = -1
      let firstImportLine = -1
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (line.includes('dotenv.config()')) {
          dotenvConfigLine = i
        }
        
        if (line.includes('process.env.') && firstProcessEnvUsage === -1) {
          firstProcessEnvUsage = i
        }
        
        if (line.startsWith('import ') && !line.includes('dotenv') && firstImportLine === -1) {
          firstImportLine = i
        }
      }
      
      const fileName = filePath.split('/').pop()
      
      if (!hasDotenvConfig) {
        servicesWithEnvVarIssues.push(`${fileName}: Missing dotenv.config() but uses process.env`)
      } else {
        // Validate order
        if (firstImportLine > -1 && dotenvConfigLine > firstImportLine) {
          servicesWithEnvVarIssues.push(`${fileName}: dotenv.config() must come before imports`)
        }
        
        if (firstProcessEnvUsage > -1 && dotenvConfigLine > firstProcessEnvUsage) {
          servicesWithEnvVarIssues.push(`${fileName}: dotenv.config() must come before process.env usage`)
        }
      }
    })
    
    expect(servicesWithEnvVarIssues, 
      `Service files with environment variable loading issues: ${servicesWithEnvVarIssues.join(', ')}. ` +
      `All services that use process.env must call dotenv.config() at the top of the file.`
    ).toHaveLength(0)
  })
})