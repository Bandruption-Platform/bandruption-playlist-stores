import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayButton } from '../PlayButton';
import { useAuth } from '../../contexts/AuthContext';
import { useSpotifyAccess } from '../../hooks/useSpotifyAccess';
import { useSpotify } from '../../hooks/useSpotify';

// Mock all the hooks
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../hooks/useSpotifyAccess', () => ({
  useSpotifyAccess: vi.fn(),
}));

vi.mock('../../hooks/useSpotify', () => ({
  useSpotify: vi.fn(),
}));

const mockTrack = {
  id: 'test-track-id',
  name: 'Test Track',
  artists: [{ id: 'artist-1', name: 'Test Artist' }],
  album: { 
    id: 'album-1',
    name: 'Test Album',
    images: [{ url: 'test.jpg', width: 640, height: 640 }]
  },
  duration_ms: 180000,
  preview_url: null,
  external_urls: { spotify: 'https://open.spotify.com/track/test-track-id' },
};

describe('Hybrid Auth Flow Integration', () => {
  const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>;
  const mockUseSpotifyAccess = useSpotifyAccess as vi.MockedFunction<typeof useSpotifyAccess>;
  const mockUseSpotify = useSpotify as vi.MockedFunction<typeof useSpotify>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    mockUseAuth.mockReturnValue({
      user: null,
      signInWithOAuthPopup: vi.fn(),
    });

    mockUseSpotifyAccess.mockReturnValue({
      hasSpotifyAccess: false,
      ensureSpotifyAccess: vi.fn(),
      isPremium: false,
      accessMethod: 'none',
      isLinking: false,
    });

    mockUseSpotify.mockReturnValue({
      playTrack: vi.fn(),
      isPlayerReady: false,
    });

    // Mock window.open
    Object.defineProperty(window, 'open', {
      writable: true,
      value: vi.fn(),
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
  });

  describe('Unauthenticated User Flow', () => {
    it('should show sign in button for unauthenticated users', () => {
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Sign In to Play');
      expect(button).toHaveClass('external');
    });

    it('should show auth modal when unauthenticated user clicks play', async () => {
      render(<PlayButton track={mockTrack} />);
      
      const playButton = screen.getByText('Sign In to Play');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(screen.getByText('Sign in to play music')).toBeInTheDocument();
        expect(screen.getByText('🎵 Continue with Spotify')).toBeInTheDocument();
        expect(screen.getByText('📧 Continue with Google')).toBeInTheDocument();
        expect(screen.getByText('📘 Continue with Facebook')).toBeInTheDocument();
        expect(screen.getByText('🎮 Continue with Discord')).toBeInTheDocument();
      });
    });

    it('should handle popup auth success from modal', async () => {
      const mockSignInWithOAuthPopup = vi.fn().mockResolvedValue({ success: true });
      
      mockUseAuth.mockReturnValue({
        user: null,
        signInWithOAuthPopup: mockSignInWithOAuthPopup,
      });

      render(<PlayButton track={mockTrack} />);
      
      const playButton = screen.getByText('Sign In to Play');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(screen.getByText('🎵 Continue with Spotify')).toBeInTheDocument();
      });

      const spotifyButton = screen.getByText('🎵 Continue with Spotify');
      fireEvent.click(spotifyButton);

      await waitFor(() => {
        expect(mockSignInWithOAuthPopup).toHaveBeenCalledWith('spotify');
      });
    });

    it('should handle popup auth failure', async () => {
      const mockSignInWithOAuthPopup = vi.fn().mockResolvedValue({ 
        success: false, 
        error: 'Authentication failed' 
      });
      
      mockUseAuth.mockReturnValue({
        user: null,
        signInWithOAuthPopup: mockSignInWithOAuthPopup,
      });

      render(<PlayButton track={mockTrack} />);
      
      const playButton = screen.getByText('Sign In to Play');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(screen.getByText('🎵 Continue with Spotify')).toBeInTheDocument();
      });

      const spotifyButton = screen.getByText('🎵 Continue with Spotify');
      fireEvent.click(spotifyButton);

      await waitFor(() => {
        expect(screen.getByText('Authentication failed')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated User Without Spotify Flow', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: '123', email: 'test@example.com' },
        signInWithOAuthPopup: vi.fn(),
      });
    });

    it('should show connect Spotify button for authenticated users without Spotify', () => {
      render(<PlayButton track={mockTrack} />);
      
      expect(screen.getByText('Connect Spotify')).toBeInTheDocument();
    });

    it('should handle Spotify linking success', async () => {
      const mockEnsureSpotifyAccess = vi.fn().mockResolvedValue({ success: true });
      
      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: false,
        ensureSpotifyAccess: mockEnsureSpotifyAccess,
        isPremium: false,
        accessMethod: 'none',
        isLinking: false,
      });

      render(<PlayButton track={mockTrack} />);
      
      const connectButton = screen.getByText('Connect Spotify');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(mockEnsureSpotifyAccess).toHaveBeenCalled();
      });
    });

    it('should handle Spotify linking failure', async () => {
      const mockEnsureSpotifyAccess = vi.fn().mockResolvedValue({ 
        success: false, 
        error: 'Failed to connect Spotify' 
      });
      
      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: false,
        ensureSpotifyAccess: mockEnsureSpotifyAccess,
        isPremium: false,
        accessMethod: 'none',
        isLinking: false,
      });

      render(<PlayButton track={mockTrack} />);
      
      fireEvent.click(screen.getByText('Connect Spotify'));

      await waitFor(() => {
        expect(screen.getByText('Failed to connect Spotify')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated User With Spotify Access', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: '123', email: 'test@example.com' },
        signInWithOAuthPopup: vi.fn(),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: true,
        ensureSpotifyAccess: vi.fn(),
        isPremium: false,
        accessMethod: 'linked',
        isLinking: false,
      });
    });

    it('should show "Play in Spotify" for free users', () => {
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Play in Spotify');
      expect(button).toHaveClass('external');
    });

    it('should open Spotify app for free users', async () => {
      render(<PlayButton track={mockTrack} />);
      
      fireEvent.click(screen.getByText('Play in Spotify'));

      await waitFor(() => {
        expect(window.location.href).toBe('spotify:track:test-track-id');
      });

      // Should also open web link as fallback
      setTimeout(() => {
        expect(window.open).toHaveBeenCalledWith(
          'https://open.spotify.com/track/test-track-id',
          '_blank'
        );
      }, 1500);
    });

    it('should show Play button for premium users with player ready', () => {
      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: true,
        ensureSpotifyAccess: vi.fn(),
        isPremium: true,
        accessMethod: 'primary',
        isLinking: false,
      });

      mockUseSpotify.mockReturnValue({
        playTrack: vi.fn(),
        isPlayerReady: true,
      });

      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Play');
      expect(button).toHaveClass('internal');
    });

    it('should handle in-browser playback for premium users', async () => {
      const mockPlayTrack = vi.fn().mockResolvedValue(undefined);
      
      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: true,
        ensureSpotifyAccess: vi.fn(),
        isPremium: true,
        accessMethod: 'primary',
        isLinking: false,
      });

      mockUseSpotify.mockReturnValue({
        playTrack: mockPlayTrack,
        isPlayerReady: true,
      });

      render(<PlayButton track={mockTrack} />);
      
      fireEvent.click(screen.getByText('Play'));

      await waitFor(() => {
        expect(mockPlayTrack).toHaveBeenCalledWith('spotify:track:test-track-id');
      });
    });

    it('should fallback to web link when playback fails', async () => {
      const mockPlayTrack = vi.fn().mockRejectedValue(new Error('Playback failed'));
      
      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: true,
        ensureSpotifyAccess: vi.fn(),
        isPremium: true,
        accessMethod: 'primary',
        isLinking: false,
      });

      mockUseSpotify.mockReturnValue({
        playTrack: mockPlayTrack,
        isPlayerReady: true,
      });

      render(<PlayButton track={mockTrack} />);
      
      fireEvent.click(screen.getByText('Play'));

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith(
          'https://open.spotify.com/track/test-track-id',
          '_blank'
        );
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during authentication', async () => {
      // Start with no access, then simulate clicking and authentication starting
      mockUseAuth.mockReturnValue({
        user: { id: '123', email: 'test@example.com' },
        signInWithOAuthPopup: vi.fn(),
      });
      
      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: false,
        ensureSpotifyAccess: vi.fn(),
        isPremium: false,
        accessMethod: 'none',
        isLinking: false,
      });

      const { rerender } = render(<PlayButton track={mockTrack} />);
      
      // Initially shows Connect Spotify
      expect(screen.getByText('Connect Spotify')).toBeInTheDocument();
      
      // Click the button to start authentication
      fireEvent.click(screen.getByText('Connect Spotify'));
      
      // Mock the loading state after click
      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: false,
        ensureSpotifyAccess: vi.fn(),
        isPremium: false,
        accessMethod: 'none',
        isLinking: true,
      });
      
      // Re-render with new mock values
      await waitFor(() => {
        rerender(<PlayButton track={mockTrack} />);
      });
      
      // Should show loading state
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
      expect(screen.getByText('⏳')).toBeInTheDocument();
    });

    it('should show loading player state for premium users', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '123', email: 'test@example.com' },
        signInWithOAuthPopup: vi.fn(),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: true,
        ensureSpotifyAccess: vi.fn(),
        isPremium: true,
        accessMethod: 'primary',
        isLinking: false,
      });

      mockUseSpotify.mockReturnValue({
        playTrack: vi.fn(),
        isPlayerReady: false,
      });

      render(<PlayButton track={mockTrack} />);
      
      expect(screen.getByText('Loading Player...')).toBeInTheDocument();
    });
  });

  describe('Access Method Detection', () => {
    it('should handle primary Spotify authentication', () => {
      mockUseAuth.mockReturnValue({
        user: { 
          id: '123', 
          email: 'test@example.com',
          identities: [{ provider: 'spotify' }]
        },
        signInWithOAuthPopup: vi.fn(),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: true,
        ensureSpotifyAccess: vi.fn(),
        isPremium: true,
        accessMethod: 'primary',
        isLinking: false,
      });

      mockUseSpotify.mockReturnValue({
        playTrack: vi.fn(),
        isPlayerReady: true,
      });

      render(<PlayButton track={mockTrack} />);
      
      expect(screen.getByText('Play')).toBeInTheDocument();
    });

    it('should handle linked Spotify authentication', () => {
      mockUseAuth.mockReturnValue({
        user: { 
          id: '123', 
          email: 'test@example.com',
          identities: [{ provider: 'google' }]
        },
        signInWithOAuthPopup: vi.fn(),
      });

      mockUseSpotifyAccess.mockReturnValue({
        hasSpotifyAccess: true,
        ensureSpotifyAccess: vi.fn(),
        isPremium: false,
        accessMethod: 'linked',
        isLinking: false,
      });

      render(<PlayButton track={mockTrack} />);
      
      expect(screen.getByText('Play in Spotify')).toBeInTheDocument();
    });
  });
});