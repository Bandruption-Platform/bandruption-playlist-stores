import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { popupAuthService } from '../services/popupAuth';
import { supabase } from '@shared/supabase';

export const useSpotifyLinking = () => {
  const { user } = useAuth();
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkSpotifyAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Must be logged in to link Spotify account' };
    }

    setIsLinking(true);
    setError(null);

    try {
      // Use existing popup flow to get Spotify tokens
      const spotifyResult = await popupAuthService.loginWithPopup();
      
      if (spotifyResult.success && spotifyResult.accessToken && spotifyResult.userData) {
        // Validate required fields
        if (!spotifyResult.userId) {
          return { success: false, error: 'Spotify user ID not available' };
        }

        // Calculate expiration time using actual expires_in from Spotify API
        const expiresInSeconds = spotifyResult.expiresIn || 3600; // Default to 1 hour if not provided
        const expiresAt = new Date(Date.now() + (expiresInSeconds * 1000));

        // Store Spotify tokens linked to Supabase user
        const { error: dbError } = await supabase
          .from('spotify_tokens')
          .upsert({
            user_id: user.id,
            access_token: spotifyResult.accessToken,
            refresh_token: spotifyResult.refreshToken || '', // Schema requires non-null; empty string used when unavailable
            // Note: Server-side refresh logic should check for empty string and handle as missing refresh token
            expires_at: expiresAt.toISOString(),
            spotify_user_id: spotifyResult.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (dbError) {
          console.error('Failed to store Spotify tokens:', dbError);
          return { success: false, error: 'Failed to link Spotify account' };
        }

        // Also store user data in localStorage for immediate UI updates
        localStorage.setItem('spotify_access_token', spotifyResult.accessToken);
        localStorage.setItem('spotify_user', JSON.stringify(spotifyResult.userData));
        localStorage.setItem('spotify_connected', 'true');
        localStorage.setItem('spotify_user_id', spotifyResult.userId);

        // Notify other components
        window.dispatchEvent(new CustomEvent('spotify-auth-changed'));

        return { success: true };
      } else {
        return { 
          success: false, 
          error: spotifyResult.error || 'Failed to authenticate with Spotify' 
        };
      }
    } catch (error) {
      console.error('Spotify linking failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to link Spotify account';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLinking(false);
    }
  }, [user]);

  const checkSpotifyLinkStatus = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('spotify_tokens')
        .select('access_token, expires_at')
        .eq('user_id', user.id)
        .single();

      if (error || !data) return false;

      // Check if token is still valid
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      
      return expiresAt > now;
    } catch (error) {
      console.error('Failed to check Spotify link status:', error);
      return false;
    }
  }, [user]);

  const unlinkSpotifyAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Must be logged in to unlink Spotify account' };
    }

    try {
      // Remove from database
      const { error: dbError } = await supabase
        .from('spotify_tokens')
        .delete()
        .eq('user_id', user.id);

      if (dbError) {
        console.error('Failed to remove Spotify tokens:', dbError);
        return { success: false, error: 'Failed to unlink Spotify account' };
      }

      // Clear localStorage
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_user');
      localStorage.removeItem('spotify_connected');
      localStorage.removeItem('spotify_user_id');

      // Notify other components
      window.dispatchEvent(new CustomEvent('spotify-auth-changed'));

      return { success: true };
    } catch (error) {
      console.error('Spotify unlinking failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlink Spotify account';
      return { success: false, error: errorMessage };
    }
  }, [user]);

  return {
    isLinking,
    error,
    linkSpotifyAccount,
    checkSpotifyLinkStatus,
    unlinkSpotifyAccount,
  };
};