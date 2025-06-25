export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  profileImage?: string;
  spotifyConnected?: boolean;
  bio?: string;
  favoriteGenres?: string[];
  nftGallery?: NFT[];
}

export interface Playlist {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_image?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  albums?: Album[];
  coverImage?: string;
}

export interface Track {
  id: string;
  playlist_id?: string;
  spotify_id?: string;
  title?: string;
  artist?: string;
  duration: number;
  order?: number;
  added_at?: string;
  // Mobile app fields (keep both for compatibility)
  name?: string;
  trackNumber?: number;
  lyrics?: string;
  spotifyId?: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  imageUrl: string;
  releaseDate: string;
  genre: string;
  tracks: Track[];
  spotifyId?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  albumRecommendations?: Album[];
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  originalAlbumArt: string;
  price: number;
  userId: string;
  algorandId?: string;
  createdAt: Date;
  forSale: boolean;
}

export interface AIArtGeneration {
  id: string;
  sourceAlbumId: string;
  prompt: string;
  style: 'abstract' | 'cyberpunk' | 'vintage' | 'minimalist' | 'psychedelic';
  generatedImageUrl: string;
  status: 'generating' | 'completed' | 'failed';
  userId: string;
  createdAt: Date;
  needsApproval?: boolean;
  artistApproved?: boolean;
}

export interface MerchItem {
  id: string;
  name: string;
  description: string;
  type: 'tshirt' | 'hoodie' | 'poster' | 'sticker' | 'vinyl';
  imageUrl: string;
  price: number;
  userId: string;
  artworkId: string;
  printfulId?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

// Add ArtStyle type for mobile app
export type ArtStyle = 'abstract' | 'cyberpunk' | 'vintage' | 'minimalist' | 'psychedelic';

// Add MerchType for mobile app
export type MerchType = 'tshirt' | 'hoodie' | 'poster' | 'sticker' | 'vinyl';

// Add AppState interface for mobile app store
export interface AppState {
  user: User | null;
  library: Album[];
  drafts: AIArtGeneration[];
  nftGallery: NFT[];
  chatHistory: ChatMessage[];
  currentlyPlaying: Track | null;
  isGeneratingNFT: boolean;
  libraryView: 'blocks' | 'details' | 'stack' | 'list';
} 