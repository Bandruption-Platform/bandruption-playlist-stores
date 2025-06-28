import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { spotifyApi } from '../services/spotifyApi';

export function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const processedCodeRef = React.useRef<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setError(`Spotify authorization failed: ${error}`);
      setTimeout(() => navigate('/search'), 3000);
      return;
    }

    if (code && state) {
      // Prevent processing the same code multiple times
      if (processedCodeRef.current === code) {
        return;
      }
      processedCodeRef.current = code;

      // Exchange the code for tokens
      spotifyApi.handleAuthCallback(code, state)
        .then(() => {
          // Redirect back to search page after successful auth
          navigate('/search');
        })
        .catch((err) => {
          console.error('Failed to exchange code for tokens:', err);
          setError('Failed to complete Spotify authentication');
          setTimeout(() => navigate('/search'), 3000);
        });
    } else {
      setError('Invalid callback parameters');
      setTimeout(() => navigate('/search'), 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-red-500">
            <p className="text-xl mb-2">❌ {error}</p>
            <p className="text-gray-400">Redirecting back to search...</p>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-xl">Connecting to Spotify...</p>
          </div>
        )}
      </div>
    </div>
  );
}