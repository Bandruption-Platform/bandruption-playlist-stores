import SpotifyWebApi from 'spotify-web-api-node';
import { SpotifyAuth, SpotifySearchResults, SpotifyTrack, SpotifyAlbum, SpotifyArtist, SpotifyUser } from '@shared/types';

class SpotifyService {
  private spotify: SpotifyWebApi;
  private clientCredentialsToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.spotify = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });
  }

  async getClientCredentialsToken(): Promise<string> {
    const now = Date.now();
    
    // Check if we have a valid token
    if (this.clientCredentialsToken && now < this.tokenExpiresAt) {
      return this.clientCredentialsToken;
    }

    try {
      const data = await this.spotify.clientCredentialsGrant();
      this.clientCredentialsToken = data.body.access_token;
      this.tokenExpiresAt = now + (data.body.expires_in * 1000) - 60000; // Refresh 1 minute early
      
      return this.clientCredentialsToken;
    } catch (error) {
      console.error('Failed to get client credentials token:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  async getAuthUrl(state: string): Promise<string> {
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private'
    ];
    
    return this.spotify.createAuthorizeURL(scopes, state);
  }

  async exchangeCodeForTokens(code: string): Promise<SpotifyAuth> {
    const data = await this.spotify.authorizationCodeGrant(code);
    return {
      access_token: data.body.access_token,
      refresh_token: data.body.refresh_token,
      expires_in: data.body.expires_in,
      token_type: data.body.token_type,
      scope: data.body.scope,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<SpotifyAuth> {
    this.spotify.setRefreshToken(refreshToken);
    const data = await this.spotify.refreshAccessToken();
    return {
      access_token: data.body.access_token,
      refresh_token: refreshToken, // Keep existing refresh token
      expires_in: data.body.expires_in,
      token_type: data.body.token_type,
      scope: data.body.scope || '',
    };
  }

  async search(query: string, types: string[], accessToken: string): Promise<SpotifySearchResults> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.search(query, types as any);
    return data.body as SpotifySearchResults;
  }

  async publicSearch(query: string, types: string[] = ['track', 'album', 'artist']): Promise<SpotifySearchResults> {
    const token = await this.getClientCredentialsToken();
    this.spotify.setAccessToken(token);
    const data = await this.spotify.search(query, types as any);
    return data.body as SpotifySearchResults;
  }

  async getTrack(trackId: string, accessToken: string): Promise<SpotifyTrack> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getTrack(trackId);
    return data.body as SpotifyTrack;
  }

  async getAlbum(albumId: string, accessToken: string): Promise<SpotifyAlbum> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getAlbum(albumId);
    return data.body as unknown as SpotifyAlbum;
  }

  async getArtist(artistId: string, accessToken: string): Promise<SpotifyArtist> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getArtist(artistId);
    return data.body as SpotifyArtist;
  }

  async getArtistAlbums(artistId: string, accessToken: string): Promise<SpotifyAlbum[]> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getArtistAlbums(artistId, { limit: 50 });
    return data.body.items as unknown as SpotifyAlbum[];
  }

  async getPublicTrack(trackId: string): Promise<SpotifyTrack> {
    const token = await this.getClientCredentialsToken();
    this.spotify.setAccessToken(token);
    const data = await this.spotify.getTrack(trackId);
    return data.body as SpotifyTrack;
  }

  async getPublicAlbum(albumId: string): Promise<SpotifyAlbum> {
    const token = await this.getClientCredentialsToken();
    this.spotify.setAccessToken(token);
    const data = await this.spotify.getAlbum(albumId);
    return data.body as unknown as SpotifyAlbum;
  }

  async getPublicArtist(artistId: string): Promise<SpotifyArtist> {
    const token = await this.getClientCredentialsToken();
    this.spotify.setAccessToken(token);
    const data = await this.spotify.getArtist(artistId);
    return data.body as SpotifyArtist;
  }

  async getPublicArtistAlbums(artistId: string): Promise<SpotifyAlbum[]> {
    const token = await this.getClientCredentialsToken();
    this.spotify.setAccessToken(token);
    const data = await this.spotify.getArtistAlbums(artistId, { limit: 50 });
    return data.body.items as unknown as SpotifyAlbum[];
  }

  async getCurrentUser(accessToken: string): Promise<SpotifyUser> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getMe();
    return data.body as SpotifyUser;
  }
}

export const spotifyService = new SpotifyService();