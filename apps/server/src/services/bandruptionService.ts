import fetch from 'node-fetch';

export interface BandruptionRequest {
  message: string;
}

export interface BandruptionResponse {
  reply: string;
}

class BandruptionService {
  private readonly baseUrl = 'https://bandruption-ai-promoter-service-hgh7efejepeyffck.japaneast-01.azurewebsites.net';
  private readonly apiKey = process.env.BANDRUPTION_API_KEY;
  private requestCount = 0;
  private resetTime = Date.now();

  async askAxel(message: string): Promise<string> {
    // Reset counter every minute
    if (Date.now() - this.resetTime >= 60000) {
      this.requestCount = 0;
      this.resetTime = Date.now();
    }

    // Simple rate limiting - check before incrementing to enforce true limit of 100
    if (this.requestCount >= 100) {
      throw new Error('Rate limit exceeded');
    }

    try {
      this.requestCount++;
      
      const response = await fetch(`${this.baseUrl}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`Bandruption API error: ${response.status}`);
      }

      const data = await response.json() as BandruptionResponse;
      return data.reply;
    } catch (error) {
      console.error('Bandruption service error:', error);
      throw error;
    }
  }
}

export const bandruptionService = new BandruptionService();