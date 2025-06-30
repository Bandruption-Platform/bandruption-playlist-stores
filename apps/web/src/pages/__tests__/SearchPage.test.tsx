import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SearchPage } from '../SearchPage'
import { SpotifyProvider } from '../../contexts/SpotifyContext'
import { popupAuthService } from '../../services/popupAuth'

// Mock the SpotifySearch component since we're testing the connection flow
vi.mock('../../components/SpotifySearch', () => ({
  SpotifySearch: () => <div data-testid="spotify-search">Spotify Search Component</div>
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
window.location = { href: '' } as Location

const renderSearchPageWithSpotify = () => {
  return render(
    <SpotifyProvider>
      <SearchPage />
    </SpotifyProvider>
  )
}

describe('SearchPage - Spotify Connection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    window.location.href = ''
  })

  describe('when user is not authenticated', () => {
    it('shows the Connect Spotify banner', () => {
      renderSearchPageWithSpotify()
      
      expect(screen.getByText('Enhanced Features Available')).toBeInTheDocument()
      expect(screen.getByText('Connect your Spotify account to play full tracks and access your playlists.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Connect Spotify' })).toBeInTheDocument()
    })

    it('initiates Spotify popup login when Connect button is clicked', async () => {
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

      renderSearchPageWithSpotify()
      
      const connectButton = screen.getByRole('button', { name: 'Connect Spotify' })
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(popupAuthService.loginWithPopup).toHaveBeenCalled()
      })
    })

    it('handles popup login errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(popupAuthService.loginWithPopup).mockRejectedValue(new Error('Popup auth failed'))

      renderSearchPageWithSpotify()
      
      const connectButton = screen.getByRole('button', { name: 'Connect Spotify' })
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Popup authentication failed:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'mock-token'
        if (key === 'spotify_user') return JSON.stringify({
          id: 'user123',
          display_name: 'Test User',
          email: 'test@example.com',
          product: 'premium',
          images: []
        })
        return null
      })
    })

    it('does not show the Connect Spotify banner', async () => {
      renderSearchPageWithSpotify()
      
      await waitFor(() => {
        expect(screen.queryByText('Enhanced Features Available')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Connect Spotify' })).not.toBeInTheDocument()
      })
    })

    it('shows the search component', async () => {
      renderSearchPageWithSpotify()
      
      await waitFor(() => {
        expect(screen.getByTestId('spotify-search')).toBeInTheDocument()
      })
    })
  })

  // Note: Auth callback handling is done in the useSpotifyAuth hook
  // Since we're mocking that hook, we don't test the callback handling here
  // The callback handling is tested in the hook's own unit tests

  describe('page content', () => {
    it('renders the page title and description', () => {
      renderSearchPageWithSpotify()
      
      expect(screen.getByRole('heading', { name: 'Search Music' })).toBeInTheDocument()
      expect(screen.getByText('Search millions of tracks, albums, and artists from Spotify\'s catalog.')).toBeInTheDocument()
    })

    it('always renders the SpotifySearch component', () => {
      renderSearchPageWithSpotify()
      
      expect(screen.getByTestId('spotify-search')).toBeInTheDocument()
    })
  })
})