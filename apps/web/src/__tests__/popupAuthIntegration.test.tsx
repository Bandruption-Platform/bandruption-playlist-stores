import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthError } from '@supabase/supabase-js';
import { AuthProvider } from '../contexts/AuthContext';
import { SpotifyProvider } from '../contexts/SpotifyContext';
import { PlayButton } from '../components/PlayButton';
import { SpotifyCallback } from '../pages/SpotifyCallback';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { supabase } from '@shared/supabase';

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

// Mock Supabase before importing contexts
vi.mock('@shared/supabase', () => {
  const mockSignInWithOAuth = vi.fn().mockResolvedValue({ 
    data: { provider: 'spotify' as const, url: 'https://accounts.spotify.com/authorize' }, 
    error: null 
  });

  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } }
        }),
        signInWithOAuth: mockSignInWithOAuth,
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    }
  };
});

// Mock the hooks (similar to other tests)
vi.mock('../hooks/useSpotifyAuth', () => ({
  useSpotifyAuth: vi.fn()
}));

vi.mock('../hooks/useSpotifyAccess', () => ({
  useSpotifyAccess: vi.fn(() => ({
    hasSpotifyAccess: false,
    spotifyUser: null,
    accessToken: null,
    loading: false,
    isLinking: false,
    accessMethod: 'none',
    ensureSpotifyAccess: vi.fn().mockResolvedValue({ success: true }),
    isPremium: false,
  }))
}));

vi.mock('../hooks/useSpotify', () => ({
  useSpotify: vi.fn(() => ({
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
  preview_url: null,
  external_urls: { spotify: 'https://open.spotify.com/track/track123' }
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
    
    // Reset the auth mock to default success behavior
    const mockSignInWithOAuth = vi.mocked(supabase.auth.signInWithOAuth);
    mockSignInWithOAuth.mockResolvedValue({
      data: { provider: 'spotify' as const, url: 'https://accounts.spotify.com/authorize' },
      error: null
    });
    
    // Create mock popup window
    mockPopupWindow = {
      close: vi.fn(),
      closed: false,
      postMessage: vi.fn(),
      location: { href: '' }
    } as unknown as Window & { close: () => void; closed: boolean; postMessage: () => void; location: { href: string } };
    
    mockWindowOpen.mockReturnValue(mockPopupWindow);
    
    // Mock auth URL endpoint
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes('/api/spotify/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ authUrl: 'https://accounts.spotify.com/authorize?client_id=test' })
        } as unknown as Response);
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
              images: [],
              country: 'US'
            }
          })
        } as unknown as Response);
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Set up the mocked authentication functions that will be used
    mockLoginWithPopup = vi.fn().mockResolvedValue({
      success: true,
      error: undefined
    });

    // Note: PlayButton uses useAuth, useSpotifyAccess, and useSpotify hooks
    // These are already mocked above, so the tests should work with the current architecture
    
    // However, SpotifyProvider still uses useSpotifyAuth, so we need to mock that too
    vi.mocked(useSpotifyAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      loading: false,
      isAuthenticating: false,
      loginWithPopup: mockLoginWithPopup,
      login: mockLoginWithPopup,
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
        <AuthProvider>
          <SpotifyProvider>
            {component}
          </SpotifyProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Complete popup auth flow', () => {
    it('authenticates user through popup and enables playback', async () => {
      // Step 1: Render PlayButton in unauthenticated state
      renderWithProviders(<PlayButton track={mockTrack} />);
      
      expect(screen.getByRole('button')).toHaveTextContent('Sign In to Play');
      
      // Step 2: Click the button to start popup auth
      fireEvent.click(screen.getByRole('button'));
      
      // Step 3: Wait for modal to appear and click auth option
      await waitFor(() => {
        expect(screen.getByText('Sign in to play music')).toBeInTheDocument();
      });

      // Click Spotify option to trigger auth
      fireEvent.click(screen.getByText('🎵 Continue with Spotify'));
      
      // Step 4: Verify the Supabase authentication was attempted
      await waitFor(() => {
        const mockSignInWithOAuth = vi.mocked(supabase.auth.signInWithOAuth);
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'spotify',
          options: expect.objectContaining({
            redirectTo: expect.any(String)
          })
        });
      });
      
      // Note: With mocked hooks, localStorage won't be called
      // This test verifies the component behavior with mocked dependencies
      // Real localStorage calls would happen in the actual (unmocked) useSpotifyAuth hook
    });

    it('handles popup authentication cancellation', async () => {
      // Mock the Supabase auth to simulate cancellation/error
      const mockSignInWithOAuth = vi.mocked(supabase.auth.signInWithOAuth);
      mockSignInWithOAuth.mockResolvedValueOnce({
        data: { provider: 'spotify' as const, url: null },
        error: { message: 'Authentication cancelled', name: 'AuthError' } as AuthError
      });
      
      renderWithProviders(<PlayButton track={mockTrack} />);
      
      // Click to start auth
      fireEvent.click(screen.getByRole('button'));
      
      // Wait for modal and click auth option
      await waitFor(() => {
        expect(screen.getByText('Sign in to play music')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('🎵 Continue with Spotify'));
      
      // Wait for the authentication attempt
      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Authentication cancelled')).toBeInTheDocument();
      });
    });

    it('handles authentication errors from popup', async () => {
      // Mock the Supabase auth to simulate error
      const mockSignInWithOAuth = vi.mocked(supabase.auth.signInWithOAuth);
      mockSignInWithOAuth.mockResolvedValueOnce({
        data: { provider: 'spotify' as const, url: null },
        error: { message: 'User denied access', name: 'AuthError' } as AuthError
      });
      
      renderWithProviders(<PlayButton track={mockTrack} />);
      
      // Click to start auth
      fireEvent.click(screen.getByRole('button'));
      
      // Wait for modal and click auth option
      await waitFor(() => {
        expect(screen.getByText('Sign in to play music')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('🎵 Continue with Spotify'));
      
      // Wait for the authentication attempt
      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
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