import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { spotifyApi } from '../services/spotifyApi';

export function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [isPopup, setIsPopup] = React.useState(false);
  const processedCodeRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Check if this is running in a popup window
    const inPopup = window.opener && window.opener !== window;
    setIsPopup(inPopup);

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    const handleAuthResult = (result: { success: boolean; error?: string; userId?: string; accessToken?: string; userData?: unknown }) => {
      if (inPopup && window.opener) {
        // Send result to parent window
        window.opener.postMessage({
          type: result.success ? 'spotify-auth-success' : 'spotify-auth-error',
          ...result
        }, window.location.origin);
        
        // Close popup
        window.close();
      } else {
        // Regular redirect flow (fallback)
        if (result.success) {
          navigate('/search');
        } else {
          setTimeout(() => navigate('/search'), 3000);
        }
      }
    };

    if (error) {
      setError(`Spotify authorization failed: ${error}`);
      handleAuthResult({
        success: false,
        error: `Spotify authorization failed: ${error}`
      });
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
        .then((result) => {
          handleAuthResult(result);
        })
        .catch((err) => {
          console.error('Failed to exchange code for tokens:', err);
          const errorMsg = 'Failed to complete Spotify authentication';
          setError(errorMsg);
          handleAuthResult({
            success: false,
            error: errorMsg
          });
        });
    } else {
      const errorMsg = 'Invalid callback parameters';
      setError(errorMsg);
      handleAuthResult({
        success: false,
        error: errorMsg
      });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {error ? (
          <div className="text-red-500">
            <p className="text-xl mb-2">❌ {error}</p>
            {!isPopup && (
              <p className="text-gray-400">Redirecting back to search...</p>
            )}
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-xl mb-2">Connecting to Spotify...</p>
            {isPopup && (
              <p className="text-sm text-gray-400">This window will close automatically</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}