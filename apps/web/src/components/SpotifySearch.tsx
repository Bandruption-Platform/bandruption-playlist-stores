import React from 'react';
import { SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '@shared/types';
import { useSpotify } from '../contexts/SpotifyContext';
import { useSpotifySearch } from '../hooks/useSpotifySearch';
import { PlayButton } from './PlayButton';

export const SpotifySearch: React.FC = () => {
  const { isAuthenticated, isPremium, logout, accessToken } = useSpotify();
  const { query, results, isLoading, error, search, updateQuery, searchType, setSearchType } = useSpotifySearch(accessToken || undefined);

  const handleSearch = () => {
    search();
  };

  return (
    <div className="spotify-search p-6 max-w-4xl mx-auto">
      {isAuthenticated && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-green-400 text-sm font-medium">Connected to Spotify</span>
                {!isPremium && (
                  <span className="text-orange-400 text-xs">Free account - External player only</span>
                )}
                {isPremium && (
                  <span className="text-green-300 text-xs">Premium account - Full playback available</span>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="text-xs text-green-300 hover:text-green-200 underline"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
      
      <div className="search-controls mb-6 space-y-4">
        {/* Mobile layout - stacked */}
        <div className="flex flex-col sm:hidden space-y-3">
          <input
            type="text"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Search for songs, artists, albums..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 bg-dark-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          
          <div className="flex gap-3">
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              className="flex-1 px-4 py-2 bg-dark-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="track,album,artist">All</option>
              <option value="track">Songs</option>
              <option value="album">Albums</option>
              <option value="artist">Artists</option>
            </select>
            
            <button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Desktop layout - horizontal */}
        <div className="hidden sm:flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Search for songs, artists, albums..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 bg-dark-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            className="px-4 py-2 bg-dark-800 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="track,album,artist">All</option>
            <option value="track">Songs</option>
            <option value="album">Albums</option>
            <option value="artist">Artists</option>
          </select>
          
          <button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message p-4 bg-red-900/20 border border-red-500/30 rounded-lg mb-6">
          <p className="text-red-400">Search failed: {error}</p>
        </div>
      )}

      {results && (
        <div className="search-results space-y-8">
          {results.tracks && (
            <div className="tracks-section">
              <h3 className="text-xl font-bold mb-4">Songs</h3>
              <div className="grid gap-4">
                {results.tracks.items.map((track: SpotifyTrack) => (
                  <div key={track.id} className="track-item flex items-center gap-4 p-4 bg-dark-800 border border-gray-700 rounded-lg hover:bg-dark-700 transition-colors">
                    <img 
                      src={track.album.images[0]?.url} 
                      alt={track.album.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-white">{track.name}</p>
                      <p className="text-gray-300">{track.artists.map(a => a.name).join(', ')}</p>
                      <p className="text-sm text-gray-400">{track.album.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-400">
                        {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                      </div>
                      <PlayButton track={track} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.albums && (
            <div className="albums-section">
              <h3 className="text-xl font-bold mb-4">Albums</h3>
              <div className="grid gap-4">
                {results.albums.items.map((album: SpotifyAlbum) => (
                  <div key={album.id} className="album-item flex items-center gap-4 p-4 bg-dark-800 border border-gray-700 rounded-lg hover:bg-dark-700 transition-colors">
                    <img 
                      src={album.images[0]?.url} 
                      alt={album.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-white">{album.name}</p>
                      <p className="text-gray-300">{album.artists.map(a => a.name).join(', ')}</p>
                      <p className="text-sm text-gray-400">{album.release_date} • {album.total_tracks} tracks</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => window.open(`https://open.spotify.com/album/${album.id}`, '_blank')}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        View Album
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.artists && (
            <div className="artists-section">
              <h3 className="text-xl font-bold mb-4">Artists</h3>
              <div className="grid gap-4">
                {results.artists.items.map((artist: SpotifyArtist) => (
                  <div key={artist.id} className="artist-item flex items-center gap-4 p-4 bg-dark-800 border border-gray-700 rounded-lg hover:bg-dark-700 transition-colors">
                    <img 
                      src={artist.images[0]?.url} 
                      alt={artist.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-white">{artist.name}</p>
                      <p className="text-gray-300">{artist.followers.total.toLocaleString()} followers</p>
                      <p className="text-sm text-gray-400">{artist.genres.slice(0, 3).join(', ')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => window.open(`https://open.spotify.com/artist/${artist.id}`, '_blank')}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        View Artist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};