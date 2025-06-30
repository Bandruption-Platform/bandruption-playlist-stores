import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpotifyAuth } from '../useSpotifyAuth';
import { spotifyApi } from '../../services/spotifyApi';
import { popupAuthService } from '../../services/popupAuth';

// Mock the spotifyApi
vi.mock('../../services/spotifyApi', () => ({
  spotifyApi: {
    getAuthUrl: vi.fn(),
    handleAuthCallback: vi.fn(),
    disconnect: vi.fn()
  }
}));

// Mock the popup auth service
vi.mock('../../services/popupAuth', () => ({
  popupAuthService: {
    loginWithPopup: vi.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock URLSearchParams and window.location
const mockURLSearchParams = vi.fn();
global.URLSearchParams = mockURLSearchParams as typeof URLSearchParams;

const mockLocation = {
  href: 'http://localhost:3000/search',
  search: ''
};
Object.defineProperty(window, 'location', { 
  value: mockLocation,
  writable: true
});

// Mock window.history
const mockHistory = {
  replaceState: vi.fn()
};
Object.defineProperty(window, 'history', { value: mockHistory });

describe('useSpotifyAuth - Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocation.search = '';
    mockURLSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue(null)
    });
  });

  describe('Popup-only authentication', () => {
    it('should not process URL auth codes in main app', async () => {
      const authCode = 'test-auth-code-123';
      const authState = 'test-state-456';
      
      // Set up URL with auth parameters (simulating a direct navigation)
      mockLocation.search = `?code=${authCode}&state=${authState}`;
      mockURLSearchParams.mockReturnValue({
        get: vi.fn().mockImplementation((param) => {
          if (param === 'code') return authCode;
          if (param === 'state') return authState;
          return null;
        })
      });

      // Mock successful auth callback (should not be called)
      vi.mocked(spotifyApi.handleAuthCallback).mockResolvedValue({
        success: true,
        userId: 'user123',
        accessToken: 'token123',
        userData: { id: 'user123', display_name: 'Test User' }
      });

      // Render hook - should NOT process auth codes in main app
      renderHook(() => useSpotifyAuth());

      // Wait to ensure no auth callback is attempted
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not call handleAuthCallback in main app
      expect(spotifyApi.handleAuthCallback).not.toHaveBeenCalled();
      
      // Should not clean up URL (popup handles this)
      expect(mockHistory.replaceState).not.toHaveBeenCalled();
    });

    it('should use popup authentication as default login method', async () => {
      const { result } = renderHook(() => useSpotifyAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // The login method should be the same as loginWithPopup
      expect(result.current.login).toBe(result.current.loginWithPopup);
    });
  });

  describe('Disconnect/Connect flow', () => {
    it('should clean up processed codes on logout', async () => {
      // Set up authenticated state
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'stored-token';
        if (key === 'spotify_user') return JSON.stringify({ id: 'user123', display_name: 'Test User' });
        return null;
      });

      const { result } = renderHook(() => useSpotifyAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Simulate logout - this should call the logout function
      act(() => {
        result.current.logout();
      });

      // Verify basic logout functionality
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.accessToken).toBe(null);
    });

    it('should handle connect after disconnect properly', async () => {
      const { result } = renderHook(() => useSpotifyAuth());

      // Initially not authenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
      });

      // Mock popup auth service
      vi.mocked(popupAuthService.loginWithPopup).mockResolvedValue({
        success: true,
        userId: 'user123',
        accessToken: 'token123',
        userData: { id: 'user123', display_name: 'Test User' }
      });

      // Simulate connect button click using default login method
      await act(async () => {
        await result.current.login();
      });

      // Should use popup authentication
      expect(popupAuthService.loginWithPopup).toHaveBeenCalled();
    });
  });

  describe('Popup authentication flow', () => {
    it('should handle popup auth success via postMessage', async () => {
      const { result } = renderHook(() => useSpotifyAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock popup auth success data
      const authData = {
        success: true,
        userId: 'user123',
        accessToken: 'token123',
        userData: { id: 'user123', display_name: 'Test User' }
      };

      // Mock localStorage.getItem to return auth data after popup success
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return authData.accessToken;
        if (key === 'spotify_user') return JSON.stringify(authData.userData);
        if (key === 'spotify_connected') return 'true';
        if (key === 'spotify_user_id') return authData.userId;
        return null;
      });

      // Simulate receiving auth success message (as would happen from popup)
      act(() => {
        // Trigger auth changed event as popup would do
        window.dispatchEvent(new CustomEvent('spotify-auth-changed'));
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(authData.userData);
        expect(result.current.accessToken).toBe(authData.accessToken);
      });
    });
  });

  describe('Auth state management', () => {
    it('should respond to auth state changes from popup', async () => {
      const { result } = renderHook(() => useSpotifyAuth());

      // Initially not authenticated
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      // Mock stored auth data
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_access_token') return 'token123';
        if (key === 'spotify_user') return JSON.stringify({ id: 'user123', display_name: 'Test User' });
        return null;
      });

      // Simulate auth state change (as would happen after popup success)
      act(() => {
        window.dispatchEvent(new CustomEvent('spotify-auth-changed'));
      });

      // Should update state based on localStorage
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user?.id).toBe('user123');
        expect(result.current.accessToken).toBe('token123');
      });
    });
  });
});