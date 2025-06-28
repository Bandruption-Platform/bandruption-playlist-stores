import { useState, useEffect } from 'react';
import { spotifyApi } from '../services/spotifyApi';
import { SpotifyUser } from '@shared/types';

export const useSpotifyAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSpotifyConnection = async () => {
      const storedToken = localStorage.getItem('spotify_access_token');
      const storedUser = localStorage.getItem('spotify_user');
      
      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setLoading(false);

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state) {
        await handleAuthCallback(code, state);
      }
    };

    checkSpotifyConnection();

    window.addEventListener('spotify-auth-changed', checkSpotifyConnection);

    return () => {
      window.removeEventListener('spotify-auth-changed', checkSpotifyConnection);
    };
  }, []);

  const login = async () => {
    try {
      const { authUrl } = await spotifyApi.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    try {
      const result = await spotifyApi.handleAuthCallback(code, state);
      if (result.success) {
        const userData = await spotifyApi.getUserProfile(result.userId, accessToken!);
        
        setUser(userData);
        setIsAuthenticated(true);
        
        localStorage.setItem('spotify_user', JSON.stringify(userData));
        localStorage.setItem('spotify_connected', 'true');
        localStorage.setItem('spotify_user_id', result.userId);
      }
    } catch (error) {
      console.error('Auth callback failed:', error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAccessToken(null);
    spotifyApi.disconnect();
  };

  return {
    isAuthenticated,
    user,
    accessToken,
    loading,
    login,
    logout,
    isPremium: user?.product === 'premium'
  };
};