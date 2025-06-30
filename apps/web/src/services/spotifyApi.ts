import { SpotifySearchResults, SpotifyTrack, SpotifyAlbum, SpotifyArtist, SpotifyUser } from '@shared/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SpotifyApiService {
  // Public endpoints (no auth required)
  async searchPublic(query: string, types: string = 'track,album,artist'): Promise<SpotifySearchResults> {
    const response = await fetch(`${API_BASE}/api/spotify/public/search?q=${encodeURIComponent(query)}&type=${types}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }

  async getTrackPublic(trackId: string): Promise<SpotifyTrack> {
    const response = await fetch(`${API_BASE}/api/spotify/public/track/${trackId}`);
    if (!response.ok) throw new Error('Failed to fetch track');
    return response.json();
  }

  async getAlbumPublic(albumId: string): Promise<SpotifyAlbum> {
    const response = await fetch(`${API_BASE}/api/spotify/public/album/${albumId}`);
    if (!response.ok) throw new Error('Failed to fetch album');
    return response.json();
  }

  async getArtistPublic(artistId: string): Promise<SpotifyArtist> {
    const response = await fetch(`${API_BASE}/api/spotify/public/artist/${artistId}`);
    if (!response.ok) throw new Error('Failed to fetch artist');
    return response.json();
  }

  async getArtistAlbumsPublic(artistId: string): Promise<SpotifyAlbum[]> {
    const response = await fetch(`${API_BASE}/api/spotify/public/artist/${artistId}/albums`);
    if (!response.ok) throw new Error('Failed to fetch artist albums');
    return response.json();
  }

  // Authentication endpoints
  async getAuthUrl(): Promise<{ authUrl: string }> {
    const response = await fetch(`${API_BASE}/api/spotify/auth/login`);
    if (!response.ok) throw new Error('Failed to get auth URL');
    return response.json();
  }

  async handleAuthCallback(code: string, state: string): Promise<{ success: boolean; userId: string; accessToken?: string; userData?: SpotifyUser }> {
    const response = await fetch(`${API_BASE}/api/spotify/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state })
    });
    if (!response.ok) throw new Error('Auth callback failed');
    const result = await response.json();
    
    return result;
  }

  // Authenticated endpoints (with user token)
  async searchAuthenticated(query: string, token: string, types: string = 'track,album,artist'): Promise<SpotifySearchResults> {
    const response = await fetch(`${API_BASE}/api/spotify/search?q=${encodeURIComponent(query)}&type=${types}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Authenticated search failed');
    return response.json();
  }

  async getTrackAuthenticated(trackId: string, token: string): Promise<SpotifyTrack> {
    const response = await fetch(`${API_BASE}/api/spotify/track/${trackId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch track');
    return response.json();
  }

  async getUserProfile(userId: string, token: string): Promise<SpotifyUser> {
    const response = await fetch(`${API_BASE}/api/spotify/me/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  }

  // Legacy compatibility methods
  async getCurrentUser() {
    const userId = localStorage.getItem('spotify_user_id');
    if (!userId) throw new Error('No user ID found');
    
    const response = await fetch(`${API_BASE}/api/spotify/me/${userId}`);
    if (!response.ok) throw new Error('Failed to get user profile');
    return response.json();
  }

  isConnected(): boolean {
    return localStorage.getItem('spotify_connected') === 'true';
  }

  disconnect(): void {
    localStorage.removeItem('spotify_connected');
    localStorage.removeItem('spotify_user_id');
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_user');
    
    window.dispatchEvent(new CustomEvent('spotify-auth-changed'));
  }
}

export const spotifyApi = new SpotifyApiService();