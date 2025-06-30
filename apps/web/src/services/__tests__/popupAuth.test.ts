import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { popupAuthService } from '../popupAuth';

// Mock fetch
global.fetch = vi.fn();

describe('PopupAuthService', () => {
  let mockWindow: Window & { close: () => void; closed: boolean; postMessage: () => void };
  let originalWindow: Window & typeof globalThis;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock window.open
    mockWindow = {
      close: vi.fn(),
      closed: false,
      postMessage: vi.fn()
    } as Window & { close: () => void; closed: boolean; postMessage: () => void };
    
    originalWindow = global.window;
    global.window.open = vi.fn().mockReturnValue(mockWindow);
    global.window.location = { origin: 'http://localhost:3000' } as Location;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  describe('loginWithPopup', () => {
    it('should open popup with correct parameters', async () => {
      const authUrl = 'https://accounts.spotify.com/authorize?client_id=test';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authUrl })
      });

      // Start login process
      const loginPromise = popupAuthService.loginWithPopup();

      // Wait for fetch to complete
      await new Promise<void>(resolve => setTimeout(resolve, 0));

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/api/spotify/auth/login');
      expect(global.window.open).toHaveBeenCalledWith(
        authUrl,
        'spotify-auth',
        'width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );

      // Simulate successful auth message
      const messageEvent = new MessageEvent('message', {
        data: {
          type: 'spotify-auth-success',
          userId: 'user123',
          accessToken: 'token123',
          userData: { id: 'user123', display_name: 'Test User' }
        },
        origin: 'http://localhost:3000'
      });
      
      window.dispatchEvent(messageEvent);

      const result = await loginPromise;
      
      expect(result).toEqual({
        success: true,
        userId: 'user123',
        accessToken: 'token123',
        userData: { id: 'user123', display_name: 'Test User' }
      });
      
      expect(mockWindow.close).toHaveBeenCalled();
    });

    it('should handle auth errors', async () => {
      const authUrl = 'https://accounts.spotify.com/authorize?client_id=test';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authUrl })
      });

      const loginPromise = popupAuthService.loginWithPopup();
      await new Promise<void>(resolve => setTimeout(resolve, 0));

      // Simulate error message
      const messageEvent = new MessageEvent('message', {
        data: {
          type: 'spotify-auth-error',
          error: 'User cancelled authentication'
        },
        origin: 'http://localhost:3000'
      });
      
      window.dispatchEvent(messageEvent);

      const result = await loginPromise;
      
      expect(result).toEqual({
        success: false,
        error: 'User cancelled authentication'
      });
      
      expect(mockWindow.close).toHaveBeenCalled();
    });

    it('should handle popup being blocked', async () => {
      global.window.open = vi.fn().mockReturnValue(null);
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authUrl: 'https://accounts.spotify.com/authorize' })
      });

      await expect(popupAuthService.loginWithPopup()).rejects.toThrow(
        'Failed to start authentication: Error: Popup blocked. Please allow popups for this site.'
      );
    });

    it('should handle manual popup close', async () => {
      const authUrl = 'https://accounts.spotify.com/authorize?client_id=test';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authUrl })
      });

      const loginPromise = popupAuthService.loginWithPopup();
      await new Promise<void>(resolve => setTimeout(resolve, 0));

      // Simulate popup being closed
      mockWindow.closed = true;
      
      // Wait for the interval check
      await new Promise<void>(resolve => setTimeout(resolve, 1100));

      const result = await loginPromise;
      
      expect(result).toEqual({
        success: false,
        error: 'Authentication cancelled'
      });
    });

    it('should ignore messages from different origins', async () => {
      const authUrl = 'https://accounts.spotify.com/authorize?client_id=test';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authUrl })
      });

      const loginPromise = popupAuthService.loginWithPopup();
      await new Promise<void>(resolve => setTimeout(resolve, 0));

      // Simulate message from different origin
      const maliciousEvent = new MessageEvent('message', {
        data: {
          type: 'spotify-auth-success',
          userId: 'malicious',
          accessToken: 'stolen-token'
        },
        origin: 'https://evil.com'
      });
      
      window.dispatchEvent(maliciousEvent);

      // Simulate legitimate message
      const legitimateEvent = new MessageEvent('message', {
        data: {
          type: 'spotify-auth-success',
          userId: 'user123',
          accessToken: 'token123',
          userData: { id: 'user123' }
        },
        origin: 'http://localhost:3000'
      });
      
      window.dispatchEvent(legitimateEvent);

      const result = await loginPromise;
      
      // Should only accept the legitimate message
      expect(result.userId).toBe('user123');
      expect(result.accessToken).toBe('token123');
    });

    it('should handle fetch errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      await expect(popupAuthService.loginWithPopup()).rejects.toThrow(
        'Failed to start authentication: Error: Network error'
      );
    });
  });

  describe('closeCurrentPopup', () => {
    it('should close popup if open', async () => {
      const authUrl = 'https://accounts.spotify.com/authorize?client_id=test';
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authUrl })
      });

      // Start login to open popup
      popupAuthService.loginWithPopup();
      await new Promise<void>(resolve => setTimeout(resolve, 0));

      // Close popup
      popupAuthService.closeCurrentPopup();

      expect(mockWindow.close).toHaveBeenCalled();
    });

    it('should not error if no popup is open', () => {
      expect(() => popupAuthService.closeCurrentPopup()).not.toThrow();
    });
  });
});