import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, EyeOff, Edit3, Trash2 } from 'lucide-react';
import { usePlaylist } from '../contexts/PlaylistContext';
import { useAuth } from '../contexts/AuthContext';

function Playlists() {
  const { user } = useAuth();
  const { playlists, deletePlaylist, updatePlaylist } = usePlaylist();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

  if (!user) return null;

  const userPlaylists = playlists
    .filter(p => p.userId === user.id)
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'public' && p.isPublic) ||
                           (filterType === 'private' && !p.isPublic);
      return matchesSearch && matchesFilter;
    });

  const togglePlaylistVisibility = (playlistId: string, currentVisibility: boolean) => {
    updatePlaylist(playlistId, { isPublic: !currentVisibility });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Playlists</h1>
            <p className="text-gray-400">Manage your music collections and visual mixtapes</p>
          </div>
          <Link
            to="/playlist/builder"
            className="mt-4 sm:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>New Playlist</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search playlists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Playlists</option>
                <option value="public">Public Only</option>
                <option value="private">Private Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Playlists Grid */}
        {userPlaylists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPlaylists.map((playlist) => (
              <div key={playlist.id} className="glass-effect rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group">
                {/* Cover Image */}
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600">
                  {playlist.coverImage ? (
                    <img 
                      src={playlist.coverImage} 
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {playlist.albums.length > 0 ? (
                        <div className="grid grid-cols-2 gap-1 w-full h-full">
                          {playlist.albums.slice(0, 4).map((album, index) => (
                            <img 
                              key={index}
                              src={album.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-6xl font-bold text-white/50">
                          {playlist.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Overlay with Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                    <button
                      onClick={() => togglePlaylistVisibility(playlist.id, playlist.isPublic)}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
                      title={playlist.isPublic ? 'Make Private' : 'Make Public'}
                    >
                      {playlist.isPublic ? (
                        <EyeOff className="w-5 h-5 text-white" />
                      ) : (
                        <Eye className="w-5 h-5 text-white" />
                      )}
                    </button>
                    
                    <Link
                      to={`/playlist/builder?edit=${playlist.id}`}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300"
                      title="Edit Playlist"
                    >
                      <Edit3 className="w-5 h-5 text-white" />
                    </Link>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this playlist?')) {
                          deletePlaylist(playlist.id);
                        }
                      }}
                      className="p-3 bg-red-500/50 backdrop-blur-sm rounded-full hover:bg-red-500/70 transition-all duration-300"
                      title="Delete Playlist"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Playlist Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors duration-300">
                      {playlist.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      playlist.isPublic 
                        ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {playlist.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {playlist.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-400 font-medium">
                      {playlist.albums.length} albums
                    </span>
                    <span className="text-gray-500">
                      Updated {playlist.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-fit mx-auto mb-6">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Playlists Yet</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || filterType !== 'all' 
                  ? 'No playlists match your search criteria'
                  : 'Start your musical journey by creating your first visual playlist'
                }
              </p>
              <Link
                to="/playlist/builder"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Create Playlist</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Playlists;