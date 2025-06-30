import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fetch from 'node-fetch';

// Mock node-fetch
vi.mock('node-fetch');
const mockFetch = vi.mocked(fetch);

describe('BandruptionService', () => {
  let BandruptionService: any;
  let service: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Set environment variable
    process.env.BANDRUPTION_API_KEY = 'test-api-key';
    
    // Dynamic import to get fresh instance with env vars
    const module = await import('../services/bandruptionService.js');
    BandruptionService = module.bandruptionService.constructor;
    service = new BandruptionService();
  });

  afterEach(() => {
    delete process.env.BANDRUPTION_API_KEY;
  });

  describe('askAxel', () => {
    it('should send message to Bandruption API and return response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ reply: 'Hello! I can help you discover great music!' }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await service.askAxel('What are some good rock bands?');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://bandruption-ai-promoter-service-hgh7efejepeyffck.japaneast-01.azurewebsites.net/api/ask',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          },
          body: JSON.stringify({ message: 'What are some good rock bands?' }),
        }
      );
      expect(result).toBe('Hello! I can help you discover great music!');
    });

    it('should throw error when API returns non-ok response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(service.askAxel('test message')).rejects.toThrow(
        'Bandruption API error: 500'
      );
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(service.askAxel('test message')).rejects.toThrow('Network error');
    });

    it('should handle rate limiting - reject exactly at 100 requests', async () => {
      // Set up service state for rate limiting
      service.requestCount = 0;
      service.resetTime = Date.now();

      // Make 100 successful requests
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ reply: 'Response' }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      for (let i = 0; i < 100; i++) {
        await service.askAxel('test');
      }

      // The 101st request should throw rate limit error
      await expect(service.askAxel('test')).rejects.toThrow('Rate limit exceeded');
    });

    it('should enforce exact 100 request limit - old behavior would allow 101', async () => {
      // Set up service state - this test would fail with old code that checked > 100
      service.requestCount = 99;
      service.resetTime = Date.now();

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ reply: 'Response' }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      // Request 100 should succeed
      await service.askAxel('test');
      expect(service.requestCount).toBe(100);

      // Request 101 should fail immediately (old code would have allowed this)
      await expect(service.askAxel('test')).rejects.toThrow('Rate limit exceeded');
    });

    it('should reset rate limit counter after one minute', async () => {
      // Set up initial state
      service.requestCount = 50;
      service.resetTime = Date.now() - 61000; // 61 seconds ago

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ reply: 'Response' }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      // This should reset the counter and succeed
      await service.askAxel('test');
      
      expect(service.requestCount).toBe(1);
      expect(service.resetTime).toBeGreaterThan(Date.now() - 1000);
    });

    it('should handle missing API key', async () => {
      delete process.env.BANDRUPTION_API_KEY;
      const serviceNoKey = new BandruptionService();

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ reply: 'Response' }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await serviceNoKey.askAxel('test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer undefined',
          }),
        })
      );
    });
  });
});