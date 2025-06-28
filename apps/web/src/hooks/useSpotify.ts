import { useContext } from 'react';
import { SpotifyContext } from '../contexts/SpotifyContext';

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within SpotifyProvider');
  }
  return context;
};