import SpotifyWebApi from 'spotify-web-api-node';
import { SpotifyAuth, SpotifySearchResults, SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '@shared/types';

class SpotifyService {
  private spotify: SpotifyWebApi;

  constructor() {
    this.spotify = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });
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

  async search(query: string, types: any[], accessToken: string): Promise<SpotifySearchResults> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.search(query, types as any);
    return data.body as SpotifySearchResults;
  }

  async getTrack(trackId: string, accessToken: string): Promise<SpotifyTrack> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getTrack(trackId);
    return data.body as any;
  }

  async getAlbum(albumId: string, accessToken: string): Promise<SpotifyAlbum> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getAlbum(albumId);
    return data.body as any;
  }

  async getArtist(artistId: string, accessToken: string): Promise<SpotifyArtist> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getArtist(artistId);
    return data.body as any;
  }

  async getArtistAlbums(artistId: string, accessToken: string): Promise<SpotifyAlbum[]> {
    this.spotify.setAccessToken(accessToken);
    const data = await this.spotify.getArtistAlbums(artistId, { limit: 50 });
    return data.body.items as any[];
  }
}

export const spotifyService = new SpotifyService();