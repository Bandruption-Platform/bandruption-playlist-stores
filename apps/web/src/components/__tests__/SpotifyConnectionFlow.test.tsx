import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { SpotifyProvider } from '../../contexts/SpotifyContext'
import { SearchPage } from '../../pages/SearchPage'
import { spotifyApi } from '../../services/spotifyApi'

// Mock the SpotifySearch component
vi.mock('../../components/SpotifySearch', () => ({
  SpotifySearch: () => <div data-testid="spotify-search">Search Component</div>
}))

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
delete (window as unknown as { location: unknown }).location
window.location = { href: '', search: '' } as Location

describe('Spotify Connection Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    window.location.href = ''
    window.location.search = ''
  })

  describe('Complete connection flow', () => {
    it('handles full authentication flow from connection to success', async () => {
      const mockAuthUrl = 'https://accounts.spotify.com/authorize?client_id=...'
      const mockUser = {
        id: 'user123',
        display_name: 'Test User',
        email: 'test@example.com',
        product: 'premium',
        images: []
      }

      // Step 1: Initial render shows connection prompt
      render(
        <SpotifyProvider>
          <SearchPage />
        </SpotifyProvider>
      )

      expect(screen.getByText('Enhanced Features Available')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Connect Spotify' })).toBeInTheDocument()

      // Step 2: User clicks connect button
      vi.mocked(spotifyApi.getAuthUrl).mockResolvedValue({ authUrl: mockAuthUrl })
      
      const connectButton = screen.getByRole('button', { name: 'Connect Spotify' })
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(spotifyApi.getAuthUrl).toHaveBeenCalled()
        expect(window.location.href).toBe(mockAuthUrl)
      })

      // Step 3: Simulate return from Spotify with auth code
      window.location.search = '?code=auth-code&state=auth-state'
      
      vi.mocked(spotifyApi.handleAuthCallback).mockResolvedValue({
        success: true,
        userId: 'user123'
      })
      vi.mocked(spotifyApi.getUserProfile).mockResolvedValue(mockUser)

      // Mock successful authentication in localStorage
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'new-access-token'
        if (key === 'spotify_user') return JSON.stringify(mockUser)
        return null
      })

      // Step 4: Trigger auth-changed event to simulate successful auth
      act(() => {
        window.dispatchEvent(new Event('spotify-auth-changed'))
      })

      // Step 5: Verify authentication successful
      await waitFor(() => {
        expect(screen.queryByText('Enhanced Features Available')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Connect Spotify' })).not.toBeInTheDocument()
      })
      
      expect(screen.getByTestId('spotify-search')).toBeInTheDocument()

      expect(spotifyApi.handleAuthCallback).toHaveBeenCalledWith('auth-code', 'auth-state')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spotify_user', JSON.stringify(mockUser))
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spotify_connected', 'true')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spotify_user_id', 'user123')
    })

    it('handles authentication errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <SpotifyProvider>
          <SearchPage />
        </SpotifyProvider>
      )

      // Mock API error
      vi.mocked(spotifyApi.getAuthUrl).mockRejectedValue(new Error('Network error'))

      const connectButton = screen.getByRole('button', { name: 'Connect Spotify' })
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Login failed:', expect.any(Error))
      })

      // Connection prompt should still be visible
      expect(screen.getByText('Enhanced Features Available')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Connect Spotify' })).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('handles callback errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Simulate auth callback with error
      window.location.search = '?code=auth-code&state=auth-state'
      vi.mocked(spotifyApi.handleAuthCallback).mockRejectedValue(new Error('Invalid code'))

      render(
        <SpotifyProvider>
          <SearchPage />
        </SpotifyProvider>
      )

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Auth callback failed:', expect.any(Error))
      })

      // Should remain unauthenticated
      expect(screen.getByText('Enhanced Features Available')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('State persistence', () => {
    it('restores authentication state from localStorage on page load', async () => {
      const storedUser = {
        id: 'stored-user',
        display_name: 'Stored User',
        email: 'stored@example.com',
        product: 'premium',
        images: []
      }

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'stored-token'
        if (key === 'spotify_user') return JSON.stringify(storedUser)
        return null
      })

      render(
        <SpotifyProvider>
          <SearchPage />
        </SpotifyProvider>
      )

      await waitFor(() => {
        expect(screen.queryByText('Enhanced Features Available')).not.toBeInTheDocument()
        expect(screen.getByTestId('spotify-search')).toBeInTheDocument()
      })
    })

    it('handles corrupted localStorage data gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'stored-token'
        if (key === 'spotify_user') return 'invalid-json'
        return null
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <SpotifyProvider>
          <SearchPage />
        </SpotifyProvider>
      )

      await waitFor(() => {
        // Should fall back to unauthenticated state
        expect(screen.getByText('Enhanced Features Available')).toBeInTheDocument()
        // Should have cleared corrupted data
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('spotify_access_token')
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('spotify_user')
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Connection banner content', () => {
    it('displays correct messaging for unauthenticated users', () => {
      render(
        <SpotifyProvider>
          <SearchPage />
        </SpotifyProvider>
      )

      expect(screen.getByText('Enhanced Features Available')).toBeInTheDocument()
      expect(screen.getByText('Connect your Spotify account to play full tracks and access your playlists.')).toBeInTheDocument()
      
      const button = screen.getByRole('button', { name: 'Connect Spotify' })
      expect(button).toHaveClass('bg-green-500')
    })

    it('has proper accessibility attributes', () => {
      render(
        <SpotifyProvider>
          <SearchPage />
        </SpotifyProvider>
      )

      const button = screen.getByRole('button', { name: 'Connect Spotify' })
      expect(button).toBeEnabled()
    })
  })
})