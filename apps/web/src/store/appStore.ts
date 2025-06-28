import { create } from 'zustand';
import type { User, Playlist, Track, NFT } from '../types';

interface AppStore {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Music state  
  currentTrack: Track | null;
  currentPlaylist: Playlist | null;
  userPlaylists: Playlist[];
  
  // NFT state
  nftGallery: NFT[];
  
  // UI state
  isPlayerOpen: boolean;
  isChatOpen: boolean;
  currentView: 'home' | 'profile' | 'playlist' | 'player' | 'chat';
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setCurrentTrack: (track: Track | null) => void;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  togglePlayer: () => void;
  toggleChat: () => void;
  setCurrentView: (view: 'home' | 'profile' | 'playlist' | 'player' | 'chat') => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  currentTrack: null,
  currentPlaylist: null,
  userPlaylists: [],
  nftGallery: [],
  isPlayerOpen: false,
  isChatOpen: false,
  currentView: 'home',
  isLoading: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setCurrentTrack: (currentTrack) => set({ currentTrack }),
  setCurrentPlaylist: (currentPlaylist) => set({ currentPlaylist }),
  addToPlaylist: (playlistId, track) => {
    const state = get();
    const updatedPlaylists = state.userPlaylists.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, tracks: [...playlist.tracks, track] }
        : playlist
    );
    set({ userPlaylists: updatedPlaylists });
  },
  togglePlayer: () => set((state) => ({ isPlayerOpen: !state.isPlayerOpen })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setCurrentView: (currentView) => set({ currentView }),
  setLoading: (loading) => set({ isLoading: loading }),
}));