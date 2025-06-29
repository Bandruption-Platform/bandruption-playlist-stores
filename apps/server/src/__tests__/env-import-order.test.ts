import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'fs'
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
})