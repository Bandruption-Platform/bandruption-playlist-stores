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
      // User authenticated with Spotify as primary - try to get tokens from backend
      const spotifyIdentity = session.user.identities?.find(
        identity => identity.provider === 'spotify'
      );
      
      if (spotifyIdentity) {
        try {
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
          } else if (response.status === 409) {
            // Primary auth detected but needs linking
            const errorData = await response.json();
            if (errorData.error === 'SPOTIFY_PRIMARY_AUTH_DETECTED') {
              console.log('Primary Spotify user needs to link account for full functionality');
              return null; // This will trigger the link flow
            }
          }
        } catch (error) {
          console.error('Failed to get tokens for primary auth user:', error);
        }
      }
    } else if (accessMethod === 'linked') {
      // User has linked Spotify - get from your custom table via backend
      try {
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
      } catch (error) {
        console.error('Failed to get tokens for linked user:', error);
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