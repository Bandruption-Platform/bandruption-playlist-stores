import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSpotifyLinking } from '../hooks/useSpotifyLinking';

interface SpotifyConnectionFlowProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const SpotifyConnectionFlow: React.FC<SpotifyConnectionFlowProps> = ({ 
  onConnectionChange 
}) => {
  const { user } = useAuth();
  const { isLinking, error, linkSpotifyAccount, checkSpotifyLinkStatus, unlinkSpotifyAccount } = useSpotifyLinking();
  const [isConnected, setIsConnected] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      if (user) {
        setCheckingStatus(true);
        const connected = await checkSpotifyLinkStatus();
        setIsConnected(connected);
        onConnectionChange?.(connected);
        setCheckingStatus(false);
      } else {
        setIsConnected(false);
        setCheckingStatus(false);
      }
    };

    checkConnection();

    // Listen for auth changes
    const handleAuthChange = () => checkConnection();
    window.addEventListener('spotify-auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('spotify-auth-changed', handleAuthChange);
    };
  }, [user, checkSpotifyLinkStatus, onConnectionChange]);

  const handleConnect = async () => {
    const result = await linkSpotifyAccount();
    if (result.success) {
      setIsConnected(true);
      onConnectionChange?.(true);
    }
  };

  const handleDisconnect = async () => {
    const result = await unlinkSpotifyAccount();
    if (result.success) {
      setIsConnected(false);
      onConnectionChange?.(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Sign in Required</h3>
          <p>Please sign in to connect your Spotify account</p>
        </div>
      </div>
    );
  }

  if (checkingStatus) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3"></div>
        <p className="text-gray-400">Checking Spotify connection...</p>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Spotify Connected</h3>
              <p className="text-green-400 text-sm">Your account is linked and ready to use</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-300/20 rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Connect to Spotify</h3>
        <p className="text-gray-400 mb-6">
          Link your Spotify account to access your music library, playlists, and premium features.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isLinking}
        className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLinking ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect to Spotify
          </>
        )}
      </button>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-start gap-3 text-sm text-gray-400">
          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="font-medium text-white mb-1">Secure Connection</p>
            <p>Your Spotify account will be securely linked to your Bandruption profile. You can disconnect it anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
};