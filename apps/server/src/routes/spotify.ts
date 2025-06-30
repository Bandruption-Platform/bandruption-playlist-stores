import { Router } from 'express';
import { spotifyService } from '../services/spotifyService.js';
import { supabase } from '@shared/supabase';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware to get Supabase user from Authorization header
const getSupabaseUser = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Helper function to get Spotify tokens for a Supabase user
// Supports both primary Spotify auth and linked Spotify accounts
const getSpotifyTokensForUser = async (supabaseUser: any) => {
  // Check if user authenticated with Spotify as primary method
  const spotifyIdentity = supabaseUser.identities?.find(
    (identity: any) => identity.provider === 'spotify'
  );
  
  if (spotifyIdentity) {
    // User authenticated with Spotify as primary - get tokens from Supabase session
    // For now, we'll use the linked token approach until Supabase provides session tokens
    // This is a temporary implementation that will be enhanced once we have proper
    // access to Supabase OAuth tokens for primary authentication
    console.log('User authenticated with Spotify as primary, falling back to linked tokens');
  }
  
  // Get tokens from custom spotify_tokens table (works for both linked and primary scenarios)
  const { data, error } = await supabase
    .from('spotify_tokens')
    .select('*')
    .eq('user_id', supabaseUser.id)
    .single();

  if (error || !data) {
    throw new Error('Spotify account not linked');
  }

  // Check if token is expired
  const expiresAt = new Date(data.expires_at);
  const now = new Date();
  
  if (expiresAt <= now) {
    // Token expired, attempt to refresh
    if (data.refresh_token) {
      try {
        const refreshedTokens = await spotifyService.refreshAccessToken(data.refresh_token);
        
        // Update database with new tokens
        const { error: updateError } = await supabase
          .from('spotify_tokens')
          .update({
            access_token: refreshedTokens.access_token,
            expires_at: new Date(Date.now() + (refreshedTokens.expires_in * 1000)).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', supabaseUser.id);

        if (updateError) {
          throw new Error('Failed to update refreshed tokens');
        }

        return {
          access_token: refreshedTokens.access_token,
          refresh_token: data.refresh_token,
          spotify_user_id: (data as any).spotify_user_id
        };
      } catch {
        throw new Error('Failed to refresh Spotify token');
      }
    } else {
      throw new Error('Spotify token expired and no refresh token available');
    }
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    spotify_user_id: (data as any).spotify_user_id
  };
};

// Public routes (no authentication required)
router.get('/public/search', async (req, res) => {
  try {
    const { q, type = 'track,album,artist' } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const types = typeof type === 'string' ? type.split(',') : ['track', 'album', 'artist'];
    const results = await spotifyService.publicSearch(q, types);
    
    res.json(results);
  } catch (error) {
    console.error('Public search failed:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/public/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const track = await spotifyService.getPublicTrack(id);
    res.json(track);
  } catch (error) {
    console.error('Failed to fetch track:', error);
    res.status(500).json({ error: 'Failed to fetch track' });
  }
});

router.get('/public/album/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const album = await spotifyService.getPublicAlbum(id);
    res.json(album);
  } catch (error) {
    console.error('Failed to fetch album:', error);
    res.status(500).json({ error: 'Failed to fetch album' });
  }
});

router.get('/public/artist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await spotifyService.getPublicArtist(id);
    res.json(artist);
  } catch (error) {
    console.error('Failed to fetch artist:', error);
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

router.get('/public/artist/:id/albums', async (req, res) => {
  try {
    const { id } = req.params;
    const albums = await spotifyService.getPublicArtistAlbums(id);
    res.json(albums);
  } catch (error) {
    console.error('Failed to fetch artist albums:', error);
    res.status(500).json({ error: 'Failed to fetch artist albums' });
  }
});

// Authentication routes
router.get('/auth/login', async (req, res) => {
  try {
    const state = jwt.sign({ timestamp: Date.now() }, process.env.JWT_SECRET!);
    const authUrl = await spotifyService.getAuthUrl(state);
    res.json({ authUrl });
  } catch {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

router.post('/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    // Check if required parameters exist
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }
    
    // Verify state parameter
    try {
      jwt.verify(state, process.env.JWT_SECRET!);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(400).json({ error: 'Invalid state parameter' });
    }
    
    // Exchange code for tokens
    try {
      const tokens = await spotifyService.exchangeCodeForTokens(code);
      
      // Get user info to get their Spotify user ID
      const user = await spotifyService.getCurrentUser(tokens.access_token);
      
      // Return complete auth data for popup (tokens will be stored by frontend)
      res.json({ 
        success: true, 
        userId: user.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        userData: user
      });
    } catch (spotifyError) {
      console.error('Spotify token exchange failed:', spotifyError);
      return res.status(400).json({ error: 'Failed to exchange authorization code' });
    }
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New endpoint to get tokens for primary Spotify auth users
router.get('/tokens', getSupabaseUser, async (req: any, res) => {
  try {
    const tokens = await getSpotifyTokensForUser(req.user);
    const user = await spotifyService.getCurrentUser(tokens.access_token);
    res.json({ 
      access_token: tokens.access_token,
      user_data: user
    });
  } catch (error) {
    console.error('Failed to get Spotify tokens:', error);
    res.status(500).json({ error: 'Failed to get Spotify tokens' });
  }
});

// User routes (require Supabase authentication)
router.get('/me', getSupabaseUser, async (req: any, res) => {
  try {
    const tokens = await getSpotifyTokensForUser(req.user);
    const user = await spotifyService.getCurrentUser(tokens.access_token);
    res.json(user);
  } catch (error) {
    console.error('Failed to get current user:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Route to check if user has linked Spotify
router.get('/link-status', getSupabaseUser, async (req: any, res) => {
  try {
    await getSpotifyTokensForUser(req.user);
    res.json({ linked: true });
  } catch {
    res.json({ linked: false });
  }
});

// Search routes (require Supabase authentication and Spotify linking)
router.get('/search', getSupabaseUser, async (req: any, res) => {
  try {
    const { q, type } = req.query;
    const tokens = await getSpotifyTokensForUser(req.user);
    
    const results = await spotifyService.search(
      q as string, 
      (type as string).split(','),
      tokens.access_token
    );
    
    res.json(results);
  } catch (error) {
    console.error('Search failed:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Content routes (require Supabase authentication and Spotify linking)
router.get('/track/:id', getSupabaseUser, async (req: any, res) => {
  try {
    const { id } = req.params;
    const tokens = await getSpotifyTokensForUser(req.user);
    const track = await spotifyService.getTrack(id, tokens.access_token);
    res.json(track);
  } catch (error) {
    console.error('Failed to fetch track:', error);
    res.status(500).json({ error: 'Failed to fetch track' });
  }
});

router.get('/album/:id', getSupabaseUser, async (req: any, res) => {
  try {
    const { id } = req.params;
    const tokens = await getSpotifyTokensForUser(req.user);
    const album = await spotifyService.getAlbum(id, tokens.access_token);
    res.json(album);
  } catch (error) {
    console.error('Failed to fetch album:', error);
    res.status(500).json({ error: 'Failed to fetch album' });
  }
});

router.get('/artist/:id', getSupabaseUser, async (req: any, res) => {
  try {
    const { id } = req.params;
    const tokens = await getSpotifyTokensForUser(req.user);
    const artist = await spotifyService.getArtist(id, tokens.access_token);
    res.json(artist);
  } catch (error) {
    console.error('Failed to fetch artist:', error);
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

router.get('/artist/:id/albums', getSupabaseUser, async (req: any, res) => {
  try {
    const { id } = req.params;
    const tokens = await getSpotifyTokensForUser(req.user);
    const albums = await spotifyService.getArtistAlbums(id, tokens.access_token);
    res.json(albums);
  } catch (error) {
    console.error('Failed to fetch artist albums:', error);
    res.status(500).json({ error: 'Failed to fetch artist albums' });
  }
});

export default router;