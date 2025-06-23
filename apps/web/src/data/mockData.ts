import { User, Album, Playlist, NFT, Track } from '../types';

export const mockTracks: Track[] = [
  { id: 'track-1', name: 'Bohemian Rhapsody', duration: 355, trackNumber: 1, lyrics: 'Is this the real life? Is this just fantasy...' },
  { id: 'track-2', name: 'Love of My Life', duration: 217, trackNumber: 2 },
  { id: 'track-3', name: 'Good Old-Fashioned Lover Boy', duration: 173, trackNumber: 3 },
];

export const mockAlbums: Album[] = [
  {
    id: 'album-1',
    name: 'A Night at the Opera',
    artist: 'Queen',
    imageUrl: 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=400',
    releaseDate: '1975-11-21',
    genre: 'Rock',
    tracks: mockTracks,
    spotifyId: 'spotify-1'
  },
  {
    id: 'album-2',
    name: 'Dark Side of the Moon',
    artist: 'Pink Floyd',
    imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
    releaseDate: '1973-03-01',
    genre: 'Progressive Rock',
    tracks: [
      { id: 'track-4', name: 'Speak to Me', duration: 90, trackNumber: 1 },
      { id: 'track-5', name: 'Breathe', duration: 163, trackNumber: 2 },
      { id: 'track-6', name: 'On the Run', duration: 216, trackNumber: 3 },
    ]
  },
  {
    id: 'album-3',
    name: 'Nevermind',
    artist: 'Nirvana',
    imageUrl: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=400',
    releaseDate: '1991-09-24',
    genre: 'Grunge',
    tracks: [
      { id: 'track-7', name: 'Smells Like Teen Spirit', duration: 301, trackNumber: 1 },
      { id: 'track-8', name: 'In Bloom', duration: 254, trackNumber: 2 },
    ]
  },
  {
    id: 'album-4',
    name: 'OK Computer',
    artist: 'Radiohead',
    imageUrl: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=400',
    releaseDate: '1997-06-16',
    genre: 'Alternative Rock',
    tracks: [
      { id: 'track-9', name: 'Paranoid Android', duration: 383, trackNumber: 1 },
      { id: 'track-10', name: 'Subterranean Homesick Alien', duration: 267, trackNumber: 2 },
    ]
  },
  {
    id: 'album-5',
    name: 'The Chronic',
    artist: 'Dr. Dre',
    imageUrl: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400',
    releaseDate: '1992-12-15',
    genre: 'Hip Hop',
    tracks: [
      { id: 'track-11', name: 'Nuthin\' But a \'G\' Thang', duration: 238, trackNumber: 1 },
      { id: 'track-12', name: 'Let Me Ride', duration: 263, trackNumber: 2 },
    ]
  },
  {
    id: 'album-6',
    name: 'Kind of Blue',
    artist: 'Miles Davis',
    imageUrl: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=400',
    releaseDate: '1959-08-17',
    genre: 'Jazz',
    tracks: [
      { id: 'track-13', name: 'So What', duration: 562, trackNumber: 1 },
      { id: 'track-14', name: 'Freddie Freeloader', duration: 578, trackNumber: 2 },
    ]
  },
  {
    id: 'album-7',
    name: 'Random Access Memories',
    artist: 'Daft Punk',
    imageUrl: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=400',
    releaseDate: '2013-05-17',
    genre: 'Electronic',
    tracks: [
      { id: 'track-15', name: 'Get Lucky', duration: 367, trackNumber: 1 },
      { id: 'track-16', name: 'Instant Crush', duration: 337, trackNumber: 2 },
    ]
  },
  {
    id: 'album-8',
    name: 'Blonde',
    artist: 'Frank Ocean',
    imageUrl: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=400',
    releaseDate: '2016-08-20',
    genre: 'R&B',
    tracks: [
      { id: 'track-17', name: 'Nikes', duration: 314, trackNumber: 1 },
      { id: 'track-18', name: 'Ivy', duration: 249, trackNumber: 2 },
    ]
  }
];

export const mockNFTs: NFT[] = [
  {
    id: 'nft-1',
    name: 'Psychedelic Queen',
    description: 'AI-generated art inspired by Queen\'s A Night at the Opera',
    imageUrl: 'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalAlbumArt: mockAlbums[0].imageUrl,
    price: 0.5,
    userId: 'user-1',
    createdAt: new Date('2024-01-15'),
    forSale: true
  },
  {
    id: 'nft-2',
    name: 'Neon Floyd',
    description: 'Cyberpunk reimagining of Pink Floyd\'s iconic prism',
    imageUrl: 'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=400',
    originalAlbumArt: mockAlbums[1].imageUrl,
    price: 0.75,
    userId: 'user-2',
    createdAt: new Date('2024-01-20'),
    forSale: true
  }
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'musiclover92',
    email: 'demo@example.com',
    profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    spotifyConnected: true,
    bio: 'Passionate about discovering hidden gems and creating visual mixtapes',
    favoriteGenres: ['Rock', 'Electronic', 'Jazz'],
    nftGallery: [mockNFTs[0]],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'user-2',
    username: 'vinylcollector',
    email: 'collector@example.com',
    spotifyConnected: false,
    favoriteGenres: ['Progressive Rock', 'Hip Hop'],
    nftGallery: [mockNFTs[1]],
    createdAt: new Date('2024-01-05')
  }
];

export const mockPlaylists: Playlist[] = [
  {
    id: 'playlist-1',
    name: 'Classic Rock Essentials',
    description: 'The albums that defined rock music',
    userId: 'user-1',
    albums: [mockAlbums[0], mockAlbums[1], mockAlbums[2]],
    isPublic: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    coverImage: mockAlbums[0].imageUrl
  },
  {
    id: 'playlist-2',
    name: 'Modern Vibes',
    description: 'Contemporary sounds across genres',
    userId: 'user-1',
    albums: [mockAlbums[6], mockAlbums[7]],
    isPublic: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
];