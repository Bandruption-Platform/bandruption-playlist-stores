import { create } from 'zustand';
import { AppState, Album, AIArtGeneration, NFT, ChatMessage, Track, User, Playlist } from '../types';
import { mockAlbums, mockUser, mockNFTs, mockDrafts, mockPlaylists, mockFanUsers } from '@/data/mockData';

interface AppStore extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setLibraryView: (view: 'blocks' | 'details' | 'stack' | 'list') => void;
  addAlbumToLibrary: (album: Album) => void;
  removeAlbumFromLibrary: (albumId: string) => void;
  startNFTGeneration: (generation: AIArtGeneration) => void;
  updateNFTGeneration: (id: string, updates: Partial<AIArtGeneration>) => void;
  addChatMessage: (message: ChatMessage) => void;
  setCurrentlyPlaying: (track: Track | null) => void;
  addNFTToGallery: (nft: NFT) => void;
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (playlistId: string) => void;
  // Fan users
  fanUsers: User[];
  getFanUserById: (id: string) => User | null;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  user: mockUser,
  library: mockAlbums,
  playlists: mockPlaylists,
  drafts: mockDrafts,
  nftGallery: mockNFTs,
  chatHistory: [],
  currentlyPlaying: null,
  isGeneratingNFT: false,
  libraryView: 'blocks',
  followedArtists: mockUser.followedArtists,
  favoriteAlbums: mockUser.favoriteAlbums || [],
  fanUsers: mockFanUsers,

  // Actions
  setUser: (user) => set({ user }),
  
  setLibraryView: (view) => set({ libraryView: view }),
  
  addAlbumToLibrary: (album) => 
    set((state) => ({ library: [...state.library, album] })),
  
  removeAlbumFromLibrary: (albumId) =>
    set((state) => ({ 
      library: state.library.filter(album => album.id !== albumId) 
    })),
  
  startNFTGeneration: (generation) =>
    set((state) => ({ 
      drafts: [...state.drafts, generation],
      isGeneratingNFT: true 
    })),
  
  updateNFTGeneration: (id, updates) =>
    set((state) => ({
      drafts: state.drafts.map(draft => 
        draft.id === id ? { ...draft, ...updates } : draft
      ),
      isGeneratingNFT: updates.status === 'generating' ? true : false
    })),
  
  addChatMessage: (message) =>
    set((state) => ({ 
      chatHistory: [...state.chatHistory, message] 
    })),
  
  setCurrentlyPlaying: (track) => set({ currentlyPlaying: track }),
  
  addNFTToGallery: (nft) =>
    set((state) => ({ 
      nftGallery: [...state.nftGallery, nft] 
    })),

  addPlaylist: (playlist) =>
    set((state) => ({
      playlists: [...state.playlists, playlist]
    })),

  removePlaylist: (playlistId) =>
    set((state) => ({
      playlists: state.playlists.filter(playlist => playlist.id !== playlistId)
    })),

  getFanUserById: (id: string) => {
    const state = get();
    return state.fanUsers.find(user => user.id === id) || null;
  },
}));