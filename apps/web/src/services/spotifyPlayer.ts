class SpotifyPlayerService {
  private player: Spotify.Player | null = null;
  private deviceId: string | null = null;
  private accessToken: string | null = null;

  async initialize(accessToken: string): Promise<void> {
    this.accessToken = accessToken;
    
    if (!window.Spotify) {
      await this.loadSDK();
    }

    this.player = new window.Spotify.Player({
      name: 'Bandruption Web Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken);
      },
      volume: 0.8,
    });

    this.setupEventListeners();
    
    await this.player.connect();
  }

  private setupEventListeners(): void {
    if (!this.player) return;

    this.player.addListener('ready', ({ device_id }) => {
      console.log('Spotify Player Ready with Device ID:', device_id);
      this.deviceId = device_id;
      this.onPlayerReady?.(device_id);
    });

    this.player.addListener('not_ready', ({ device_id }) => {
      console.log('Spotify Player Not Ready:', device_id);
      this.onPlayerNotReady?.(device_id);
    });

    this.player.addListener('player_state_changed', (state) => {
      if (!state) return;
      this.onStateChanged?.(state);
    });

    this.player.addListener('initialization_error', ({ message }) => {
      console.error('Spotify Player Initialization Error:', message);
    });

    this.player.addListener('authentication_error', ({ message }) => {
      console.error('Spotify Player Authentication Error:', message);
    });

    this.player.addListener('account_error', ({ message }) => {
      console.error('Spotify Player Account Error:', message);
    });
  }

  async playTrack(spotifyUri: string): Promise<void> {
    if (!this.deviceId || !this.accessToken) {
      throw new Error('Player not ready');
    }

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [spotifyUri] }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
  }

  async playPlaylist(playlistUri: string, startIndex: number = 0): Promise<void> {
    if (!this.deviceId || !this.accessToken) {
      throw new Error('Player not ready');
    }

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        context_uri: playlistUri,
        offset: { position: startIndex }
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
  }

  async pause(): Promise<void> { await this.player?.pause(); }
  async resume(): Promise<void> { await this.player?.resume(); }
  async nextTrack(): Promise<void> { await this.player?.nextTrack(); }
  async previousTrack(): Promise<void> { await this.player?.previousTrack(); }
  async seek(positionMs: number): Promise<void> { await this.player?.seek(positionMs); }
  async setVolume(volume: number): Promise<void> { await this.player?.setVolume(volume); }

  async getCurrentState(): Promise<Spotify.PlaybackState | null> {
    return this.player?.getCurrentState() || null;
  }

  disconnect(): void {
    this.player?.disconnect();
    this.player = null;
    this.deviceId = null;
    this.accessToken = null;
  }

  onPlayerReady?: (deviceId: string) => void;
  onPlayerNotReady?: (deviceId: string) => void;
  onStateChanged?: (state: Spotify.PlaybackState) => void;

  private async loadSDK(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        resolve();
      };
    });
  }
}

export const spotifyPlayer = new SpotifyPlayerService();