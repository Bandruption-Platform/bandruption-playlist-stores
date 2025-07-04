import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PlayButton } from '../PlayButton';
import { useAuth } from '../../contexts/AuthContext';
import { useSpotifyAccess } from '../../hooks/useSpotifyAccess';
import { useSpotify } from '../../hooks/useSpotify';

// Mock the hooks and contexts
vi.mock('../../contexts/AuthContext');
vi.mock('../../hooks/useSpotifyAccess');
vi.mock('../../hooks/useSpotify');

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

describe('PlayButton', () => {
  const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>;
  const mockUseSpotifyAccess = useSpotifyAccess as vi.MockedFunction<typeof useSpotifyAccess>;
  const mockUseSpotify = useSpotify as vi.MockedFunction<typeof useSpotify>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window methods
    Object.defineProperty(window, 'open', {
      writable: true,
      value: vi.fn(),
    });

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  describe('Unauthenticated state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signInWithOAuth: vi.fn(),
        signInWithOAuthPopup: vi.fn(),
        signInWithEmail: vi.fn(),
        signUpWithEmail: vi.fn(),
        signOut: vi.fn(),
        hasSpotifyAccess: false,
        getSpotifyAccessMethod: vi.fn(() => 'none'),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: false,
        spotifyUser: null,
        accessToken: null,
        loading: false,
        isLinking: false,
        accessMethod: 'none',
        ensureSpotifyAccess: vi.fn().mockResolvedValue({ success: true }),
        isPremium: false,
      });

      mockUseSpotify.mockReturnValue({
        isAuthenticated: false,
        isPremium: false,
        loginWithPopup: vi.fn(),
        playTrack: vi.fn(),
        isPlayerReady: false,
        isAuthenticating: false,
        user: null,
        accessToken: null,
        loading: false,
        login: vi.fn(),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        currentTrack: null,
        isPlaying: false,
        position: 0,
        duration: 0,
        canUsePlayer: false,
        playPlaylist: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        nextTrack: vi.fn(),
        previousTrack: vi.fn(),
        seek: vi.fn(),
        setVolume: vi.fn()
      });
    });

    it('shows Sign In to Play button when not authenticated', () => {
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Sign In to Play');
      expect(button).not.toBeDisabled();
    });

    it('shows auth modal when clicked while unauthenticated', async () => {
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Sign in to play music')).toBeInTheDocument();
      });
    });

    it('shows error message when popup login fails', async () => {
      const mockSignInWithOAuthPopup = vi.fn().mockResolvedValue({ 
        success: false, 
        error: 'Popup blocked' 
      });

      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signInWithOAuth: vi.fn(),
        signInWithOAuthPopup: mockSignInWithOAuthPopup,
        signInWithEmail: vi.fn(),
        signUpWithEmail: vi.fn(),
        signOut: vi.fn(),
        hasSpotifyAccess: false,
        getSpotifyAccessMethod: vi.fn(() => 'none'),
      });
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Sign in to play music')).toBeInTheDocument();
      });

      // Click Spotify option
      const spotifyButton = screen.getByText('🎵 Continue with Spotify');
      fireEvent.click(spotifyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Popup blocked')).toBeInTheDocument();
      });
    });

    it('shows connecting state while authenticating', () => {
      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: false,
        spotifyUser: null,
        accessToken: null,
        loading: false,
        isLinking: true, // Simulating linking state
        accessMethod: 'none',
        ensureSpotifyAccess: vi.fn().mockResolvedValue({ success: true }),
        isPremium: false,
      });
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Connecting...');
      expect(button).toBeDisabled();
    });
  });

  describe('Authenticated without Spotify', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token', user: { id: '123' } },
        loading: false,
        signInWithOAuth: vi.fn(),
        signInWithOAuthPopup: vi.fn(),
        signInWithEmail: vi.fn(),
        signUpWithEmail: vi.fn(),
        signOut: vi.fn(),
        hasSpotifyAccess: false,
        getSpotifyAccessMethod: vi.fn(() => 'none'),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: false,
        spotifyUser: null,
        accessToken: null,
        loading: false,
        isLinking: false,
        accessMethod: 'none',
        ensureSpotifyAccess: vi.fn().mockResolvedValue({ success: true }),
        isPremium: false,
      });
    });

    it('shows Connect Spotify button for authenticated users without Spotify', () => {
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Connect Spotify');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Free user state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token', user: { id: '123' } },
        loading: false,
        signInWithOAuth: vi.fn(),
        signInWithOAuthPopup: vi.fn(),
        signInWithEmail: vi.fn(),
        signUpWithEmail: vi.fn(),
        signOut: vi.fn(),
        hasSpotifyAccess: true,
        getSpotifyAccessMethod: vi.fn(() => 'linked'),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: true,
        spotifyUser: { 
          id: 'spotify-user-1',
          display_name: 'Test User',
          email: 'test@example.com',
          images: [{ url: 'https://example.com/avatar.jpg', width: 64, height: 64 }],
          country: 'US',
          product: 'free'
        },
        accessToken: 'spotify-token',
        loading: false,
        isLinking: false,
        accessMethod: 'linked',
        ensureSpotifyAccess: vi.fn().mockResolvedValue({ success: true }),
        isPremium: false,
      });

      mockUseSpotify.mockReturnValue({
        isAuthenticated: true,
        isPremium: false,
        loginWithPopup: vi.fn(),
        playTrack: vi.fn(),
        isPlayerReady: false,
        isAuthenticating: false,
        user: { 
          id: 'spotify-user-1',
          display_name: 'Test User',
          email: 'test@example.com',
          images: [{ url: 'https://example.com/avatar.jpg', width: 64, height: 64 }],
          country: 'US',
          product: 'free'
        },
        accessToken: 'spotify-token',
        loading: false,
        login: vi.fn(),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        currentTrack: null,
        isPlaying: false,
        position: 0,
        duration: 0,
        canUsePlayer: false,
        playPlaylist: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        nextTrack: vi.fn(),
        previousTrack: vi.fn(),
        seek: vi.fn(),
        setVolume: vi.fn()
      });
    });
    
    it('shows Play in Spotify button for free users', () => {
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Play in Spotify');
      expect(button).toHaveClass('external');
    });

    it('attempts deep link then opens web link for free users', async () => {
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(window.location.href).toBe('spotify:track:track123');
      
      // Wait for fallback
      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith(
          'https://open.spotify.com/track/track123',
          '_blank'
        );
      }, { timeout: 2000 });
    });
  });

  describe('Premium user state', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token', user: { id: '123' } },
        loading: false,
        signInWithOAuth: vi.fn(),
        signInWithOAuthPopup: vi.fn(),
        signInWithEmail: vi.fn(),
        signUpWithEmail: vi.fn(),
        signOut: vi.fn(),
        hasSpotifyAccess: true,
        getSpotifyAccessMethod: vi.fn(() => 'primary'),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: true,
        spotifyUser: { 
          id: 'spotify-user-1',
          display_name: 'Test User',
          email: 'test@example.com',
          images: [{ url: 'https://example.com/avatar.jpg', width: 64, height: 64 }],
          country: 'US',
          product: 'premium'
        },
        accessToken: 'spotify-token',
        loading: false,
        isLinking: false,
        accessMethod: 'primary',
        ensureSpotifyAccess: vi.fn().mockResolvedValue({ success: true }),
        isPremium: true,
      });

      mockUseSpotify.mockReturnValue({
        isAuthenticated: true,
        isPremium: true,
        loginWithPopup: vi.fn(),
        playTrack: vi.fn(),
        isPlayerReady: true,
        isAuthenticating: false,
        user: { 
          id: 'spotify-user-1',
          display_name: 'Test User',
          email: 'test@example.com',
          images: [{ url: 'https://example.com/avatar.jpg', width: 64, height: 64 }],
          country: 'US',
          product: 'premium'
        },
        accessToken: 'spotify-token',
        loading: false,
        login: vi.fn(),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        currentTrack: null,
        isPlaying: false,
        position: 0,
        duration: 0,
        canUsePlayer: true,
        playPlaylist: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        nextTrack: vi.fn(),
        previousTrack: vi.fn(),
        seek: vi.fn(),
        setVolume: vi.fn()
      });
    });

    it('shows Play button for premium users with ready player', () => {
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Play');
      expect(button).toHaveClass('internal');
      expect(button).not.toBeDisabled();
    });

    it('shows Loading Player when player not ready', () => {
      mockUseSpotify.mockReturnValue({
        isAuthenticated: true,
        isPremium: true,
        loginWithPopup: vi.fn(),
        playTrack: vi.fn(),
        isPlayerReady: false,
        isAuthenticating: false,
        user: { 
          id: 'spotify-user-1',
          display_name: 'Test User',
          email: 'test@example.com',
          images: [{ url: 'https://example.com/avatar.jpg', width: 64, height: 64 }],
          country: 'US',
          product: 'premium'
        },
        accessToken: 'spotify-token',
        loading: false,
        login: vi.fn(),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        currentTrack: null,
        isPlaying: false,
        position: 0,
        duration: 0,
        canUsePlayer: true,
        playPlaylist: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        nextTrack: vi.fn(),
        previousTrack: vi.fn(),
        seek: vi.fn(),
        setVolume: vi.fn()
      });
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Loading Player...');
      expect(button).toBeDisabled();
    });

    it('plays track when clicked', async () => {
      const mockPlayTrack = vi.fn();
      mockUseSpotify.mockReturnValue({
        isAuthenticated: true,
        isPremium: true,
        loginWithPopup: vi.fn(),
        playTrack: mockPlayTrack,
        isPlayerReady: true,
        isAuthenticating: false,
        user: { 
          id: 'spotify-user-1',
          display_name: 'Test User',
          email: 'test@example.com',
          images: [{ url: 'https://example.com/avatar.jpg', width: 64, height: 64 }],
          country: 'US',
          product: 'premium'
        },
        accessToken: 'spotify-token',
        loading: false,
        login: vi.fn(),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        currentTrack: null,
        isPlaying: false,
        position: 0,
        duration: 0,
        canUsePlayer: true,
        playPlaylist: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        nextTrack: vi.fn(),
        previousTrack: vi.fn(),
        seek: vi.fn(),
        setVolume: vi.fn()
      });
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockPlayTrack).toHaveBeenCalledWith('spotify:track:track123');
      });
    });

    it('opens Spotify on playback failure', async () => {
      const mockPlayTrack = vi.fn().mockRejectedValue(new Error('Playback failed'));
      mockUseSpotify.mockReturnValue({
        isAuthenticated: true,
        isPremium: true,
        loginWithPopup: vi.fn(),
        playTrack: mockPlayTrack,
        isPlayerReady: true,
        isAuthenticating: false,
        user: { 
          id: 'spotify-user-1',
          display_name: 'Test User',
          email: 'test@example.com',
          images: [{ url: 'https://example.com/avatar.jpg', width: 64, height: 64 }],
          country: 'US',
          product: 'premium'
        },
        accessToken: 'spotify-token',
        loading: false,
        login: vi.fn(),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        currentTrack: null,
        isPlaying: false,
        position: 0,
        duration: 0,
        canUsePlayer: true,
        playPlaylist: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        nextTrack: vi.fn(),
        previousTrack: vi.fn(),
        seek: vi.fn(),
        setVolume: vi.fn()
      });
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith(
          'https://open.spotify.com/track/track123',
          '_blank'
        );
      });
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signInWithOAuth: vi.fn(),
        signInWithOAuthPopup: vi.fn(),
        signInWithEmail: vi.fn(),
        signUpWithEmail: vi.fn(),
        signOut: vi.fn(),
        hasSpotifyAccess: false,
        getSpotifyAccessMethod: vi.fn(() => 'none'),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: false,
        spotifyUser: null,
        accessToken: null,
        loading: false,
        isLinking: false,
        accessMethod: 'none',
        ensureSpotifyAccess: vi.fn().mockResolvedValue({ success: true }),
        isPremium: false,
      });

      render(<PlayButton track={mockTrack} className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('applies external class for non-premium users', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token', user: { id: '123' } },
        loading: false,
        signInWithOAuth: vi.fn(),
        signInWithOAuthPopup: vi.fn(),
        signInWithEmail: vi.fn(),
        signUpWithEmail: vi.fn(),
        signOut: vi.fn(),
        hasSpotifyAccess: true,
        getSpotifyAccessMethod: vi.fn(() => 'linked'),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: true,
        spotifyUser: { 
          id: 'spotify-user-1',
          display_name: 'Test User',
          email: 'test@example.com',
          images: [{ url: 'https://example.com/avatar.jpg', width: 64, height: 64 }],
          country: 'US',
          product: 'free'
        },
        accessToken: 'spotify-token',
        loading: false,
        isLinking: false,
        accessMethod: 'linked',
        ensureSpotifyAccess: vi.fn().mockResolvedValue({ success: true }),
        isPremium: false,
      });

      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('external');
    });

    it('applies internal class for premium users', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '123', email: 'test@example.com' },
        session: { access_token: 'token', user: { id: '123' } },
        loading: false,
        signInWithOAuth: vi.fn(),
        signInWithOAuthPopup: vi.fn(),
        signInWithEmail: vi.fn(),
        signUpWithEmail: vi.fn(),
        signOut: vi.fn(),
        hasSpotifyAccess: true,
        getSpotifyAccessMethod: vi.fn(() => 'primary'),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: true,
        spotifyUser: { 
          id: 'spotify-user-1',
          display_name: 'Test User',
          email: 'test@example.com',
          images: [{ url: 'https://example.com/avatar.jpg', width: 64, height: 64 }],
          country: 'US',
          product: 'premium'
        },
        accessToken: 'spotify-token',
        loading: false,
        isLinking: false,
        accessMethod: 'primary',
        ensureSpotifyAccess: vi.fn().mockResolvedValue({ success: true }),
        isPremium: true,
      });

      mockUseSpotify.mockReturnValue({
        isAuthenticated: true,
        isPremium: true,
        loginWithPopup: vi.fn(),
        playTrack: vi.fn(),
        isPlayerReady: true,
        isAuthenticating: false,
        user: { 
          id: 'spotify-user-1',
          display_name: 'Test User',
          email: 'test@example.com',
          images: [{ url: 'https://example.com/avatar.jpg', width: 64, height: 64 }],
          country: 'US',
          product: 'premium'
        },
        accessToken: 'spotify-token',
        loading: false,
        login: vi.fn(),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        currentTrack: null,
        isPlaying: false,
        position: 0,
        duration: 0,
        canUsePlayer: true,
        playPlaylist: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        nextTrack: vi.fn(),
        previousTrack: vi.fn(),
        seek: vi.fn(),
        setVolume: vi.fn()
      });

      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('internal');
    });
  });

  describe('Error handling', () => {
    it.skip('clears error message after timeout', async () => {
      // Test error timeout using the existing "shows error message when popup login fails" pattern
      const mockSignInWithOAuthPopup = vi.fn().mockResolvedValue({ 
        success: false, 
        error: 'Authentication failed' 
      });

      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signInWithOAuth: vi.fn(),
        signInWithOAuthPopup: mockSignInWithOAuthPopup,
        signInWithEmail: vi.fn(),
        signUpWithEmail: vi.fn(),
        signOut: vi.fn(),
        hasSpotifyAccess: false,
        getSpotifyAccessMethod: vi.fn(() => 'none'),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: false,
        spotifyUser: null,
        accessToken: null,
        loading: false,
        isLinking: false,
        accessMethod: 'none',
        ensureSpotifyAccess: vi.fn().mockResolvedValue({ success: true }),
        isPremium: false,
      });

      mockUseSpotify.mockReturnValue({
        isAuthenticated: false,
        isPremium: false,
        loginWithPopup: vi.fn(),
        playTrack: vi.fn(),
        isPlayerReady: false,
        isAuthenticating: false,
        user: null,
        accessToken: null,
        loading: false,
        login: vi.fn(),
        loginWithRedirect: vi.fn(),
        logout: vi.fn(),
        currentTrack: null,
        isPlaying: false,
        position: 0,
        duration: 0,
        canUsePlayer: false,
        playPlaylist: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        nextTrack: vi.fn(),
        previousTrack: vi.fn(),
        seek: vi.fn(),
        setVolume: vi.fn(),
      });

      vi.useFakeTimers();
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Wait for modal
      await waitFor(() => {
        expect(screen.getByText('Sign in to play music')).toBeInTheDocument();
      });

      // Click Spotify option in modal
      const spotifyButton = screen.getByText('🎵 Continue with Spotify');
      fireEvent.click(spotifyButton);
      
      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText('Authentication failed')).toBeInTheDocument();
      });
      
      // Advance time to trigger timeout
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Wait for error message to disappear
      await waitFor(() => {
        expect(screen.queryByText('Authentication failed')).not.toBeInTheDocument();
      });
      
      vi.useRealTimers();
    });
  });
});