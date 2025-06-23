import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Save, Eye, EyeOff, X, Contrast as DragDropContext, Droplet as Droppable, Cable as Draggable } from 'lucide-react';
import { usePlaylist } from '../contexts/PlaylistContext';
import { useAuth } from '../contexts/AuthContext';
import { spotifyService } from '../services/apiService';
import { Album } from '@shared/types';
import AlbumCard from '../components/AlbumCard';

function PlaylistBuilder() {
  const { user } = useAuth();
  const { playlists, createPlaylist, updatePlaylist, currentPlaylist, setCurrentPlaylist } = usePlaylist();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Album[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editingPlaylistId = searchParams.get('edit');

  useEffect(() => {
    if (editingPlaylistId) {
      const playlistToEdit = playlists.find(p => p.id === editingPlaylistId);
      if (playlistToEdit && playlistToEdit.user_id === user?.id) {
        setPlaylistName(playlistToEdit.title);
        setPlaylistDescription(playlistToEdit.description || '');
        setIsPublic(playlistToEdit.is_public);
        setSelectedAlbums(playlistToEdit.albums || []);
        setCurrentPlaylist(playlistToEdit);
      }
    } else {
      // Reset form for new playlist
      setPlaylistName('');
      setPlaylistDescription('');
      setIsPublic(false);
      setSelectedAlbums([]);
      setCurrentPlaylist(null);
    }
  }, [editingPlaylistId, playlists, user?.id, setCurrentPlaylist]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await spotifyService.search(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addAlbumToPlaylist = (album: Album) => {
    if (!selectedAlbums.find(a => a.id === album.id)) {
      setSelectedAlbums([...selectedAlbums, album]);
    }
  };

  const removeAlbumFromPlaylist = (albumId: string) => {
    setSelectedAlbums(selectedAlbums.filter(a => a.id !== albumId));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedAlbums);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedAlbums(items);
  };

  const handleSave = async () => {
    if (!playlistName.trim() || selectedAlbums.length === 0) return;

    setIsSaving(true);
    try {
      if (editingPlaylistId) {
        updatePlaylist(editingPlaylistId, {
          title: playlistName,
          description: playlistDescription,
          is_public: isPublic,
          albums: selectedAlbums
        });
      } else {
        createPlaylist(playlistName, playlistDescription);
        // In a real app, we'd then update the created playlist with albums
      }
      navigate('/playlists');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {editingPlaylistId ? 'Edit Playlist' : 'Create New Playlist'}
          </h1>
          <p className="text-gray-400">
            {editingPlaylistId ? 'Update your visual music collection' : 'Build your perfect visual music collection'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Playlist Settings */}
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Playlist Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="My Awesome Playlist"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={playlistDescription}
                    onChange={(e) => setPlaylistDescription(e.target.value)}
                    placeholder="Tell us about this playlist..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Visibility</label>
                    <p className="text-xs text-gray-400">
                      {isPublic ? 'Everyone can see this playlist' : 'Only you can see this playlist'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isPublic 
                        ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                        : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{isPublic ? 'Public' : 'Private'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Search Albums</h2>
              
              <div className="flex space-x-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search for albums, artists, genres..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {searchResults.map((album) => (
                    <AlbumCard
                      key={album.id}
                      album={album}
                      onAddToPlaylist={addAlbumToPlaylist}
                      showAddButton={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Albums */}
          <div className="glass-effect rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Selected Albums ({selectedAlbums.length})
              </h2>
              <button
                onClick={handleSave}
                disabled={!playlistName.trim() || selectedAlbums.length === 0 || isSaving}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300"
              >
                <Save className="w-5 h-5" />
                <span>{isSaving ? 'Saving...' : 'Save Playlist'}</span>
              </button>
            </div>

            {selectedAlbums.length > 0 ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="selected-albums">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {selectedAlbums.map((album, index) => (
                        <Draggable key={album.id} draggableId={album.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-300 ${
                                snapshot.isDragging
                                  ? 'bg-purple-600/20 border-purple-500/50 shadow-2xl'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                              }`}
                            >
                              <img
                                src={album.imageUrl}
                                alt={album.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-white truncate">{album.name}</h3>
                                <p className="text-sm text-gray-400 truncate">{album.artist}</p>
                                <p className="text-xs text-gray-500">{album.genre}</p>
                              </div>
                              <button
                                onClick={() => removeAlbumFromPlaylist(album.id)}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-fit mx-auto mb-4 opacity-50">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-400 mb-2">No albums selected yet</p>
                <p className="text-sm text-gray-500">Search and add albums to build your playlist</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaylistBuilder;