-- Spotify Integration Schema Extensions
-- This migration adds Spotify-specific fields and tables to the existing schema

-- Add Spotify integration fields to existing users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS spotify_connected BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS spotify_user_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS spotify_display_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS spotify_image_url TEXT;

-- Create spotify_tokens table for OAuth management
CREATE TABLE IF NOT EXISTS public.spotify_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend tracks table for richer Spotify metadata
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS album_name TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS album_image_url TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS preview_url TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS artist_id TEXT;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS album_id TEXT;

-- Create spotify_cache table for performance
CREATE TABLE IF NOT EXISTS public.spotify_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_spotify_tokens_user_id ON public.spotify_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_cache_key ON public.spotify_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_tracks_spotify_id ON public.tracks(spotify_id);

-- RLS policies for new tables
ALTER TABLE public.spotify_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own spotify tokens" ON public.spotify_tokens
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Cache is publicly readable" ON public.spotify_cache
    FOR SELECT USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for spotify_tokens updated_at
CREATE TRIGGER update_spotify_tokens_updated_at BEFORE UPDATE ON public.spotify_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();