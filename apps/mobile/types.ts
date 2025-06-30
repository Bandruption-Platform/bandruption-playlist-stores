// Mobile app specific types
export interface PlaylistItem {
  id: string;
  trackId: string;
  albumId: string;
  addedAt: Date;
  addedBy: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  userId: string;
  isPublic: boolean;
  items: PlaylistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  user: User | null;
  library: Album[];
  playlists: Playlist[];
  drafts: AIArtGeneration[];
  nftGallery: NFT[];
  chatHistory: ChatMessage[];
  currentlyPlaying: Track | null;
  isGeneratingNFT: boolean;
  libraryView: 'blocks' | 'details' | 'stack' | 'list';
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Re-export shared types
export { User, Album, AIArtGeneration, NFT, Track } from '@shared/types';
