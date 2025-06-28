import { Router } from 'express';
import { spotifyService } from '../services/spotifyService';
import jwt from 'jsonwebtoken';

// Temporary in-memory storage for demo purposes
// In production, this should be stored in a database
const userTokens = new Map<string, { accessToken: string; refreshToken: string; userId?: string }>();

const router = Router();

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
      
      // Store tokens temporarily (in production, use database)
      userTokens.set(user.id, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        userId: user.id
      });
      
      res.json({ success: true, userId: user.id });
    } catch (spotifyError) {
      console.error('Spotify token exchange failed:', spotifyError);
      return res.status(400).json({ error: 'Failed to exchange authorization code' });
    }
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User routes
router.get('/me/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tokenData = userTokens.get(userId);
    
    if (!tokenData) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const user = await spotifyService.getCurrentUser(tokenData.accessToken);
    res.json(user);
  } catch (error) {
    console.error('Failed to get current user:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Search routes
router.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const results = await spotifyService.search(
      q as string, 
      (type as string).split(','),
      accessToken
    );
    
    res.json(results);
  } catch {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Content routes
router.get('/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const track = await spotifyService.getTrack(id, accessToken);
    res.json(track);
  } catch {
    res.status(500).json({ error: 'Failed to fetch track' });
  }
});

router.get('/album/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const album = await spotifyService.getAlbum(id, accessToken);
    res.json(album);
  } catch {
    res.status(500).json({ error: 'Failed to fetch album' });
  }
});

router.get('/artist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const artist = await spotifyService.getArtist(id, accessToken);
    res.json(artist);
  } catch {
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

router.get('/artist/:id/albums', async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const albums = await spotifyService.getArtistAlbums(id, accessToken);
    res.json(albums);
  } catch {
    res.status(500).json({ error: 'Failed to fetch artist albums' });
  }
});

export default router;