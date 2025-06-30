import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import bandruptionRoutes from '../routes/bandruption.js';
import { bandruptionService } from '../services/bandruptionService.js';

// Mock the bandruption service
vi.mock('../services/bandruptionService.js', () => ({
  bandruptionService: {
    askAxel: vi.fn(),
  },
}));

describe('Bandruption Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/bandruption', bandruptionRoutes);
  });

  describe('POST /api/bandruption/chat', () => {
    it('should return AI response for valid message', async () => {
      const mockResponse = 'I recommend checking out Led Zeppelin and Pink Floyd!';
      vi.mocked(bandruptionService.askAxel).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/bandruption/chat')
        .send({ message: 'What are some classic rock bands?' })
        .expect(200);

      expect(response.body).toEqual({ reply: mockResponse });
      expect(bandruptionService.askAxel).toHaveBeenCalledWith('What are some classic rock bands?');
    });

    it('should return 400 error when message is missing', async () => {
      const response = await request(app)
        .post('/api/bandruption/chat')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ error: 'Message is required' });
      expect(bandruptionService.askAxel).not.toHaveBeenCalled();
    });

    it('should return 400 error when message is not a string', async () => {
      const response = await request(app)
        .post('/api/bandruption/chat')
        .send({ message: 123 })
        .expect(400);

      expect(response.body).toEqual({ error: 'Message is required' });
      expect(bandruptionService.askAxel).not.toHaveBeenCalled();
    });

    it('should return 400 error when message is empty string', async () => {
      const response = await request(app)
        .post('/api/bandruption/chat')
        .send({ message: '' })
        .expect(400);

      expect(response.body).toEqual({ error: 'Message is required' });
      expect(bandruptionService.askAxel).not.toHaveBeenCalled();
    });

    it('should return 500 error when service throws error', async () => {
      vi.mocked(bandruptionService.askAxel).mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .post('/api/bandruption/chat')
        .send({ message: 'Valid message' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to get response from Axel' });
      expect(bandruptionService.askAxel).toHaveBeenCalledWith('Valid message');
    });

    it('should handle whitespace-only messages', async () => {
      const response = await request(app)
        .post('/api/bandruption/chat')
        .send({ message: '   ' })
        .expect(400);

      expect(response.body).toEqual({ error: 'Message is required' });
      expect(bandruptionService.askAxel).not.toHaveBeenCalled();
    });

    it('should trim messages before sending to service', async () => {
      const mockResponse = 'Here are some recommendations!';
      vi.mocked(bandruptionService.askAxel).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/bandruption/chat')
        .send({ message: '  What music should I listen to?  ' })
        .expect(200);

      expect(response.body).toEqual({ reply: mockResponse });
      expect(bandruptionService.askAxel).toHaveBeenCalledWith('  What music should I listen to?  ');
    });
  });
});