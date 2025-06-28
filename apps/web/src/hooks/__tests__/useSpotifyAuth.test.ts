import { renderHook, act, waitFor } from '@testing-library/react'
import { useSpotifyAuth } from '../useSpotifyAuth'
import { spotifyApi } from '../../services/spotifyApi'

// Mock the spotifyApi
vi.mock('../../services/spotifyApi', () => ({
  spotifyApi: {
    getAuthUrl: vi.fn(),
    handleAuthCallback: vi.fn(),
    getUserProfile: vi.fn(),
    disconnect: vi.fn()
  }
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock window.location
const mockLocation = {
  href: '',
  search: ''
}
delete (window as any).location
window.location = mockLocation as any

// Mock URLSearchParams
const mockURLSearchParams = vi.fn()
global.URLSearchParams = mockURLSearchParams as any

describe('useSpotifyAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockLocation.search = ''
    mockURLSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue(null)
    })
  })

  describe('initialization', () => {
    it('transitions to loaded state', async () => {
      const { result } = renderHook(() => useSpotifyAuth())
      
      // After useEffect runs, loading should be false
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBe(null)
        expect(result.current.accessToken).toBe(null)
      })
    })

    it('loads stored authentication data', async () => {
      const mockUser = {
        id: 'user123',
        display_name: 'Test User',
        email: 'test@example.com',
        product: 'premium',
        images: []
      }
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'stored-token'
        if (key === 'spotify_user') return JSON.stringify(mockUser)
        return null
      })

      const { result } = renderHook(() => useSpotifyAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.accessToken).toBe('stored-token')
        expect(result.current.isPremium).toBe(true)
      })
    })

    it('handles missing stored data', async () => {
      const { result } = renderHook(() => useSpotifyAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBe(null)
        expect(result.current.accessToken).toBe(null)
        expect(result.current.isPremium).toBe(false)
      })
    })
  })

  describe('login functionality', () => {
    it('initiates Spotify login', async () => {
      const mockAuthUrl = 'https://accounts.spotify.com/authorize?...'
      vi.mocked(spotifyApi.getAuthUrl).mockResolvedValue({ authUrl: mockAuthUrl })

      const { result } = renderHook(() => useSpotifyAuth())

      await act(async () => {
        await result.current.login()
      })

      expect(spotifyApi.getAuthUrl).toHaveBeenCalled()
      expect(window.location.href).toBe(mockAuthUrl)
    })

    it('handles login errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(spotifyApi.getAuthUrl).mockRejectedValue(new Error('Auth failed'))

      const { result } = renderHook(() => useSpotifyAuth())

      await act(async () => {
        await result.current.login()
      })

      expect(consoleSpy).toHaveBeenCalledWith('Login failed:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('auth callback handling', () => {
    it('processes auth callback with code and state', async () => {
      const mockUser = {
        id: 'user123',
        display_name: 'Test User',
        email: 'test@example.com',
        product: 'free',
        images: []
      }

      mockURLSearchParams.mockReturnValue({
        get: vi.fn().mockImplementation((param) => {
          if (param === 'code') return 'auth-code'
          if (param === 'state') return 'auth-state'
          return null
        })
      })

      vi.mocked(spotifyApi.handleAuthCallback).mockResolvedValue({
        success: true,
        userId: 'user123'
      })
      vi.mocked(spotifyApi.getUserProfile).mockResolvedValue(mockUser)

      const { result } = renderHook(() => useSpotifyAuth())

      await waitFor(() => {
        expect(spotifyApi.handleAuthCallback).toHaveBeenCalledWith('auth-code', 'auth-state')
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spotify_user', JSON.stringify(mockUser))
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spotify_connected', 'true')
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spotify_user_id', 'user123')
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.isPremium).toBe(false)
      })
    })

    it('handles auth callback errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockURLSearchParams.mockReturnValue({
        get: vi.fn().mockImplementation((param) => {
          if (param === 'code') return 'auth-code'
          if (param === 'state') return 'auth-state'
          return null
        })
      })

      vi.mocked(spotifyApi.handleAuthCallback).mockRejectedValue(new Error('Callback failed'))

      renderHook(() => useSpotifyAuth())

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Auth callback failed:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('logout functionality', () => {
    it('clears authentication state', async () => {
      const mockUser = {
        id: 'user123',
        display_name: 'Test User',
        email: 'test@example.com',
        product: 'premium',
        images: []
      }
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'stored-token'
        if (key === 'spotify_user') return JSON.stringify(mockUser)
        return null
      })

      const { result } = renderHook(() => useSpotifyAuth())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.accessToken).toBe(null)
      expect(spotifyApi.disconnect).toHaveBeenCalled()
    })
  })

  describe('premium status detection', () => {
    it('correctly identifies premium users', async () => {
      const premiumUser = {
        id: 'user123',
        display_name: 'Premium User',
        email: 'premium@example.com',
        product: 'premium',
        images: []
      }
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'stored-token'
        if (key === 'spotify_user') return JSON.stringify(premiumUser)
        return null
      })

      const { result } = renderHook(() => useSpotifyAuth())

      await waitFor(() => {
        expect(result.current.isPremium).toBe(true)
      })
    })

    it('correctly identifies free users', async () => {
      const freeUser = {
        id: 'user123',
        display_name: 'Free User',
        email: 'free@example.com',
        product: 'free',
        images: []
      }
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'stored-token'
        if (key === 'spotify_user') return JSON.stringify(freeUser)
        return null
      })

      const { result } = renderHook(() => useSpotifyAuth())

      await waitFor(() => {
        expect(result.current.isPremium).toBe(false)
      })
    })
  })

  describe('event listeners', () => {
    it('responds to spotify-auth-changed events', async () => {
      const { result } = renderHook(() => useSpotifyAuth())

      // Initially not authenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      // Mock authentication data being available
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'new-token'
        if (key === 'spotify_user') return JSON.stringify({
          id: 'user123',
          display_name: 'Test User',
          email: 'test@example.com',
          product: 'premium',
          images: []
        })
        return null
      })

      // Fire the custom event
      act(() => {
        window.dispatchEvent(new Event('spotify-auth-changed'))
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.accessToken).toBe('new-token')
      })
    })
  })
})