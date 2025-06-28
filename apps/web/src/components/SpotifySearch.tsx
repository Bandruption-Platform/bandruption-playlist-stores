import React, { useState } from 'react';
import { SpotifySearchResults, SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '@shared/types';

export const SpotifySearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<string>('track,album,artist');
  const [results, setResults] = useState<SpotifySearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/spotify/public/search?q=${encodeURIComponent(query)}&type=${searchType}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const searchResults = await response.json();
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="spotify-search p-6 max-w-4xl mx-auto">
      <div className="search-controls mb-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

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
                    <div className="text-sm text-gray-400">
                      {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
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