import { renderHook, act, waitFor } from '@testing-library/react'
import { useSpotifyAuth } from '../useSpotifyAuth'
import { spotifyApi } from '../../services/spotifyApi'
import { popupAuthService } from '../../services/popupAuth'

// Mock the spotifyApi
vi.mock('../../services/spotifyApi', () => ({
  spotifyApi: {
    getAuthUrl: vi.fn(),
    handleAuthCallback: vi.fn(),
    getUserProfile: vi.fn(),
    disconnect: vi.fn()
  }
}))

// Mock the popupAuthService
vi.mock('../../services/popupAuth', () => ({
  popupAuthService: {
    loginWithPopup: vi.fn()
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
delete (window as unknown as { location: unknown }).location
window.location = mockLocation as Location

// Mock URLSearchParams
const mockURLSearchParams = vi.fn()
global.URLSearchParams = mockURLSearchParams as typeof URLSearchParams

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
        expect(result.current.isAuthenticating).toBe(false)
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
    it('initiates Spotify popup login', async () => {
      const mockUser = {
        id: 'user123',
        display_name: 'Test User',
        email: 'test@example.com',
        product: 'premium',
        images: []
      }

      vi.mocked(popupAuthService.loginWithPopup).mockResolvedValue({
        success: true,
        userId: 'user123',
        accessToken: 'popup-token',
        userData: mockUser
      })

      const { result } = renderHook(() => useSpotifyAuth())

      await act(async () => {
        await result.current.login()
      })

      expect(popupAuthService.loginWithPopup).toHaveBeenCalled()
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.accessToken).toBe('popup-token')
    })

    it('handles login errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(popupAuthService.loginWithPopup).mockRejectedValue(new Error('Auth failed'))

      const { result } = renderHook(() => useSpotifyAuth())

      await act(async () => {
        await result.current.login()
      })

      expect(consoleSpy).toHaveBeenCalledWith('Popup authentication failed:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('popup login functionality', () => {
    it('initiates popup login successfully', async () => {
      const mockUser = {
        id: 'user123',
        display_name: 'Test User',
        email: 'test@example.com',
        product: 'premium',
        images: []
      }

      vi.mocked(popupAuthService.loginWithPopup).mockResolvedValue({
        success: true,
        userId: 'user123',
        accessToken: 'popup-token',
        userData: mockUser
      })

      const { result } = renderHook(() => useSpotifyAuth())

      let loginResult: { success: boolean; error?: string }
      await act(async () => {
        loginResult = await result.current.loginWithPopup()
      })

      expect(result.current.isAuthenticating).toBe(false)
      expect(loginResult).toEqual({ success: true })
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.accessToken).toBe('popup-token')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spotify_access_token', 'popup-token')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spotify_user', JSON.stringify(mockUser))
    })

    it('handles popup login failure', async () => {
      vi.mocked(popupAuthService.loginWithPopup).mockResolvedValue({
        success: false,
        error: 'User cancelled authentication'
      })

      const { result } = renderHook(() => useSpotifyAuth())

      let loginResult: { success: boolean; error?: string }
      await act(async () => {
        loginResult = await result.current.loginWithPopup()
      })

      expect(loginResult).toEqual({ 
        success: false, 
        error: 'User cancelled authentication' 
      })
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isAuthenticating).toBe(false)
    })

    it('handles popup login exception', async () => {
      vi.mocked(popupAuthService.loginWithPopup).mockRejectedValue(new Error('Popup blocked'))

      const { result } = renderHook(() => useSpotifyAuth())
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      let loginResult: { success: boolean; error?: string }
      await act(async () => {
        loginResult = await result.current.loginWithPopup()
      })

      expect(loginResult).toEqual({ 
        success: false, 
        error: 'Popup blocked' 
      })
      expect(result.current.isAuthenticating).toBe(false)
      consoleSpy.mockRestore()
    })

    it('sets isAuthenticating during popup login', async () => {
      let resolvePromise: (value: { success: boolean; userId: string; accessToken: string; userData: unknown }) => void
      const loginPromise = new Promise<{ success: boolean; userId: string; accessToken: string; userData: unknown }>((resolve) => {
        resolvePromise = resolve
      })
      vi.mocked(popupAuthService.loginWithPopup).mockReturnValue(loginPromise)

      const { result } = renderHook(() => useSpotifyAuth())

      // Start login
      act(() => {
        result.current.loginWithPopup()
      })

      // Should be authenticating
      expect(result.current.isAuthenticating).toBe(true)

      // Resolve the promise
      await act(async () => {
        resolvePromise({ success: true, userId: 'user123', accessToken: 'token', userData: {} })
        await loginPromise
      })

      // Should no longer be authenticating
      expect(result.current.isAuthenticating).toBe(false)
    })
  })

  describe('popup-only authentication', () => {
    it('login method is the same as loginWithPopup', async () => {
      const { result } = renderHook(() => useSpotifyAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // The login method should be the same reference as loginWithPopup
      expect(result.current.login).toBe(result.current.loginWithPopup)
    })
  })

  describe('authentication state management', () => {
    it('does not process URL auth callbacks in main app', async () => {
      // Set up URL with auth parameters (should be ignored in popup-only mode)
      mockURLSearchParams.mockReturnValue({
        get: vi.fn().mockImplementation((param) => {
          if (param === 'code') return 'auth-code'
          if (param === 'state') return 'auth-state'
          return null
        })
      })

      mockLocation.search = '?code=auth-code&state=auth-state'

      vi.mocked(spotifyApi.handleAuthCallback).mockResolvedValue({
        success: true,
        userId: 'user123',
        accessToken: 'callback-token',
        userData: { id: 'user123', display_name: 'Test User' }
      })

      renderHook(() => useSpotifyAuth())

      // Wait a bit to ensure no auth callback processing
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should not process auth callbacks in main app (only in popup)
      expect(spotifyApi.handleAuthCallback).not.toHaveBeenCalled()
    })

    it('responds to auth-changed events from popup authentication', async () => {
      const mockUser = {
        id: 'user123',
        display_name: 'Test User',
        email: 'test@example.com',
        product: 'premium',
        images: []
      }

      const { result } = renderHook(() => useSpotifyAuth())

      // Initially not authenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      // Mock localStorage to have auth data (as set by popup)
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'token123'
        if (key === 'spotify_user') return JSON.stringify(mockUser)
        return null
      })

      // Simulate auth state change event from popup
      act(() => {
        window.dispatchEvent(new CustomEvent('spotify-auth-changed'))
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.accessToken).toBe('token123')
      })
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