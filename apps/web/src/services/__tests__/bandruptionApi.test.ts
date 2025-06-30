import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bandruptionApi } from '../bandruptionApi';

// Mock fetch globally
global.fetch = vi.fn();

describe('BandruptionApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('chatWithAxel', () => {
    it('should send message to API and return response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ reply: 'Great music recommendations!' }),
      };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

      const result = await bandruptionApi.chatWithAxel('Recommend some jazz music');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/bandruption/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Recommend some jazz music' }),
        }
      );
      expect(result).toBe('Great music recommendations!');
    });

    it('should use default base URL when env variable is not set', async () => {
      vi.unstubAllEnvs();
      const service = new (bandruptionApi.constructor as typeof bandruptionApi.constructor)();
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ reply: 'Response' }),
      };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

      await service.chatWithAxel('Test message');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/bandruption/chat',
        expect.any(Object)
      );
    });

    it('should throw error when API returns non-ok response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

      await expect(bandruptionApi.chatWithAxel('test')).rejects.toThrow(
        'Failed to chat with Axel: 404'
      );
    });

    it('should throw error when fetch fails', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      await expect(bandruptionApi.chatWithAxel('test')).rejects.toThrow('Network error');
    });

    it('should handle empty messages', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ reply: 'Please provide a message!' }),
      };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

      const result = await bandruptionApi.chatWithAxel('');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/bandruption/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: '' }),
        }
      );
      expect(result).toBe('Please provide a message!');
    });

    it('should handle long messages', async () => {
      const longMessage = 'a'.repeat(1000);
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ reply: 'Processed long message' }),
      };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

      const result = await bandruptionApi.chatWithAxel(longMessage);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/bandruption/chat',
        expect.objectContaining({
          body: JSON.stringify({ message: longMessage }),
        })
      );
      expect(result).toBe('Processed long message');
    });
  });
});