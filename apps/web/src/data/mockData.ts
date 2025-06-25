// Import shared types and data (mobile app takes precedence)
import { User, Album, Playlist, NFT, Track, mockTracks, mockUser, mockAlbums, mockNFTs, mockDrafts } from '@shared/types';

// Re-export shared mock data
export { mockTracks, mockUser, mockAlbums, mockNFTs, mockDrafts };

// Web-specific data that doesn't conflict with mobile data
export const mockPlaylists: Playlist[] = [
  {
    id: 'playlist-1',
    user_id: 'user1',
    title: 'Classic Rock Essentials', 
    description: 'The albums that defined rock music',
    is_public: true,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    cover_image: 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'playlist-2', 
    user_id: 'user1',
    title: 'Modern Vibes',
    description: 'Contemporary sounds across genres',
    is_public: false,
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  }
];