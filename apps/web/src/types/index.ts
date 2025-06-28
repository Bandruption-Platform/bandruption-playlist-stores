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
  isPaidSubscriber?: boolean;
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

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  previewUrl?: string;
  spotifyId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  userId: string;
  tracks: Track[];
  isPublic: boolean;
  coverImageUrl?: string;
  createdAt: string;
}

export interface MerchItem {
  id: string;
  name: string;
  type: 't-shirt' | 'hoodie' | 'poster' | 'sticker';
  price: number;
  imageUrl: string;
  nftArtwork: string;
  userId: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  userId?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}