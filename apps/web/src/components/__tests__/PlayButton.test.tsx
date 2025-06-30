import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlayButton } from '../PlayButton';
import { useSpotify } from '../../hooks/useSpotify';

// Mock the useSpotify hook
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
  explicit: false,
  external_urls: { spotify: 'https://open.spotify.com/track/track123' },
  uri: 'spotify:track:track123'
};

describe('PlayButton', () => {
  const mockUseSpotify = vi.mocked(useSpotify);
  const mockLoginWithPopup = vi.fn();
  const mockPlayTrack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseSpotify.mockReturnValue({
      isAuthenticated: false,
      isPremium: false,
      loginWithPopup: mockLoginWithPopup,
      playTrack: mockPlayTrack,
      isPlayerReady: false,
      isAuthenticating: false,
      // Add other required properties from SpotifyContextType
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

  describe('Unauthenticated state', () => {
    it('shows Login to Play button when not authenticated', () => {
      render(<PlayButton track={mockTrack} />);
      
      expect(screen.getByRole('button')).toHaveTextContent('🎵Login to Play');
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('triggers popup login when clicked while unauthenticated', async () => {
      mockLoginWithPopup.mockResolvedValue({ success: true });
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockLoginWithPopup).toHaveBeenCalled();
      });
    });

    it('shows error message when popup login fails', async () => {
      mockLoginWithPopup.mockResolvedValue({ 
        success: false, 
        error: 'Popup was blocked' 
      });
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Popup was blocked')).toBeInTheDocument();
      });
    });

    it('shows connecting state while authenticating', () => {
      mockUseSpotify.mockReturnValue({
        ...mockUseSpotify(),
        isAuthenticating: true
      });
      
      render(<PlayButton track={mockTrack} />);
      
      expect(screen.getByRole('button')).toHaveTextContent('⏳Connecting...');
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Free user state', () => {
    beforeEach(() => {
      mockUseSpotify.mockReturnValue({
        ...mockUseSpotify(),
        isAuthenticated: true,
        isPremium: false,
        user: { id: 'user123', display_name: 'Test User', product: 'free' } as NonNullable<ReturnType<typeof useSpotify>['user']>
      });
    });

    it('shows Play in Spotify button for free users', () => {
      render(<PlayButton track={mockTrack} />);
      
      expect(screen.getByRole('button')).toHaveTextContent('🎵Play in Spotify');
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('attempts deep link then opens web link for free users', async () => {
      const originalLocation = window.location;
      delete (window as Record<string, unknown>).location;
      window.location = { href: '' } as Location;
      
      const mockOpen = vi.fn();
      window.open = mockOpen;
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should attempt deep link
      expect(window.location.href).toBe('spotify:track:track123');
      
      // Should open web link after delay
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith('https://open.spotify.com/track/track123', '_blank');
      }, { timeout: 2000 });
      
      window.location = originalLocation;
    });
  });

  describe('Premium user state', () => {
    beforeEach(() => {
      mockUseSpotify.mockReturnValue({
        ...mockUseSpotify(),
        isAuthenticated: true,
        isPremium: true,
        isPlayerReady: true,
        user: { id: 'user123', display_name: 'Test User', product: 'premium' } as NonNullable<ReturnType<typeof useSpotify>['user']>
      });
    });

    it('shows Play button for premium users with ready player', () => {
      render(<PlayButton track={mockTrack} />);
      
      expect(screen.getByRole('button')).toHaveTextContent('▶️Play');
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('shows Loading Player when player not ready', () => {
      mockUseSpotify.mockReturnValue({
        ...mockUseSpotify(),
        isAuthenticated: true,
        isPremium: true,
        isPlayerReady: false
      });
      
      render(<PlayButton track={mockTrack} />);
      
      expect(screen.getByRole('button')).toHaveTextContent('▶️Loading Player...');
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('plays track when clicked', async () => {
      mockPlayTrack.mockResolvedValue(undefined);
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockPlayTrack).toHaveBeenCalledWith('spotify:track:track123');
      });
    });

    it('opens Spotify on playback failure', async () => {
      mockPlayTrack.mockRejectedValue(new Error('Playback failed'));
      const mockOpen = vi.fn();
      window.open = mockOpen;
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith('https://open.spotify.com/track/track123', '_blank');
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      render(<PlayButton track={mockTrack} className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('applies external class for non-premium users', () => {
      mockUseSpotify.mockReturnValue({
        ...mockUseSpotify(),
        isAuthenticated: true,
        isPremium: false
      });
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button.className).toContain('external');
    });

    it('applies internal class for premium users', () => {
      mockUseSpotify.mockReturnValue({
        ...mockUseSpotify(),
        isAuthenticated: true,
        isPremium: true,
        isPlayerReady: true
      });
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      expect(button.className).toContain('internal');
    });
  });

  describe('Error handling', () => {
    it('clears error message after timeout', async () => {
      // Use real timers to test the actual timeout behavior
      mockLoginWithPopup.mockResolvedValue({ 
        success: false, 
        error: 'Authentication failed' 
      });
      
      render(<PlayButton track={mockTrack} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Wait for the error message to appear
      await waitFor(() => {
        expect(screen.getByText('Authentication failed')).toBeInTheDocument();
      });
      
      // Wait for the error message to disappear after the real 5-second timeout
      await waitFor(() => {
        expect(screen.queryByText('Authentication failed')).not.toBeInTheDocument();
      }, { timeout: 6000 }); // Wait a bit longer than the 5-second timeout
    }, 10000); // Test timeout of 10 seconds
  });
});