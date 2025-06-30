import { useState, useEffect } from 'react';
import { spotifyApi } from '../services/spotifyApi';
import { popupAuthService } from '../services/popupAuth';
import { SpotifyUser } from '@shared/types';

export const useSpotifyAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const checkSpotifyConnection = async () => {
      const storedToken = localStorage.getItem('spotify_access_token');
      const storedUser = localStorage.getItem('spotify_user');
      
      if (storedToken && storedUser) {
        try {
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          // Clear corrupted data
          localStorage.removeItem('spotify_access_token');
          localStorage.removeItem('spotify_user');
        }
      }
      setLoading(false);
    };

    // Initialize by checking stored connection only
    // Auth codes are processed only in SpotifyCallback popup component
    checkSpotifyConnection();

    // Listen for auth changes from popup authentication
    window.addEventListener('spotify-auth-changed', checkSpotifyConnection);

    return () => {
      window.removeEventListener('spotify-auth-changed', checkSpotifyConnection);
    };
  }, []);

  const loginWithPopup = async (): Promise<{ success: boolean; error?: string }> => {
    setIsAuthenticating(true);
    
    try {
      const result = await popupAuthService.loginWithPopup();
      
      if (result.success && result.accessToken && result.userData) {
        // Store authentication data
        localStorage.setItem('spotify_access_token', result.accessToken);
        localStorage.setItem('spotify_user', JSON.stringify(result.userData));
        localStorage.setItem('spotify_connected', 'true');
        localStorage.setItem('spotify_user_id', result.userId!);
        
        // Update state
        setAccessToken(result.accessToken);
        setUser(result.userData);
        setIsAuthenticated(true);
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('spotify-auth-changed'));
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Authentication failed' 
        };
      }
    } catch (error) {
      console.error('Popup authentication failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Removed redirect method - using popup-only authentication

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAccessToken(null);
    spotifyApi.disconnect();
    
    // No need to clean up processed codes since we don't use them in main app
  };

  return {
    isAuthenticated,
    user,
    accessToken,
    loading,
    isAuthenticating,
    loginWithPopup,
    login: loginWithPopup, // Use popup as the only login method
    logout,
    isPremium: user?.product === 'premium'
  };
};