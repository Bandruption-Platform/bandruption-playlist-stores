import { Router } from 'express';
import { spotifyService } from '../services/spotifyService';
import jwt from 'jsonwebtoken';

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
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

router.post('/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    // Verify state parameter
    jwt.verify(state, process.env.JWT_SECRET!);
    
    const tokens = await spotifyService.exchangeCodeForTokens(code);
    
    // Store tokens in database (implement this)
    // await storeUserTokens(req.user.id, tokens);
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Invalid authorization code' });
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artist albums' });
  }
});

export default router;