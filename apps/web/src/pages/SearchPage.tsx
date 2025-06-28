import React from 'react';
import { SpotifySearch } from '../components/SpotifySearch';
import { useSpotify } from '../contexts/SpotifyContext';

export const SearchPage: React.FC = () => {
  const { isAuthenticated, connectSpotify } = useSpotify();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Music</h1>
        <p className="text-gray-400 mb-4">
          Search millions of tracks, albums, and artists from Spotify's catalog.
        </p>
        
        {!isAuthenticated && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-400">Enhanced Features Available</h3>
                <p className="text-xs text-green-300/80 mt-1">
                  Connect your Spotify account to play full tracks and access your playlists.
                </p>
              </div>
              <button
                onClick={connectSpotify}
                className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
              >
                Connect Spotify
              </button>
            </div>
          </div>
        )}
      </div>
      
      <SpotifySearch />
    </div>
  );
};