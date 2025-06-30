import { BandruptionApiResponse } from '@shared/types';

export class BandruptionApiService {
  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  async chatWithAxel(message: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/bandruption/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Failed to chat with Axel: ${response.status}`);
    }

    const data: BandruptionApiResponse = await response.json();
    return data.reply;
  }
}

export const bandruptionApi = new BandruptionApiService();