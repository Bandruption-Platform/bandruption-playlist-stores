export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  profileImage?: string;
  spotifyConnected?: boolean;
  spotify_user_id?: string;
  spotify_display_name?: string;
  spotify_image_url?: string;
  bio?: string;
  favoriteGenres?: string[];
  nftGallery?: NFT[];
  followedArtists?: Artist[];
  favoriteAlbums?: Album[];
  isPaidSubscriber?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  genre?: string;
  isFollowed?: boolean;
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
  isFeatured?: boolean;
  items?: PlaylistItem[];
  // Legacy fields for backward compatibility
  name?: string;
  tracks?: Track[];
  userId?: string;
  coverImageUrl?: string;
}

export interface PlaylistItem {
  id: string;
  trackId: string;
  albumId: string;
  addedAt: Date;
  addedBy: string;
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
  // Extended Spotify metadata
  album_name?: string;
  album_image_url?: string;
  preview_url?: string;
  external_url?: string;
  artist_id?: string;
  album_id?: string;
  // Legacy field for backward compatibility
  album?: string;
  previewUrl?: string;
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
  asset_id: number;
  name: string;
  description?: string;
  image_url: string;
  metadata_url: string;
  creator_address: string;
  current_owner_address?: string;
  price?: number;
  for_sale: boolean;
  created_at: string;
  updated_at: string;
  // Legacy fields for compatibility
  imageUrl?: string;
  originalAlbumArt?: string;
  userId?: string;
  algorandId?: string;
  createdAt?: Date;
  forSale?: boolean;
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
export interface ApiResponse<T = unknown> {
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
  playlists: Playlist[];
  drafts: AIArtGeneration[];
  nftGallery: NFT[];
  chatHistory: ChatMessage[];
  currentlyPlaying: Track | null;
  isGeneratingNFT: boolean;
  libraryView: 'blocks' | 'details' | 'stack' | 'list';
}

// Spotify Integration Types
export interface SpotifyAuth {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string; width: number; height: number }>;
  country: string;
  product: 'free' | 'premium';
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  images: Array<{ url: string; width: number; height: number }>;
  release_date: string;
  total_tracks: number;
  tracks: { items: SpotifyTrack[] };
  external_urls: { spotify: string };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string; width: number; height: number }>;
  genres: string[];
  followers: { total: number };
  external_urls: { spotify: string };
}

export interface SpotifySearchResults {
  tracks?: { items: SpotifyTrack[] };
  albums?: { items: SpotifyAlbum[] };
  artists?: { items: SpotifyArtist[] };
}

// Bandruption AI Integration Types
export interface BandruptionChatMessage extends ChatMessage {
  type: 'bandruption';
  axelResponse?: string;
}

export interface BandruptionApiResponse {
  reply: string;
}

export interface BandruptionError {
  error: string;
}

// Algorand Integration Types
export interface AlgorandWallet {
  id: string;
  user_id: string;
  address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NFTTransaction {
  id: string;
  nft_id: string;
  transaction_id: string;
  from_address?: string;
  to_address: string;
  transaction_type: 'mint' | 'buy' | 'transfer';
  amount?: number;
  block_number?: number;
  created_at: string;
}

export interface MintNFTRequest {
  name: string;
  description: string;
  metadata?: object;
}

export interface BuyNFTRequest {
  price: number;
}

export interface TransferNFTRequest {
  toAddress: string;
}

export interface ListNFTRequest {
  price: number;
}

export interface WalletInfo {
  address: string;
  balance: number;
  assets: AlgorandAsset[];
}

export interface AlgorandAsset {
  'asset-id': number;
  amount: number;
  'is-frozen': boolean;
}

export interface WalletStatus {
  hasWallet: boolean;
  address?: string;
}

export interface MintNFTResponse {
  assetId: number;
  txId: string;
  nft: NFT;
}

export interface TransferNFTResponse {
  txId: string;
  blockNumber: number;
}

export interface AlgorandNetworkStatus {
  'last-round': number;
  'last-version': string;
  'next-version': string;
  'next-version-round': number;
  'next-version-supported': boolean;
  'stopped-at-unsupported-round': boolean;
  'time-since-last-round': number;
} 