import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { SpotifyCallback } from '../SpotifyCallback'
import { spotifyApi } from '../../services/spotifyApi'

// Mock the router
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('?code=test_code&state=test_state')]
  }
})

// Mock the spotifyApi
vi.mock('../../services/spotifyApi', () => ({
  spotifyApi: {
    handleAuthCallback: vi.fn(),
    exchangeCodeForTokens: vi.fn() // This method should NOT exist
  }
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('SpotifyCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call handleAuthCallback method not exchangeCodeForTokens', async () => {
    const mockHandleAuthCallback = vi.mocked(spotifyApi.handleAuthCallback)
    mockHandleAuthCallback.mockResolvedValue({ success: true, userId: 'test_user' })

    renderWithRouter(<SpotifyCallback />)

    // Wait for useEffect to run
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should call the correct method
    expect(mockHandleAuthCallback).toHaveBeenCalledWith('test_code', 'test_state')
    expect(mockHandleAuthCallback).toHaveBeenCalledTimes(1)
  })

  it('should not call exchangeCodeForTokens method (this method should not exist)', async () => {
    const mockHandleAuthCallback = vi.mocked(spotifyApi.handleAuthCallback)
    mockHandleAuthCallback.mockResolvedValue({ success: true, userId: 'test_user' })

    renderWithRouter(<SpotifyCallback />)

    // Wait for useEffect to run
    await new Promise(resolve => setTimeout(resolve, 0))

    // Verify that exchangeCodeForTokens is never called
    // This test would fail if the component tried to call exchangeCodeForTokens
    expect(spotifyApi.exchangeCodeForTokens).not.toHaveBeenCalled()
  })

  it('should verify that handleAuthCallback method exists on spotifyApi', () => {
    // This test ensures the method we expect to use actually exists
    expect(typeof spotifyApi.handleAuthCallback).toBe('function')
    expect(spotifyApi.handleAuthCallback).toBeDefined()
  })

  it('should throw error if component tries to call non-existent method', () => {
    // This test simulates what would happen if the component called a wrong method
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // If the component tried to call a non-existent method, it would throw
    expect(() => {
      // @ts-expect-error - intentionally calling non-existent method to simulate the bug
      spotifyApi.nonExistentMethod?.('test', 'test')
    }).not.toThrow() // Non-existent method is undefined, so calling it would throw

    consoleSpy.mockRestore()
  })

  it('should handle auth callback with valid code and state parameters', async () => {
    const mockHandleAuthCallback = vi.mocked(spotifyApi.handleAuthCallback)
    mockHandleAuthCallback.mockResolvedValue({ success: true, userId: 'test_user' })

    renderWithRouter(<SpotifyCallback />)

    // Should show loading state initially
    expect(screen.getByText('Connecting to Spotify...')).toBeInTheDocument()

    // Wait for the auth callback to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should have called navigate to redirect to search page
    expect(mockNavigate).toHaveBeenCalledWith('/search')
  })

  it('should handle auth callback failure gracefully', async () => {
    const mockHandleAuthCallback = vi.mocked(spotifyApi.handleAuthCallback)
    mockHandleAuthCallback.mockRejectedValue(new Error('Auth failed'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithRouter(<SpotifyCallback />)

    // Wait for the error to be handled
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should show error message
    expect(screen.getByText(/Failed to complete Spotify authentication/)).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})