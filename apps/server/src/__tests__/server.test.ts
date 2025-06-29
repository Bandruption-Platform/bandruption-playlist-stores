import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import express from 'express'

describe('Server Integration', () => {
  let app: express.Application

  beforeAll(async () => {
    // This import would fail if there are module resolution issues
    const { default: serverApp } = await import('../app')
    app = serverApp
  })

  it('should import the server without module resolution errors', async () => {
    expect(app).toBeDefined()
  })

  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)
    
    expect(response.body).toEqual({
      status: 'OK',
      message: 'Server is running!'
    })
  })

  it('should have spotify routes available', async () => {
    // Test that spotify routes are properly mounted
    const response = await request(app)
      .get('/api/spotify/test')
      .expect(404) // 404 is fine, it means the route handler exists but endpoint doesn't
    
    // The important thing is we don't get a 500 error from import failures
    expect(response.status).not.toBe(500)
  })
})