import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSpotifyAccess } from '../hooks/useSpotifyAccess';
import { useSpotify } from '../hooks/useSpotify';
import { SpotifyTrack } from '@shared/types';

interface PlayButtonProps {
  track: SpotifyTrack;
  className?: string;
}

interface AuthOptionsModalProps {
  onSelect: (provider: 'google' | 'spotify' | 'facebook' | 'discord') => void;
  onCancel: () => void;
}

const AuthOptionsModal: React.FC<AuthOptionsModalProps> = ({ onSelect, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Sign in to play music</h3>
        <div className="space-y-2">
          <button
            onClick={() => onSelect('spotify')}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            🎵 Continue with Spotify
          </button>
          <button
            onClick={() => onSelect('google')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            📧 Continue with Google
          </button>
          <button
            onClick={() => onSelect('facebook')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            📘 Continue with Facebook
          </button>
          <button
            onClick={() => onSelect('discord')}
            className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
          >
            🎮 Continue with Discord
          </button>
        </div>
        <button
          onClick={onCancel}
          className="w-full mt-4 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export const PlayButton: React.FC<PlayButtonProps> = ({ track, className = '' }) => {
  const { user, signInWithOAuthPopup } = useAuth();
  const { hasSpotifyAccess, ensureSpotifyAccess, isPremium, isLinking } = useSpotifyAccess();
  const { playTrack, isPlayerReady } = useSpotify();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showAuthError, setShowAuthError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Use a ref to store the current modal promise handlers - component-specific, no global state
  const authModalHandlersRef = useRef<{
    resolve: (provider: 'google' | 'spotify' | 'facebook' | 'discord') => void;
    reject: (error: Error) => void;
  } | null>(null);

  // Cleanup function to properly handle pending promises
  const cleanupAuthModalHandlers = () => {
    if (authModalHandlersRef.current) {
      authModalHandlersRef.current.reject(new Error('Authentication flow cancelled'));
      authModalHandlersRef.current = null;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupAuthModalHandlers();
    };
  }, []);

  const showAuthOptionsModal = (): Promise<'google' | 'spotify' | 'facebook' | 'discord'> => {
    return new Promise((resolve, reject) => {
      // Clean up any existing handlers before setting new ones
      cleanupAuthModalHandlers();
      
      // Store the promise handlers in the component-specific ref
      authModalHandlersRef.current = { resolve, reject };
      setShowAuthModal(true);
    });
  };

  const handleAuthSelect = (provider: 'google' | 'spotify' | 'facebook' | 'discord') => {
    setShowAuthModal(false);
    if (authModalHandlersRef.current) {
      authModalHandlersRef.current.resolve(provider);
      authModalHandlersRef.current = null; // Clean up
    }
  };

  const handleAuthCancel = () => {
    setShowAuthModal(false);
    if (authModalHandlersRef.current) {
      authModalHandlersRef.current.reject(new Error('Authentication cancelled'));
      authModalHandlersRef.current = null; // Clean up
    }
  };

  const handlePlay = async () => {
    // Step 1: Ensure user is authenticated
    if (!user) {
      setIsAuthenticating(true);
      
      try {
        // Show auth options popup
        const authChoice = await showAuthOptionsModal();
        
        const result = await signInWithOAuthPopup(authChoice);
        setIsAuthenticating(false);
        
        if (!result.success) {
          setShowAuthError(result.error || 'Authentication failed');
          setTimeout(() => setShowAuthError(null), 5000);
          return;
        }
        
        // After auth, the component will re-render and user can try again
        return;
      } catch {
        setIsAuthenticating(false);
        return; // User cancelled auth
      }
    }

    // Step 2: Ensure Spotify access
    if (!hasSpotifyAccess) {
      setIsAuthenticating(true);
      
      const result = await ensureSpotifyAccess();
      setIsAuthenticating(false);
      
      if (!result || !result.success) {
        setShowAuthError(result?.error || 'Failed to connect Spotify');
        setTimeout(() => setShowAuthError(null), 5000);
        return;
      }
      
      // After linking, the component will re-render
      return;
    }

    // Step 3: Play the track
    if (!isPremium) {
      // Free users - redirect to Spotify app
      const deepLink = `spotify:track:${track.id}`;
      const webLink = `https://open.spotify.com/track/${track.id}`;
      
      try {
        window.location.href = deepLink;
        setTimeout(() => {
          window.open(webLink, '_blank');
        }, 1500);
      } catch {
        window.open(webLink, '_blank');
      }
      return;
    }

    if (isPremium && isPlayerReady) {
      // Premium users - play in browser
      try {
        await playTrack(`spotify:track:${track.id}`);
      } catch (error) {
        console.error('Playback failed:', error);
        window.open(`https://open.spotify.com/track/${track.id}`, '_blank');
      }
    }
  };

  const getButtonText = () => {
    if (isAuthenticating || isLinking) return 'Connecting...';
    if (!user) return 'Sign In to Play';
    if (!hasSpotifyAccess) return 'Connect Spotify';
    if (!isPremium) return 'Play in Spotify';
    if (!isPlayerReady) return 'Loading Player...';
    return 'Play';
  };

  const getButtonIcon = () => {
    if (isAuthenticating || isLinking) return '⏳';
    if (!user || !hasSpotifyAccess || !isPremium) return '🎵';
    return '▶️';
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={handlePlay}
          disabled={isAuthenticating || isLinking || (isPremium && hasSpotifyAccess && !isPlayerReady)}
          className={`play-button ${className} ${!isPremium || !hasSpotifyAccess ? 'external' : 'internal'} px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:opacity-50`}
        >
          <span className="icon mr-1">{getButtonIcon()}</span>
          <span className="text">{getButtonText()}</span>
        </button>
        
        {showAuthError && (
          <div className="absolute top-full left-0 mt-1 bg-red-900 text-red-200 text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
            {showAuthError}
          </div>
        )}
      </div>
      
      {showAuthModal && (
        <AuthOptionsModal
          onSelect={handleAuthSelect}
          onCancel={handleAuthCancel}
        />
      )}
    </>
  );
};