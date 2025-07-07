import type { User, Album, Track, Playlist, NFT, MerchItem } from '@shared/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'alex@bandruption.com',
    username: 'alex_music',
    avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    bio: 'Electronic music producer and NFT artist. Creating the future of music ownership.',
    favoriteGenres: ['Electronic', 'Synthwave', 'Ambient'],
    isPaidSubscriber: true,
    spotifyConnected: true,
  },
  {
    id: '2',
    email: 'jordan@example.com',
    username: 'jordan_beats',
    avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    bio: 'Hip-hop producer and vinyl collector. Always discovering new sounds.',
    favoriteGenres: ['Hip-Hop', 'Jazz', 'Soul'],
    isPaidSubscriber: false,
    spotifyConnected: true,
  },
];

export const mockTracks: Track[] = [
  { id: '1', name: 'Midnight Drive', artist: 'Neon Lights', album: 'Synthwave Dreams', duration: 245, previewUrl: '/audio/preview1.mp3' },
  { id: '2', name: 'Ocean Waves', artist: 'Ambient Flow', album: 'Nature Sounds', duration: 312, previewUrl: '/audio/preview2.mp3' },
  { id: '3', name: 'City Pulse', artist: 'Urban Echo', album: 'Metropolitan', duration: 198, previewUrl: '/audio/preview3.mp3' },
  { id: '4', name: 'Solar Wind', artist: 'Space Journey', album: 'Cosmic Tales', duration: 267, previewUrl: '/audio/preview4.mp3' },
  { id: '5', name: 'Digital Love', artist: 'Cyber Romance', album: 'Virtual Hearts', duration: 223, previewUrl: '/audio/preview5.mp3' },
];

export const mockAlbums: Album[] = [
  {
    id: '1',
    name: 'Synthwave Dreams',
    artist: 'Neon Lights',
    imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    releaseDate: '2024-01-15',
    genre: 'Electronic',
    tracks: [mockTracks[0]],
  },
  {
    id: '2',
    name: 'Nature Sounds',
    artist: 'Ambient Flow',
    imageUrl: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    releaseDate: '2024-02-01',
    genre: 'Ambient',
    tracks: [mockTracks[1]],
  },
  {
    id: '3',
    name: 'Metropolitan',
    artist: 'Urban Echo',
    imageUrl: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    releaseDate: '2024-01-20',
    genre: 'Electronic',
    tracks: [mockTracks[2]],
  },
];

export const mockPlaylists: Playlist[] = [
  {
    id: '1',
    title: 'Late Night Vibes',
    name: 'Late Night Vibes', // legacy field
    description: 'Perfect soundtrack for midnight coding sessions',
    user_id: '1',
    userId: '1', // legacy field
    tracks: [mockTracks[0], mockTracks[1], mockTracks[4]], // legacy field
    is_public: true,
    coverImage: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    coverImageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', // legacy field
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    title: 'Morning Energy',
    name: 'Morning Energy', // legacy field
    description: 'Start your day with these uplifting beats',
    user_id: '1',
    userId: '1', // legacy field
    tracks: [mockTracks[2], mockTracks[3]], // legacy field
    is_public: true,
    coverImage: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    coverImageUrl: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', // legacy field
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
  },
  {
    id: '3',
    title: 'Hip-Hop Classics',
    name: 'Hip-Hop Classics', // legacy field
    description: 'The best hip-hop tracks from the golden era',
    user_id: '2',
    userId: '2', // legacy field
    tracks: [mockTracks[2], mockTracks[4]], // legacy field
    is_public: true,
    coverImage: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    coverImageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop', // legacy field
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

export const mockNFTs: NFT[] = [
  {
    id: '1',
    asset_id: 1001,
    name: 'Synthwave Dreams #001',
    description: 'AI-generated art inspired by the Synthwave Dreams album',
    image_url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    metadata_url: 'https://api.bandruption.com/nft/metadata/1',
    creator_address: 'ALGO123ABC456DEF789',
    current_owner_address: 'ALGO123ABC456DEF789',
    price: 0.5,
    for_sale: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    // Legacy fields
    imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    originalAlbumArt: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    userId: '1',
    createdAt: new Date('2024-01-15'),
    forSale: true,
  },
  {
    id: '2',
    asset_id: 1002,
    name: 'Ocean Waves Remix',
    description: 'Digital transformation of natural soundscapes',
    image_url: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    metadata_url: 'https://api.bandruption.com/nft/metadata/2',
    creator_address: 'ALGO123ABC456DEF789',
    current_owner_address: 'ALGO123ABC456DEF789',
    price: 0.3,
    for_sale: false,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    // Legacy fields
    imageUrl: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    originalAlbumArt: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    userId: '1',
    createdAt: new Date('2024-02-01'),
    forSale: false,
  },
  {
    id: '3',
    asset_id: 1003,
    name: 'Urban Pulse Collection',
    description: 'City-inspired digital art series',
    image_url: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    metadata_url: 'https://api.bandruption.com/nft/metadata/3',
    creator_address: 'ALGO987XYZ654ABC321',
    current_owner_address: 'ALGO987XYZ654ABC321',
    price: 0.8,
    for_sale: true,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    // Legacy fields
    imageUrl: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    originalAlbumArt: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    userId: '2',
    createdAt: new Date('2024-01-20'),
    forSale: true,
  },
];

export const mockMerchItems: MerchItem[] = [
  {
    id: '1',
    name: 'Synthwave Dreams T-Shirt',
    description: 'High-quality t-shirt featuring the Synthwave Dreams artwork',
    type: 'tshirt',
    price: 29.99,
    imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    artworkId: '1',
    userId: '1',
  },
  {
    id: '2',
    name: 'Ocean Waves Poster',
    description: '18x24 inch poster with Ocean Waves digital art',
    type: 'poster',
    price: 19.99,
    imageUrl: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    artworkId: '2',
    userId: '1',
  },
];