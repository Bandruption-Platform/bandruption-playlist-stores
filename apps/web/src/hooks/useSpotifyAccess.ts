import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSpotifyLinking } from './useSpotifyLinking';
import { SpotifyUser } from '@shared/types';

export const useSpotifyAccess = () => {
  const { session, hasSpotifyAccess, getSpotifyAccessMethod } = useAuth();
  const { linkSpotifyAccount, isLinking } = useSpotifyLinking();
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getSpotifyTokens = useCallback(async () => {
    if (!session?.user) return null;

    const accessMethod = getSpotifyAccessMethod();
    
    if (accessMethod === 'primary') {
      // User authenticated with Spotify as primary - get tokens from session
      const spotifyIdentity = session.user.identities?.find(
        identity => identity.provider === 'spotify'
      );
      
      if (spotifyIdentity) {
        // Get fresh tokens from your backend using the Supabase session
        const response = await fetch('/api/spotify/tokens', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return {
            access_token: data.access_token,
            user_data: data.user_data,
          };
        }
      }
    } else if (accessMethod === 'linked') {
      // User has linked Spotify - get from your custom table
      const storedToken = localStorage.getItem('spotify_access_token');
      const storedUser = localStorage.getItem('spotify_user');
      
      if (storedToken && storedUser) {
        return {
          access_token: storedToken,
          user_data: JSON.parse(storedUser),
        };
      }
    }
    
    return null;
  }, [session, getSpotifyAccessMethod]);

  useEffect(() => {
    const loadSpotifyData = async () => {
      setLoading(true);
      
      if (hasSpotifyAccess) {
        const tokens = await getSpotifyTokens();
        if (tokens) {
          setAccessToken(tokens.access_token);
          setSpotifyUser(tokens.user_data);
        }
      } else {
        setAccessToken(null);
        setSpotifyUser(null);
      }
      
      setLoading(false);
    };

    loadSpotifyData();
  }, [hasSpotifyAccess, getSpotifyTokens]);

  const ensureSpotifyAccess = async (): Promise<{ success: boolean; error?: string }> => {
    if (hasSpotifyAccess) {
      return { success: true };
    }

    // If user doesn't have Spotify access, offer to link it
    return await linkSpotifyAccount();
  };

  return {
    hasSpotifyAccess,
    spotifyUser,
    accessToken,
    loading,
    isLinking,
    accessMethod: getSpotifyAccessMethod(),
    ensureSpotifyAccess,
    isPremium: spotifyUser?.product === 'premium',
  };
};