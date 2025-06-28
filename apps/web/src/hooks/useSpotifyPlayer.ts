import { useState, useEffect, useCallback } from 'react';
import { spotifyPlayer } from '../services/spotifyPlayer';

export const useSpotifyPlayer = (accessToken: string | null, isPremium: boolean) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (accessToken && isPremium) {
      initializePlayer();
    }

    return () => {
      spotifyPlayer.disconnect();
    };
  }, [accessToken, isPremium]);

  const initializePlayer = async () => {
    try {
      spotifyPlayer.onPlayerReady = (deviceId) => {
        console.log('Player ready with device ID:', deviceId);
        setIsPlayerReady(true);
      };

      spotifyPlayer.onPlayerNotReady = (deviceId) => {
        console.log('Player not ready:', deviceId);
        setIsPlayerReady(false);
      };

      spotifyPlayer.onStateChanged = (state) => {
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
      };

      await spotifyPlayer.initialize(accessToken!);
    } catch (error) {
      console.error('Failed to initialize player:', error);
    }
  };

  const playTrack = useCallback(async (spotifyUri: string) => {
    if (!isPlayerReady) throw new Error('Player not ready');
    await spotifyPlayer.playTrack(spotifyUri);
  }, [isPlayerReady]);

  const playPlaylist = useCallback(async (playlistUri: string, startIndex: number = 0) => {
    if (!isPlayerReady) throw new Error('Player not ready');
    await spotifyPlayer.playPlaylist(playlistUri, startIndex);
  }, [isPlayerReady]);

  const pause = useCallback(async () => {
    await spotifyPlayer.pause();
  }, []);

  const resume = useCallback(async () => {
    await spotifyPlayer.resume();
  }, []);

  const nextTrack = useCallback(async () => {
    await spotifyPlayer.nextTrack();
  }, []);

  const previousTrack = useCallback(async () => {
    await spotifyPlayer.previousTrack();
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    await spotifyPlayer.seek(positionMs);
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    await spotifyPlayer.setVolume(volume);
  }, []);

  return {
    isPlayerReady,
    currentTrack,
    isPlaying,
    position,
    duration,
    playTrack,
    playPlaylist,
    pause,
    resume,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    canUsePlayer: isPremium && isPlayerReady
  };
};