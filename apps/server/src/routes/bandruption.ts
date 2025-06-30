import { Router } from 'express';
import { bandruptionService } from '../services/bandruptionService.js';

const router = Router();

// Chat with Axel endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await bandruptionService.askAxel(message);
    
    res.json({ reply });
  } catch (error) {
    console.error('Bandruption chat error:', error);
    res.status(500).json({ error: 'Failed to get response from Axel' });
  }
});

export default router;