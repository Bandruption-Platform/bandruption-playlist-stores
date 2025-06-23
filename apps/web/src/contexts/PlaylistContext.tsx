import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Playlist, Album } from '@shared/types';
import { mockPlaylists } from '../data/mockData';

interface PlaylistContextType {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  createPlaylist: (name: string, description: string) => Playlist;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addAlbumToPlaylist: (playlistId: string, album: Album) => void;
  removeAlbumFromPlaylist: (playlistId: string, albumId: string) => void;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
}

interface PlaylistProviderProps {
  children: ReactNode;
}

export function PlaylistProvider({ children }: PlaylistProviderProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);

  const createPlaylist = (name: string, description: string): Playlist => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      user_id: 'user-1', // This would come from auth context
      title: name,
      description,
      albums: [],
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  };

  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === id 
        ? { ...playlist, ...updates, updated_at: new Date().toISOString() }
        : playlist
    ));
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== id));
    if (currentPlaylist?.id === id) {
      setCurrentPlaylist(null);
    }
  };

  const addAlbumToPlaylist = (playlistId: string, album: Album) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId
        ? { 
            ...playlist, 
            albums: [...(playlist.albums || []), album],
            updated_at: new Date().toISOString()
          }
        : playlist
    ));
  };

  const removeAlbumFromPlaylist = (playlistId: string, albumId: string) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId
        ? { 
            ...playlist, 
            albums: (playlist.albums || []).filter(album => album.id !== albumId),
            updated_at: new Date().toISOString()
          }
        : playlist
    ));
  };

  const value = {
    playlists,
    currentPlaylist,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addAlbumToPlaylist,
    removeAlbumFromPlaylist,
    setCurrentPlaylist
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}