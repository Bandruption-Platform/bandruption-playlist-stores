import { User, Album, NFT, AIArtGeneration, Track } from '../types';

// Mobile app specific types for mock data
interface PlaylistItem {
  id: string;
  trackId: string;
  albumId: string;
  addedAt: Date;
  addedBy: string;
}

interface MobilePlaylist {
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

export const mockTracks: Track[] = [
  // Midnight Synth tracks
  {
    id: 'track1',
    name: 'Opening Theme',
    duration: 240,
    trackNumber: 1,
    spotifyId: 'track1'
  },
  {
    id: 'track2',
    name: 'Digital Dreams',
    duration: 195,
    trackNumber: 2,
    spotifyId: 'track2'
  },
  {
    id: 'track3',
    name: 'Neon Nights',
    duration: 275,
    trackNumber: 3,
    spotifyId: 'track3'
  },
  // Urban Jazz tracks
  {
    id: 'track4',
    name: 'City Lights',
    duration: 220,
    trackNumber: 1,
    spotifyId: 'track4'
  },
  {
    id: 'track5',
    name: 'Midnight Groove',
    duration: 185,
    trackNumber: 2,
    spotifyId: 'track5'
  },
  {
    id: 'track6',
    name: 'Urban Flow',
    duration: 260,
    trackNumber: 3,
    spotifyId: 'track6'
  },
  // Digital Horizons tracks
  {
    id: 'track7',
    name: 'Cyber Dawn',
    duration: 210,
    trackNumber: 1,
    spotifyId: 'track7'
  },
  {
    id: 'track8',
    name: 'Virtual Reality',
    duration: 245,
    trackNumber: 2,
    spotifyId: 'track8'
  },
  {
    id: 'track9',
    name: 'Data Stream',
    duration: 190,
    trackNumber: 3,
    spotifyId: 'track9'
  },
  // Acoustic Souls tracks
  {
    id: 'track10',
    name: 'Mountain Echo',
    duration: 280,
    trackNumber: 1,
    spotifyId: 'track10'
  },
  {
    id: 'track11',
    name: 'Forest Whispers',
    duration: 225,
    trackNumber: 2,
    spotifyId: 'track11'
  },
  {
    id: 'track12',
    name: 'River Song',
    duration: 195,
    trackNumber: 3,
    spotifyId: 'track12'
  },
  // Retro Future tracks
  {
    id: 'track13',
    name: 'Synthwave Sunset',
    duration: 255,
    trackNumber: 1,
    spotifyId: 'track13'
  },
  {
    id: 'track14',
    name: 'Neon Highway',
    duration: 230,
    trackNumber: 2,
    spotifyId: 'track14'
  },
  {
    id: 'track15',
    name: 'Chrome Dreams',
    duration: 270,
    trackNumber: 3,
    spotifyId: 'track15'
  },
  // Ocean Depths tracks
  {
    id: 'track16',
    name: 'Deep Current',
    duration: 320,
    trackNumber: 1,
    spotifyId: 'track16'
  },
  {
    id: 'track17',
    name: 'Coral Gardens',
    duration: 290,
    trackNumber: 2,
    spotifyId: 'track17'
  },
  {
    id: 'track18',
    name: 'Abyssal Peace',
    duration: 350,
    trackNumber: 3,
    spotifyId: 'track18'
  }
];

export const mockUser: User = {
  id: 'user1',
  email: 'user@bandruption.com',
  username: 'musiclover',
  avatar_url: 'https://bandruption.com/wp-content/uploads/2025/01/Bandruption-Purple-Record.png',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  profileImage: 'https://bandruption.com/wp-content/uploads/2025/01/Bandruption-Purple-Record.png',
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

export const mockPlaylists: Playlist[] = [
  {
    id: 'playlist1',
    name: 'Electronic Vibes',
    description: 'The best electronic tracks for late night coding sessions',
    imageUrl: 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=300',
    userId: 'user1',
    isPublic: true,
    items: [
      {
        id: 'item1',
        trackId: 'track1',
        albumId: 'album1',
        addedAt: new Date('2024-01-20'),
        addedBy: 'user1'
      },
      {
        id: 'item2',
        trackId: 'track2',
        albumId: 'album1',
        addedAt: new Date('2024-01-20'),
        addedBy: 'user1'
      },
      {
        id: 'item3',
        trackId: 'track7',
        albumId: 'album3',
        addedAt: new Date('2024-01-21'),
        addedBy: 'user1'
      },
      {
        id: 'item4',
        trackId: 'track8',
        albumId: 'album3',
        addedAt: new Date('2024-01-21'),
        addedBy: 'user1'
      },
      {
        id: 'item5',
        trackId: 'track13',
        albumId: 'album5',
        addedAt: new Date('2024-01-22'),
        addedBy: 'user1'
      }
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'playlist2',
    name: 'Chill Jazz Sessions',
    description: 'Smooth jazz for relaxing evenings',
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300',
    userId: 'user1',
    isPublic: false,
    items: [
      {
        id: 'item6',
        trackId: 'track4',
        albumId: 'album2',
        addedAt: new Date('2024-01-18'),
        addedBy: 'user1'
      },
      {
        id: 'item7',
        trackId: 'track5',
        albumId: 'album2',
        addedAt: new Date('2024-01-18'),
        addedBy: 'user1'
      },
      {
        id: 'item8',
        trackId: 'track6',
        albumId: 'album2',
        addedAt: new Date('2024-01-18'),
        addedBy: 'user1'
      }
    ],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'playlist3',
    name: 'Nature Sounds',
    description: 'Acoustic and ambient tracks inspired by nature',
    imageUrl: 'https://images.pexels.com/photos/1707820/pexels-photo-1707820.jpeg?auto=compress&cs=tinysrgb&w=300',
    userId: 'user1',
    isPublic: true,
    items: [
      {
        id: 'item9',
        trackId: 'track10',
        albumId: 'album4',
        addedAt: new Date('2024-01-15'),
        addedBy: 'user1'
      },
      {
        id: 'item10',
        trackId: 'track11',
        albumId: 'album4',
        addedAt: new Date('2024-01-15'),
        addedBy: 'user1'
      },
      {
        id: 'item11',
        trackId: 'track16',
        albumId: 'album6',
        addedAt: new Date('2024-01-16'),
        addedBy: 'user1'
      },
      {
        id: 'item12',
        trackId: 'track17',
        albumId: 'album6',
        addedAt: new Date('2024-01-16'),
        addedBy: 'user1'
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'playlist4',
    name: 'Synthwave Dreams',
    description: 'Retro-futuristic synthwave collection',
    imageUrl: 'https://images.pexels.com/photos/1204649/pexels-photo-1204649.jpeg?auto=compress&cs=tinysrgb&w=300',
    userId: 'user1',
    isPublic: true,
    items: [
      {
        id: 'item13',
        trackId: 'track13',
        albumId: 'album5',
        addedAt: new Date('2024-01-10'),
        addedBy: 'user1'
      },
      {
        id: 'item14',
        trackId: 'track14',
        albumId: 'album5',
        addedAt: new Date('2024-01-10'),
        addedBy: 'user1'
      },
      {
        id: 'item15',
        trackId: 'track15',
        albumId: 'album5',
        addedAt: new Date('2024-01-10'),
        addedBy: 'user1'
      },
      {
        id: 'item16',
        trackId: 'track3',
        albumId: 'album1',
        addedAt: new Date('2024-01-11'),
        addedBy: 'user1'
      }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-11')
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