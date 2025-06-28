import { useState } from 'react';
import { spotifyApi } from '../services/spotifyApi';
import { SpotifySearchResults } from '@shared/types';

export const useSpotifySearch = (accessToken?: string) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('track,album,artist');
  const [results, setResults] = useState<SpotifySearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (newQuery?: string) => {
    const searchQuery = newQuery || query;
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = accessToken 
        ? await spotifyApi.searchAuthenticated(searchQuery, accessToken, searchType)
        : await spotifyApi.searchPublic(searchQuery, searchType);
      
      setResults(searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    query,
    results,
    isLoading,
    error,
    search,
    updateQuery,
    searchType,
    setSearchType,
    clearResults
  };
};