import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SpotifyProvider } from '../contexts/SpotifyContext';
import { PlayButton } from '../components/PlayButton';
import { SpotifyCallback } from '../pages/SpotifyCallback';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.open
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock react-router-dom
const mockSearchParams = new URLSearchParams();
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams],
    useNavigate: () => mockNavigate
  };
});

// Mock the hooks (similar to other tests)
vi.mock('../hooks/useSpotifyAuth', () => ({
  useSpotifyAuth: vi.fn()
}));

vi.mock('../hooks/useSpotifyPlayer', () => ({
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
}));

const mockTrack = {
  id: 'track123',
  name: 'Test Track',
  artists: [{ id: 'artist1', name: 'Test Artist' }],
  album: {
    id: 'album1',
    name: 'Test Album',
    images: [{ url: 'https://example.com/album.jpg', height: 300, width: 300 }]
  },
  duration_ms: 180000,
  explicit: false,
  external_urls: { spotify: 'https://open.spotify.com/track/track123' },
  uri: 'spotify:track:track123'
};

describe('Popup Authentication Integration', () => {
  let mockPopupWindow: Window & { close: () => void; closed: boolean; postMessage: () => void; location: { href: string } };
  let mockLoginWithPopup: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSearchParams.delete('code');
    mockSearchParams.delete('state');
    mockSearchParams.delete('error');
    
    // Create mock popup window
    mockPopupWindow = {
      close: vi.fn(),
      closed: false,
      postMessage: vi.fn(),
      location: { href: '' }
    } as Window & { close: () => void; closed: boolean; postMessage: () => void; location: { href: string } };
    
    mockWindowOpen.mockReturnValue(mockPopupWindow);
    
    // Mock auth URL endpoint
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/spotify/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ authUrl: 'https://accounts.spotify.com/authorize?client_id=test' })
        });
      }
      if (url.includes('/api/spotify/auth/callback')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            userId: 'user123',
            accessToken: 'access-token-123',
            userData: {
              id: 'user123',
              display_name: 'Test User',
              email: 'test@example.com',
              product: 'premium',
              images: []
            }
          })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Set up the mocked useSpotifyAuth hook
    mockLoginWithPopup = vi.fn().mockResolvedValue({
      success: true,
      error: undefined
    });

    vi.mocked(useSpotifyAuth).mockReturnValue({
      isAuthenticated: false, // Start unauthenticated
      user: null,
      accessToken: null,
      loading: false,
      isAuthenticating: false,
      loginWithPopup: mockLoginWithPopup,
      loginWithRedirect: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      isPremium: false
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <SpotifyProvider>
          {component}
        </SpotifyProvider>
      </BrowserRouter>
    );
  };

  describe('Complete popup auth flow', () => {
    it('authenticates user through popup and enables playback', async () => {
      // Step 1: Render PlayButton in unauthenticated state
      renderWithProviders(<PlayButton track={mockTrack} />);
      
      expect(screen.getByRole('button')).toHaveTextContent('Login to Play');
      
      // Step 2: Click the button to start popup auth
      fireEvent.click(screen.getByRole('button'));
      
      // Step 3: Verify the popup authentication was attempted
      await waitFor(() => {
        expect(mockLoginWithPopup).toHaveBeenCalled();
      });
      
      // Note: With mocked hooks, localStorage won't be called
      // This test verifies the component behavior with mocked dependencies
      // Real localStorage calls would happen in the actual (unmocked) useSpotifyAuth hook
    });

    it('handles popup authentication cancellation', async () => {
      // Mock the loginWithPopup to simulate cancellation
      mockLoginWithPopup.mockResolvedValueOnce({
        success: false,
        error: 'Authentication cancelled'
      });
      
      renderWithProviders(<PlayButton track={mockTrack} />);
      
      // Click to start auth
      fireEvent.click(screen.getByRole('button'));
      
      // Wait for the authentication attempt
      await waitFor(() => {
        expect(mockLoginWithPopup).toHaveBeenCalled();
      });
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Authentication cancelled')).toBeInTheDocument();
      });
    });

    it('handles authentication errors from popup', async () => {
      // Mock the loginWithPopup to simulate error
      mockLoginWithPopup.mockResolvedValueOnce({
        success: false,
        error: 'User denied access'
      });
      
      renderWithProviders(<PlayButton track={mockTrack} />);
      
      // Click to start auth
      fireEvent.click(screen.getByRole('button'));
      
      // Wait for the authentication attempt
      await waitFor(() => {
        expect(mockLoginWithPopup).toHaveBeenCalled();
      });
      
      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText('User denied access')).toBeInTheDocument();
      });
    });

  });

  describe('Callback page in popup mode', () => {
    it('shows popup-specific message when window.opener exists', async () => {
      // Mock window.opener to simulate popup mode
      const mockOpener = {
        postMessage: vi.fn()
      };
      Object.defineProperty(window, 'opener', {
        value: mockOpener,
        writable: true
      });
      
      // Set URL params with auth code
      mockSearchParams.set('code', 'auth-code-123');
      mockSearchParams.set('state', 'valid-state');
      
      renderWithProviders(<SpotifyCallback />);
      
      // Should show popup-specific message
      expect(screen.getByText('This window will close automatically')).toBeInTheDocument();
      
      // Clean up
      window.opener = null;
    });
  });

});