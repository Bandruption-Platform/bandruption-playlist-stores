import { Router } from 'express';
import { spotifyService } from '../services/spotifyService';
import jwt from 'jsonwebtoken';

const router = Router();

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