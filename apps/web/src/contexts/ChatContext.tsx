import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage, Album } from '@shared/types';
import { generateAIResponse } from '../services/aiService';

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      content: "Hey there! I'm your AI music promoter. I can help you discover new music, analyze your playlists, and find hidden gems. What are you in the mood for today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(content);
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: aiResponse.message,
        isUser: false,
        timestamp: new Date(),
        albumRecommendations: aiResponse.recommendations
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      content: "Hey there! I'm your AI music promoter. I can help you discover new music, analyze your playlists, and find hidden gems. What are you in the mood for today?",
      isUser: false,
      timestamp: new Date(),
    }]);
  };

  const value = {
    messages,
    isLoading,
    sendMessage,
    clearChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}