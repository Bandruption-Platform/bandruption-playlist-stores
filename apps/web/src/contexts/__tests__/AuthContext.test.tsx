import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase before importing AuthContext
vi.mock('@shared/supabase', () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithOAuth: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  };
  
  return { supabase: mockSupabase };
});

import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '@shared/supabase';

// Get the mocked supabase instance
const mockSupabase = vi.mocked(supabase);

// Test component to access the auth context
const TestComponent = () => {
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.email : 'No user'}</div>
      <div data-testid="loading">{auth.loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="spotify-access">{auth.hasSpotifyAccess ? 'Yes' : 'No'}</div>
      <div data-testid="access-method">{auth.getSpotifyAccessMethod()}</div>
      <button 
        data-testid="popup-auth"
        onClick={() => auth.signInWithOAuthPopup('google')}
      >
        Popup Auth
      </button>
      <button 
        data-testid="regular-auth"
        onClick={() => auth.signInWithOAuth('google')}
      >
        Regular Auth
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock initial session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
    
    // Mock auth state change listener
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    
    // Mock window.open for popup tests
    Object.defineProperty(window, 'open', {
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children and provide auth context', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      expect(screen.getByTestId('spotify-access')).toHaveTextContent('No');
      expect(screen.getByTestId('access-method')).toHaveTextContent('none');
    });
  });

  it('should handle user session', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      identities: [],
    };
    
    const mockSession = {
      user: mockUser,
      access_token: 'mock-token',
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
    });

    // Mock spotify_tokens query
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'No tokens found' },
          }),
        })),
      })),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('spotify-access')).toHaveTextContent('No');
      expect(screen.getByTestId('access-method')).toHaveTextContent('none');
    });
  });

  it('should detect primary Spotify authentication', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      identities: [
        { provider: 'spotify', id: 'spotify-id' }
      ],
    };
    
    const mockSession = {
      user: mockUser,
      access_token: 'mock-token',
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('spotify-access')).toHaveTextContent('Yes');
      expect(screen.getByTestId('access-method')).toHaveTextContent('primary');
    });
  });

  it('should detect linked Spotify access', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      identities: [
        { provider: 'google', id: 'google-id' }
      ],
    };
    
    const mockSession = {
      user: mockUser,
      access_token: 'mock-token',
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
    });

    // Mock spotify_tokens query with valid tokens
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              access_token: 'spotify-token',
              expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            },
            error: null,
          }),
        })),
      })),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('spotify-access')).toHaveTextContent('Yes');
      expect(screen.getByTestId('access-method')).toHaveTextContent('linked');
    });
  });

  it('should handle regular OAuth sign in', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://auth-url.com' },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('regular-auth'));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });
    });
  });

  it('should handle popup OAuth sign in successfully', async () => {
    const mockWindow = {
      closed: false,
      close: vi.fn(),
    };
    
    (window.open as vi.Mock).mockReturnValue(mockWindow);
    
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://auth-url.com' },
      error: null,
    });

    // Mock successful session after popup
    mockSupabase.auth.getSession
      .mockResolvedValueOnce({ data: { session: null } }) // Initial call
      .mockResolvedValue({ 
        data: { 
          session: { 
            user: { id: '123', email: 'test@example.com' },
            access_token: 'token' 
          } 
        } 
      });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const button = screen.getByTestId('popup-auth');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          skipBrowserRedirect: true,
        },
      });
    });

    expect(window.open).toHaveBeenCalledWith(
      'https://auth-url.com',
      'google-auth',
      'width=500,height=700,scrollbars=yes,resizable=yes'
    );
  });

  it('should handle popup blocked error', async () => {
    (window.open as vi.Mock).mockReturnValue(null);
    
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://auth-url.com' },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const button = screen.getByTestId('popup-auth');
    fireEvent.click(button);

    // The popup function returns a promise that should resolve with popup blocked error
    await waitFor(() => {
      expect(window.open).toHaveBeenCalled();
    });
  });

  it('should handle popup cancelled by user', async () => {
    const mockWindow = {
      closed: true,
      close: vi.fn(),
    };
    
    (window.open as vi.Mock).mockReturnValue(mockWindow);
    
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://auth-url.com' },
      error: null,
    });

    // Mock no session (user cancelled)
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const button = screen.getByTestId('popup-auth');
    fireEvent.click(button);

    await waitFor(() => {
      expect(window.open).toHaveBeenCalled();
    });
  });

  it('should handle OAuth error', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: null,
      error: { message: 'OAuth failed' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const button = screen.getByTestId('popup-auth');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalled();
    });
  });
});