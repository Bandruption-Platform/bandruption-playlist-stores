import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSpotifyAccess } from '../useSpotifyAccess';
import { useAuth } from '../../contexts/AuthContext';
import { useSpotifyLinking } from '../useSpotifyLinking';

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the spotify linking hook
vi.mock('../useSpotifyLinking', () => ({
  useSpotifyLinking: vi.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch
global.fetch = vi.fn();

describe('useSpotifyAccess', () => {
  const mockUseAuth = useAuth as vi.MockedFunction<typeof useAuth>;
  const mockUseSpotifyLinking = useSpotifyLinking as vi.MockedFunction<typeof useSpotifyLinking>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default auth mock
    mockUseAuth.mockReturnValue({
      session: null,
      hasSpotifyAccess: false,
      getSpotifyAccessMethod: vi.fn(() => 'none'),
    });

    // Default spotify linking mock
    mockUseSpotifyLinking.mockReturnValue({
      linkSpotifyAccount: vi.fn(),
      isLinking: false,
    });

    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should return initial state when no user session', async () => {
    const { result } = renderHook(() => useSpotifyAccess());

    await waitFor(() => {
      expect(result.current.hasSpotifyAccess).toBe(false);
      expect(result.current.spotifyUser).toBe(null);
      expect(result.current.accessToken).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.accessMethod).toBe('none');
      expect(result.current.isPremium).toBe(false);
    });
  });

  it('should handle primary Spotify authentication', async () => {
    const mockSession = {
      user: {
        id: '123',
        identities: [{ provider: 'spotify' }],
      },
      access_token: 'supabase-token',
    };

    const mockUserData = {
      id: 'spotify-user-id',
      display_name: 'Test User',
      product: 'premium',
    };

    mockUseAuth.mockReturnValue({
      session: mockSession,
      hasSpotifyAccess: true,
      getSpotifyAccessMethod: vi.fn(() => 'primary'),
    });

    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: 'spotify-token',
        user_data: mockUserData,
      }),
    });

    const { result } = renderHook(() => useSpotifyAccess());

    await waitFor(() => {
      expect(result.current.hasSpotifyAccess).toBe(true);
      expect(result.current.accessMethod).toBe('primary');
      expect(result.current.spotifyUser).toEqual(mockUserData);
      expect(result.current.accessToken).toBe('spotify-token');
      expect(result.current.isPremium).toBe(true);
    });

    expect(fetch).toHaveBeenCalledWith('/api/spotify/tokens', {
      headers: {
        'Authorization': 'Bearer supabase-token',
      },
    });
  });

  it('should handle linked Spotify authentication', async () => {
    const mockSession = {
      user: {
        id: '123',
        identities: [{ provider: 'google' }],
      },
      access_token: 'supabase-token',
    };

    const mockUserData = {
      id: 'spotify-user-id',
      display_name: 'Test User',
      product: 'free',
    };

    mockUseAuth.mockReturnValue({
      session: mockSession,
      hasSpotifyAccess: true,
      getSpotifyAccessMethod: vi.fn(() => 'linked'),
    });

    mockLocalStorage.getItem
      .mockReturnValueOnce('spotify-access-token') // spotify_access_token
      .mockReturnValueOnce(JSON.stringify(mockUserData)); // spotify_user

    const { result } = renderHook(() => useSpotifyAccess());

    await waitFor(() => {
      expect(result.current.hasSpotifyAccess).toBe(true);
      expect(result.current.accessMethod).toBe('linked');
      expect(result.current.spotifyUser).toEqual(mockUserData);
      expect(result.current.accessToken).toBe('spotify-access-token');
      expect(result.current.isPremium).toBe(false);
    });

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('spotify_access_token');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('spotify_user');
  });

  it('should handle failed primary auth token fetch', async () => {
    const mockSession = {
      user: {
        id: '123',
        identities: [{ provider: 'spotify' }],
      },
      access_token: 'supabase-token',
    };

    mockUseAuth.mockReturnValue({
      session: mockSession,
      hasSpotifyAccess: true,
      getSpotifyAccessMethod: vi.fn(() => 'primary'),
    });

    (global.fetch as vi.Mock).mockResolvedValue({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useSpotifyAccess());

    await waitFor(() => {
      expect(result.current.spotifyUser).toBe(null);
      expect(result.current.accessToken).toBe(null);
    });
  });

  it('should handle ensureSpotifyAccess when already has access', async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: '123' } },
      hasSpotifyAccess: true,
      getSpotifyAccessMethod: vi.fn(() => 'linked'),
    });

    const { result } = renderHook(() => useSpotifyAccess());

    await waitFor(() => {
      expect(result.current.hasSpotifyAccess).toBe(true);
    });

    const ensureResult = await result.current.ensureSpotifyAccess();
    expect(ensureResult).toEqual({ success: true });
  });

  it('should handle ensureSpotifyAccess when needs linking', async () => {
    const mockLinkSpotifyAccount = vi.fn().mockResolvedValue({ 
      success: true 
    });

    mockUseAuth.mockReturnValue({
      session: { user: { id: '123' } },
      hasSpotifyAccess: false,
      getSpotifyAccessMethod: vi.fn(() => 'none'),
    });

    mockUseSpotifyLinking.mockReturnValue({
      linkSpotifyAccount: mockLinkSpotifyAccount,
      isLinking: false,
    });

    const { result } = renderHook(() => useSpotifyAccess());

    await waitFor(() => {
      expect(result.current.hasSpotifyAccess).toBe(false);
    });

    const ensureResult = await result.current.ensureSpotifyAccess();
    
    expect(mockLinkSpotifyAccount).toHaveBeenCalled();
    expect(ensureResult).toEqual({ success: true });
  });

  it('should handle linking failure in ensureSpotifyAccess', async () => {
    const mockLinkSpotifyAccount = vi.fn().mockResolvedValue({ 
      success: false,
      error: 'Linking failed'
    });

    mockUseAuth.mockReturnValue({
      session: { user: { id: '123' } },
      hasSpotifyAccess: false,
      getSpotifyAccessMethod: vi.fn(() => 'none'),
    });

    mockUseSpotifyLinking.mockReturnValue({
      linkSpotifyAccount: mockLinkSpotifyAccount,
      isLinking: false,
    });

    const { result } = renderHook(() => useSpotifyAccess());

    const ensureResult = await result.current.ensureSpotifyAccess();
    
    expect(ensureResult).toEqual({ 
      success: false,
      error: 'Linking failed'
    });
  });

  it('should handle missing localStorage data for linked accounts', async () => {
    const mockSession = {
      user: {
        id: '123',
        identities: [{ provider: 'google' }],
      },
      access_token: 'supabase-token',
    };

    mockUseAuth.mockReturnValue({
      session: mockSession,
      hasSpotifyAccess: true,
      getSpotifyAccessMethod: vi.fn(() => 'linked'),
    });

    // Return null for localStorage items
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useSpotifyAccess());

    await waitFor(() => {
      expect(result.current.spotifyUser).toBe(null);
      expect(result.current.accessToken).toBe(null);
    });
  });

  it('should handle isLinking state from useSpotifyLinking', () => {
    mockUseSpotifyLinking.mockReturnValue({
      linkSpotifyAccount: vi.fn(),
      isLinking: true,
    });

    const { result } = renderHook(() => useSpotifyAccess());

    expect(result.current.isLinking).toBe(true);
  });

  it('should detect premium status correctly', async () => {
    const mockSession = {
      user: { id: '123', identities: [{ provider: 'google' }] },
      access_token: 'token',
    };

    const premiumUser = {
      id: 'spotify-user',
      display_name: 'Premium User',
      product: 'premium',
    };

    mockUseAuth.mockReturnValue({
      session: mockSession,
      hasSpotifyAccess: true,
      getSpotifyAccessMethod: vi.fn(() => 'linked'),
    });

    mockLocalStorage.getItem
      .mockReturnValueOnce('token')
      .mockReturnValueOnce(JSON.stringify(premiumUser));

    const { result } = renderHook(() => useSpotifyAccess());

    await waitFor(() => {
      expect(result.current.isPremium).toBe(true);
    });
  });
});