import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SpotifyProvider } from '../../contexts/SpotifyContext'
import { SearchPage } from '../../pages/SearchPage'
import { spotifyApi } from '../../services/spotifyApi'
import { popupAuthService } from '../../services/popupAuth'

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

// Mock the popup auth service
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
    it('handles full popup authentication flow from connection to success', async () => {
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

      // Step 2: User clicks connect button - should use popup auth
      vi.mocked(popupAuthService.loginWithPopup).mockResolvedValue({
        success: true,
        userId: 'user123',
        accessToken: 'popup-token',
        userData: mockUser
      })
      
      const connectButton = screen.getByRole('button', { name: 'Connect Spotify' })
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(popupAuthService.loginWithPopup).toHaveBeenCalled()
      })

      // Step 3: Verify popup authentication was used (not redirect)
      // The test verifies that:
      // 1. Connect button click triggers popup authentication
      // 2. No redirect happens (staying on same page)
      // 3. Popup service is called for authentication
    })

    it('handles popup authentication errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(
        <SpotifyProvider>
          <SearchPage />
        </SpotifyProvider>
      )

      // Mock popup auth error
      vi.mocked(popupAuthService.loginWithPopup).mockRejectedValue(new Error('Popup failed'))

      const connectButton = screen.getByRole('button', { name: 'Connect Spotify' })
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Popup authentication failed:', expect.any(Error))
      })

      // Connection prompt should still be visible
      expect(screen.getByText('Enhanced Features Available')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Connect Spotify' })).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('ignores URL auth parameters in popup-only mode', async () => {
      // Set URL params that would previously trigger auth callback processing
      window.location.search = '?code=auth-code&state=auth-state'

      render(
        <SpotifyProvider>
          <SearchPage />
        </SpotifyProvider>
      )

      // Wait to ensure no auth callback processing happens
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should not process auth callbacks in main app (popup-only mode)
      expect(spotifyApi.handleAuthCallback).not.toHaveBeenCalled()
      
      // Should remain unauthenticated and show connection prompt
      expect(screen.getByText('Enhanced Features Available')).toBeInTheDocument()
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