import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SpotifyCallback } from '../SpotifyCallback';
import { spotifyApi } from '../../services/spotifyApi';

// Mock dependencies
vi.mock('../../services/spotifyApi', () => ({
  spotifyApi: {
    handleAuthCallback: vi.fn()
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams]
  };
});

const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams();

describe('SpotifyCallback', () => {
  let mockOpener: { postMessage: (data: unknown, origin: string) => void };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('code');
    mockSearchParams.delete('state');
    mockSearchParams.delete('error');
    
    // Mock window.opener for popup tests
    mockOpener = {
      postMessage: vi.fn()
    };
    
    Object.defineProperty(window, 'opener', {
      value: null,
      writable: true
    });
    
    Object.defineProperty(window, 'close', {
      value: vi.fn(),
      writable: true
    });

    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SpotifyCallback />
      </BrowserRouter>
    );
  };

  describe('Regular mode (not popup)', () => {
    it('should exchange code for tokens and redirect on success', async () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('state', 'test-state');
      
      const mockResult = {
        success: true,
        userId: 'user123',
        accessToken: 'token123',
        userData: { id: 'user123', display_name: 'Test User' }
      };
      
      vi.mocked(spotifyApi.handleAuthCallback).mockResolvedValueOnce(mockResult);

      renderComponent();

      expect(screen.getByText('Connecting to Spotify...')).toBeInTheDocument();

      await waitFor(() => {
        expect(spotifyApi.handleAuthCallback).toHaveBeenCalledWith('test-code', 'test-state');
        expect(mockNavigate).toHaveBeenCalledWith('/search');
      });
    });

    it('should show error and redirect on auth error', async () => {
      mockSearchParams.set('error', 'access_denied');

      renderComponent();

      expect(screen.getByText('❌ Spotify authorization failed: access_denied')).toBeInTheDocument();
      expect(screen.getByText('Redirecting back to search...')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/search');
      }, { timeout: 4000 });
    });

    it('should show error and redirect on exchange failure', async () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('state', 'test-state');
      
      vi.mocked(spotifyApi.handleAuthCallback).mockRejectedValueOnce(new Error('Exchange failed'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('❌ Failed to complete Spotify authentication')).toBeInTheDocument();
        expect(screen.getByText('Redirecting back to search...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/search');
      }, { timeout: 4000 });
    });
  });

  describe('Popup mode', () => {
    beforeEach(() => {
      // Set window.opener to simulate popup mode
      window.opener = mockOpener;
    });

    it('should send success message to parent and close popup', async () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('state', 'test-state');
      
      const mockResult = {
        success: true,
        userId: 'user123',
        accessToken: 'token123',
        userData: { id: 'user123', display_name: 'Test User' }
      };
      
      vi.mocked(spotifyApi.handleAuthCallback).mockResolvedValueOnce(mockResult);

      renderComponent();

      expect(screen.getByText('Connecting to Spotify...')).toBeInTheDocument();
      expect(screen.getByText('This window will close automatically')).toBeInTheDocument();

      await waitFor(() => {
        expect(spotifyApi.handleAuthCallback).toHaveBeenCalledWith('test-code', 'test-state');
        expect(mockOpener.postMessage).toHaveBeenCalledWith({
          type: 'spotify-auth-success',
          success: true,
          userId: 'user123',
          accessToken: 'token123',
          userData: { id: 'user123', display_name: 'Test User' }
        }, 'http://localhost:3000');
        expect(window.close).toHaveBeenCalled();
      });
    });

    it('should send error message to parent and close popup on auth error', async () => {
      mockSearchParams.set('error', 'access_denied');

      renderComponent();

      expect(screen.getByText('❌ Spotify authorization failed: access_denied')).toBeInTheDocument();
      expect(screen.queryByText('Redirecting back to search...')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(mockOpener.postMessage).toHaveBeenCalledWith({
          type: 'spotify-auth-error',
          success: false,
          error: 'Spotify authorization failed: access_denied'
        }, 'http://localhost:3000');
        expect(window.close).toHaveBeenCalled();
      });
    });

    it('should send error message on exchange failure', async () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('state', 'test-state');
      
      vi.mocked(spotifyApi.handleAuthCallback).mockRejectedValueOnce(new Error('Exchange failed'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('❌ Failed to complete Spotify authentication')).toBeInTheDocument();
        expect(mockOpener.postMessage).toHaveBeenCalledWith({
          type: 'spotify-auth-error',
          success: false,
          error: 'Failed to complete Spotify authentication'
        }, 'http://localhost:3000');
        expect(window.close).toHaveBeenCalled();
      });
    });

    it('should handle missing callback parameters', async () => {
      // No code or state parameters

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('❌ Invalid callback parameters')).toBeInTheDocument();
        expect(mockOpener.postMessage).toHaveBeenCalledWith({
          type: 'spotify-auth-error',
          success: false,
          error: 'Invalid callback parameters'
        }, 'http://localhost:3000');
        expect(window.close).toHaveBeenCalled();
      });
    });
  });

  describe('Code deduplication', () => {
    it('should not process the same code twice', async () => {
      mockSearchParams.set('code', 'test-code');
      mockSearchParams.set('state', 'test-state');
      
      const mockResult = {
        success: true,
        userId: 'user123',
        accessToken: 'token123',
        userData: { id: 'user123' }
      };
      
      vi.mocked(spotifyApi.handleAuthCallback).mockResolvedValueOnce(mockResult);

      const { rerender } = renderComponent();

      await waitFor(() => {
        expect(spotifyApi.handleAuthCallback).toHaveBeenCalledTimes(1);
      });

      // Re-render with same code
      rerender(
        <BrowserRouter>
          <SpotifyCallback />
        </BrowserRouter>
      );

      // Should not call handleAuthCallback again
      expect(spotifyApi.handleAuthCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Legacy tests', () => {
    it('should call handleAuthCallback method not exchangeCodeForTokens', async () => {
      mockSearchParams.set('code', 'test_code');
      mockSearchParams.set('state', 'test_state');
      
      const mockHandleAuthCallback = vi.mocked(spotifyApi.handleAuthCallback);
      mockHandleAuthCallback.mockResolvedValue({ success: true, userId: 'test_user' });

      renderComponent();

      await waitFor(() => {
        expect(mockHandleAuthCallback).toHaveBeenCalledWith('test_code', 'test_state');
        expect(mockHandleAuthCallback).toHaveBeenCalledTimes(1);
      });
    });

    it('should verify that handleAuthCallback method exists on spotifyApi', () => {
      expect(typeof spotifyApi.handleAuthCallback).toBe('function');
      expect(spotifyApi.handleAuthCallback).toBeDefined();
    });
  });
});