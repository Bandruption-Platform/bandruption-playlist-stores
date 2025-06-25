import { User, Album, NFT, AIArtGeneration, Track } from '../types';

export const mockTracks: Track[] = [
  {
    id: '1',
    name: 'Opening Theme',
    duration: 240,
    trackNumber: 1,
    spotifyId: 'track1'
  },
  {
    id: '2',
    name: 'Digital Dreams',
    duration: 195,
    trackNumber: 2,
    spotifyId: 'track2'
  },
  {
    id: '3',
    name: 'Neon Nights',
    duration: 275,
    trackNumber: 3,
    spotifyId: 'track3'
  }
];

export const mockUser: User = {
  id: 'user1',
  email: 'user@bandruption.com',
  username: 'musiclover',
  avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  spotifyConnected: true,
  bio: 'Music enthusiast and NFT collector',
  favoriteGenres: ['Electronic', 'Jazz', 'Rock'],
  nftGallery: []
};

export const mockAlbums: Album[] = [
  {
    id: 'album1',
    name: 'Midnight Synth',
    artist: 'Neon Waves',
    imageUrl: 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=300',
    releaseDate: '2024-01-15',
    genre: 'Electronic',
    tracks: mockTracks,
    spotifyId: 'album1'
  },
  {
    id: 'album2',
    name: 'Urban Jazz',
    artist: 'City Collective',
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300',
    releaseDate: '2023-12-01',
    genre: 'Jazz',
    tracks: mockTracks,
    spotifyId: 'album2'
  },
  {
    id: 'album3',
    name: 'Digital Horizons',
    artist: 'Cyber Symphony',
    imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300',
    releaseDate: '2024-02-10',
    genre: 'Electronic',
    tracks: mockTracks,
    spotifyId: 'album3'
  },
  {
    id: 'album4',
    name: 'Acoustic Souls',
    artist: 'Mountain Echo',
    imageUrl: 'https://images.pexels.com/photos/1707820/pexels-photo-1707820.jpeg?auto=compress&cs=tinysrgb&w=300',
    releaseDate: '2023-11-20',
    genre: 'Folk',
    tracks: mockTracks,
    spotifyId: 'album4'
  },
  {
    id: 'album5',
    name: 'Retro Future',
    artist: 'Synth Masters',
    imageUrl: 'https://images.pexels.com/photos/1204649/pexels-photo-1204649.jpeg?auto=compress&cs=tinysrgb&w=300',
    releaseDate: '2024-01-05',
    genre: 'Synthwave',
    tracks: mockTracks,
    spotifyId: 'album5'
  },
  {
    id: 'album6',
    name: 'Ocean Depths',
    artist: 'Deep Blue',
    imageUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=300',
    releaseDate: '2023-10-15',
    genre: 'Ambient',
    tracks: mockTracks,
    spotifyId: 'album6'
  }
];

export const mockNFTs: NFT[] = [
  {
    id: 'nft1',
    name: 'Midnight Synth - Cyberpunk Edition',
    description: 'AI-generated cyberpunk interpretation of the iconic Midnight Synth album cover',
    imageUrl: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=300',
    originalAlbumArt: 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=300',
    price: 0.5,
    userId: 'user1',
    algorandId: 'algo1',
    createdAt: new Date('2024-01-20'),
    forSale: true
  },
  {
    id: 'nft2',
    name: 'Urban Jazz - Abstract Vision',
    description: 'Abstract AI interpretation of urban jazz vibes',
    imageUrl: 'https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg?auto=compress&cs=tinysrgb&w=300',
    originalAlbumArt: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300',
    price: 0.3,
    userId: 'user1',
    algorandId: 'algo2',
    createdAt: new Date('2024-01-18'),
    forSale: false
  }
];

export const mockDrafts: AIArtGeneration[] = [
  {
    id: 'draft1',
    sourceAlbumId: 'album3',
    prompt: 'Futuristic cityscape with neon lights and digital elements',
    style: 'cyberpunk',
    generatedImageUrl: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=300',
    status: 'completed',
    userId: 'user1',
    createdAt: new Date('2024-01-22'),
    needsApproval: true,
    artistApproved: false
  },
  {
    id: 'draft2',
    sourceAlbumId: 'album4',
    prompt: 'Vintage mountain landscape with warm tones',
    style: 'vintage',
    generatedImageUrl: 'https://images.pexels.com/photos/1450082/pexels-photo-1450082.jpeg?auto=compress&cs=tinysrgb&w=300',
    status: 'generating',
    userId: 'user1',
    createdAt: new Date('2024-01-23'),
    needsApproval: true,
    artistApproved: false
  }
]; 