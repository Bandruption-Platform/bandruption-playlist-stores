-- Add spotify_user_id field to spotify_tokens table
-- This field stores the Spotify user ID from the Spotify API

ALTER TABLE public.spotify_tokens ADD COLUMN IF NOT EXISTS spotify_user_id TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_spotify_tokens_spotify_user_id ON public.spotify_tokens(spotify_user_id);