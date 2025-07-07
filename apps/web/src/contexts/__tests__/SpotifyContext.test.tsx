import { render, renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { SpotifyProvider } from '../SpotifyContext'
import { useSpotify } from '../../hooks/useSpotify'
import { ReactNode } from 'react'

// Mock the hooks
vi.mock('../../hooks/useSpotifyAuth', () => ({
  useSpotifyAuth: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    isPremium: false
  }))
}))

vi.mock('../../hooks/useSpotifyPlayer', () => ({
  useSpotifyPlayer: vi.fn(() => ({
    isPlayerReady: false,
    currentTrack: null,
    isPlaying: false,
    position: 0,
    duration: 0,
    playTrack: vi.fn(),
    playPlaylist: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    nextTrack: vi.fn(),
    previousTrack: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    canUsePlayer: false
  }))
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <SpotifyProvider>{children}</SpotifyProvider>
)

describe('SpotifyContext', () => {
  describe('useSpotify hook', () => {
    it('throws error when used outside of SpotifyProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => useSpotify())
      }).toThrow('useSpotify must be used within SpotifyProvider')
      
      consoleSpy.mockRestore()
    })

    it('provides context when used within SpotifyProvider', () => {
      const { result } = renderHook(() => useSpotify(), { wrapper })
      
      expect(result.current).toBeDefined()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.login).toBeDefined()
      expect(result.current.logout).toBeDefined()
    })
  })

  describe('SpotifyProvider', () => {
    it('renders children', () => {
      const TestChild = () => <div>Test Child</div>
      
      const { getByText } = render(
        <SpotifyProvider>
          <TestChild />
        </SpotifyProvider>
      )
      
      expect(getByText('Test Child')).toBeInTheDocument()
    })

    it('provides context values correctly', () => {
      const { result } = renderHook(() => useSpotify(), { wrapper })
      
      // Test that all expected properties exist and have default values from mocks
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBe(null)
      expect(result.current.accessToken).toBe(null)
      expect(result.current.isPremium).toBe(false)
      expect(result.current.isPlayerReady).toBe(false)
      expect(result.current.currentTrack).toBe(null)
      expect(result.current.isPlaying).toBe(false)
      expect(result.current.canUsePlayer).toBe(false)
    })

    it('provides all player control functions', () => {
      const { result } = renderHook(() => useSpotify(), { wrapper })
      
      expect(typeof result.current.playTrack).toBe('function')
      expect(typeof result.current.playPlaylist).toBe('function')
      expect(typeof result.current.pause).toBe('function')
      expect(typeof result.current.resume).toBe('function')
      expect(typeof result.current.nextTrack).toBe('function')
      expect(typeof result.current.previousTrack).toBe('function')
      expect(typeof result.current.seek).toBe('function')
      expect(typeof result.current.setVolume).toBe('function')
    })
  })

  describe('context value structure', () => {
    it('includes all required auth properties', () => {
      const { result } = renderHook(() => useSpotify(), { wrapper })
      
      expect(result.current).toHaveProperty('isAuthenticated')
      expect(result.current).toHaveProperty('user')
      expect(result.current).toHaveProperty('isPremium')
      expect(result.current).toHaveProperty('accessToken')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('login')
      expect(result.current).toHaveProperty('logout')
    })

    it('includes all required player properties', () => {
      const { result } = renderHook(() => useSpotify(), { wrapper })
      
      expect(result.current).toHaveProperty('isPlayerReady')
      expect(result.current).toHaveProperty('currentTrack')
      expect(result.current).toHaveProperty('isPlaying')
      expect(result.current).toHaveProperty('position')
      expect(result.current).toHaveProperty('duration')
      expect(result.current).toHaveProperty('canUsePlayer')
    })

    it('includes all required player control methods', () => {
      const { result } = renderHook(() => useSpotify(), { wrapper })
      
      expect(result.current).toHaveProperty('playTrack')
      expect(result.current).toHaveProperty('playPlaylist')
      expect(result.current).toHaveProperty('pause')
      expect(result.current).toHaveProperty('resume')
      expect(result.current).toHaveProperty('nextTrack')
      expect(result.current).toHaveProperty('previousTrack')
      expect(result.current).toHaveProperty('seek')
      expect(result.current).toHaveProperty('setVolume')
    })
  })
})