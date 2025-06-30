# 🎯 Integration Plan: Bandruption AI Music Promoter

### 1. **Server-Side Integration**

#### **A. Create Bandruption AI Service**
```typescript
// apps/server/src/services/bandruptionService.ts
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

  async askAxel(message: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        // or 'X-API-Key': this.apiKey - depending on their auth method
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`Bandruption API error: ${response.status}`);
    }

    const data = await response.json() as BandruptionResponse;
    return data.reply;
  }
}

export const bandruptionService = new BandruptionService();
```

#### **B. Create Bandruption API Routes**
```typescript
// apps/server/src/routes/bandruption.ts
import { Router } from 'express';
import { bandruptionService } from '../services/bandruptionService.js';

const router = Router();

// Chat with Axel endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
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
```

#### **C. Update Server App**
```typescript
// apps/server/src/app.ts
import bandruptionRoutes from './routes/bandruption.js';

// Add this line with other routes
app.use('/api/bandruption', bandruptionRoutes);
```

#### **D. Environment Variables**
```env
# .env.example
BANDRUPTION_API_KEY=your_api_key_here
```

### 2. **Update Shared Types**

```typescript
// packages/shared/src/types/index.ts
// Add to existing types:

export interface BandruptionChatMessage extends ChatMessage {
  type: 'bandruption';
  axelResponse?: string;
}

export interface BandruptionApiResponse {
  reply: string;
}

export interface BandruptionError {
  error: string;
}
```

### 3. **Web App Integration**

#### **A. Create Bandruption API Service**
```typescript
// apps/web/src/services/bandruptionApi.ts
import { BandruptionApiResponse } from '@shared/types';

export class BandruptionApiService {
  private readonly baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3001';

  async chatWithAxel(message: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/bandruption/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth header if needed
        'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`,
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
```

#### **B. Update Chat Components**
```typescript
// apps/web/src/components/chat/ChatWidget.tsx
// Replace the mock AI response with real API call:

import { bandruptionApi } from '../../services/bandruptionApi';

const handleSendMessage = async () => {
  if (!message.trim()) return;

  const newMessage = {
    id: Date.now().toString(),
    message: message.trim(),
    isUser: true,
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, newMessage]);
  setMessage('');

  try {
    const axelResponse = await bandruptionApi.chatWithAxel(newMessage.message);
    
    const aiResponse = {
      id: (Date.now() + 1).toString(),
      message: axelResponse,
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, aiResponse]);
  } catch (error) {
    console.error('Chat error:', error);
    const errorResponse = {
      id: (Date.now() + 1).toString(),
      message: "Sorry, I'm having trouble connecting to Axel right now. Please try again later.",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorResponse]);
  }
};
```

### 4. **Mobile App Integration**

#### **A. Create Bandruption Service**
```typescript
// apps/mobile/services/bandruptionService.ts
export class BandruptionService {
  private readonly baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';

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

    const data = await response.json();
    return data.reply;
  }
}

export const bandruptionService = new BandruptionService();
```

#### **B. Update Mobile Chat Component**
```typescript
// apps/mobile/components/AIChat.tsx
import { bandruptionService } from '../services/bandruptionService';

const handleSendMessage = async () => {
  if (!message.trim()) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    content: message,
    isUser: true,
    timestamp: new Date(),
  };
  addChatMessage(userMessage);

  try {
    const axelResponse = await bandruptionService.chatWithAxel(message);
    
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: axelResponse,
      isUser: false,
      timestamp: new Date(),
    };
    addChatMessage(aiMessage);
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: "Sorry, I'm having trouble connecting to Axel right now. Please try again later.",
      isUser: false,
      timestamp: new Date(),
    };
    addChatMessage(errorMessage);
  }

  setMessage('');
};
```

### 5. **Security & Configuration**

#### **A. Environment Setup**
```typescript
// apps/server/.env
BANDRUPTION_API_KEY=your_actual_api_key_here

// apps/web/.env
VITE_API_BASE_URL=http://localhost:3001

// apps/mobile/.env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

#### **B. Error Handling & Rate Limiting**
```typescript
// apps/server/src/services/bandruptionService.ts
// Add retry logic and rate limiting
class BandruptionService {
  private requestCount = 0;
  private resetTime = Date.now();

  async askAxel(message: string): Promise<string> {
    // Simple rate limiting
    if (this.requestCount > 100 && Date.now() - this.resetTime < 60000) {
      throw new Error('Rate limit exceeded');
    }

    try {
      // Reset counter every minute
      if (Date.now() - this.resetTime > 60000) {
        this.requestCount = 0;
        this.resetTime = Date.now();
      }

      this.requestCount++;
      
      const response = await fetch(`${this.baseUrl}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ message }),
        timeout: 30000, // 30 second timeout
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
```

### 6. **Testing Strategy**

#### **A. Unit Tests**
```typescript
// apps/server/src/__tests__/bandruptionService.test.ts
import { bandruptionService } from '../services/bandruptionService';

describe('BandruptionService', () => {
  it('should send message to Axel and receive response', async () => {
    const response = await bandruptionService.askAxel('What are some good rock bands?');
    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
  });

  it('should handle API errors gracefully', async () => {
    await expect(bandruptionService.askAxel('')).rejects.toThrow();
  });
});
```

### 7. **Deployment Checklist**

- [ ] Set up `BANDRUPTION_API_KEY` in production environment
- [ ] Update CORS settings to allow requests from your domains
- [ ] Test API integration in staging environment
- [ ] Monitor API usage and set up logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting for production
- [ ] Update documentation for new endpoints

### 8. **Optional Enhancements**

#### **A. Message Persistence**
```sql
-- Add to Supabase migrations
CREATE TABLE bandruption_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **B. Advanced Features**
- Message history persistence
- Context-aware conversations
- Music recommendation integration with Spotify
- User preference learning
- Analytics and usage tracking

This integration plan provides a complete, production-ready implementation that maintains your existing architecture patterns while adding the Bandruption AI functionality to both web and mobile apps through your server layer.