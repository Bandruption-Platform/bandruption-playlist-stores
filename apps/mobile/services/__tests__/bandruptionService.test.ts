import { bandruptionService, BandruptionService } from '../bandruptionService';

// Mock fetch globally
global.fetch = jest.fn();

describe('BandruptionService (Mobile)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://test-mobile-api.com';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
  });

  describe('chatWithAxel', () => {
    it('should send message to API and return response using default URL', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ reply: 'Great music recommendations for mobile!' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse as unknown as Response);

      const result = await bandruptionService.chatWithAxel('Recommend electronic music');

      // The singleton service uses the default URL since env var wasn't set at module load time
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/bandruption/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Recommend electronic music' }),
        }
      );
      expect(result).toBe('Great music recommendations for mobile!');
    });

    it('should use custom base URL when env variable is set', async () => {
      // Create a new service instance after setting the env var
      const service = new BandruptionService();
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ reply: 'Response' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse as unknown as Response);

      await service.chatWithAxel('Test message');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-mobile-api.com/api/bandruption/chat',
        expect.any(Object)
      );
    });

    it('should use default base URL when env variable is not set', async () => {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
      const service = new BandruptionService();
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ reply: 'Response' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse as unknown as Response);

      await service.chatWithAxel('Test message');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/bandruption/chat',
        expect.any(Object)
      );
    });

    it('should throw error when API returns non-ok response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse as unknown as Response);

      await expect(bandruptionService.chatWithAxel('test')).rejects.toThrow(
        'Failed to chat with Axel: 500'
      );
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Mobile network error'));

      await expect(bandruptionService.chatWithAxel('test')).rejects.toThrow('Mobile network error');
    });

    it('should handle different response status codes', async () => {
      const testCases = [
        { status: 400, expected: 'Failed to chat with Axel: 400' },
        { status: 401, expected: 'Failed to chat with Axel: 401' },
        { status: 403, expected: 'Failed to chat with Axel: 403' },
        { status: 404, expected: 'Failed to chat with Axel: 404' },
        { status: 429, expected: 'Failed to chat with Axel: 429' },
        { status: 500, expected: 'Failed to chat with Axel: 500' },
      ];

      for (const testCase of testCases) {
        const mockResponse = {
          ok: false,
          status: testCase.status,
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse as unknown as Response);

        await expect(bandruptionService.chatWithAxel('test')).rejects.toThrow(testCase.expected);
      }
    });

    it('should handle malformed JSON response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse as unknown as Response);

      await expect(bandruptionService.chatWithAxel('test')).rejects.toThrow('Invalid JSON');
    });

    it('should handle empty response body', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse as unknown as Response);

      const result = await bandruptionService.chatWithAxel('test');
      expect(result).toBeUndefined();
    });

    it('should handle special characters in messages', async () => {
      const specialMessage = 'What about música clásica & jazz? 🎵🎶';
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ reply: 'I love classical music and jazz!' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse as unknown as Response);

      await bandruptionService.chatWithAxel(specialMessage);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/bandruption/chat',
        expect.objectContaining({
          body: JSON.stringify({ message: specialMessage }),
        })
      );
    });

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(5000);
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ reply: 'Processed your long message!' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse as unknown as Response);

      const result = await bandruptionService.chatWithAxel(longMessage);

      expect(result).toBe('Processed your long message!');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/bandruption/chat',
        expect.objectContaining({
          body: JSON.stringify({ message: longMessage }),
        })
      );
    });

    it('should work with concurrent requests', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ reply: 'Concurrent response' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse as unknown as Response);

      const promises = [
        bandruptionService.chatWithAxel('Message 1'),
        bandruptionService.chatWithAxel('Message 2'),
        bandruptionService.chatWithAxel('Message 3'),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([
        'Concurrent response',
        'Concurrent response', 
        'Concurrent response',
      ]);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});