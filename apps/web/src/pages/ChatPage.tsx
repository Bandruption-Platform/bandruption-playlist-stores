import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Music, Palette, Lightbulb, Trash2 } from 'lucide-react';
import { Button } from '@shared/ui';
import { Card } from '../components/ui/Card';
import { bandruptionApi } from '../services/bandruptionApi';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'music' | 'art' | 'suggestion';
}

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hey there! I'm Bandruption AI, your personal music discovery and creativity assistant. I can help you with:\n\n🎵 Discover new music based on your mood\n🎨 Generate NFT art ideas from album covers\n💡 Get creative suggestions for playlists\n🎧 Find artists similar to your favorites\n\nWhat would you like to explore today?",
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const axelResponse = await bandruptionApi.chatWithAxel(newMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: axelResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'text' // We can enhance this later based on response content
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to Axel right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep the welcome message
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'music':
        return <Music className="w-4 h-4" />;
      case 'art':
        return <Palette className="w-4 h-4" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const suggestedPrompts = [
    "Recommend music for a rainy day",
    "Create NFT art from album covers",
    "Help me discover new genres",
    "Generate playlist for working out"
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Bandruption AI</h1>
                <p className="text-gray-400">Your music discovery & creativity assistant</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Trash2}
              onClick={clearChat}
              className="hidden sm:flex"
            >
              Clear Chat
            </Button>
          </div>
        </div>

        {/* Chat Container */}
        <Card variant="glass" className="mb-6 h-[60vh] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                  {!message.isUser && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                        {getMessageIcon(message.type)}
                      </div>
                      <span className="text-sm text-gray-400">Bandruption AI</span>
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl ${
                      message.isUser
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-400">Bandruption AI is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-dark-600 p-6">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about music discovery, NFT art creation, or playlist ideas..."
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none max-h-32"
                  rows={1}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                variant="primary"
                size="lg"
                icon={Send}
                disabled={!inputValue.trim() || isTyping}
                className="flex-shrink-0"
              />
            </div>
          </div>
        </Card>

        {/* Suggested Prompts */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Try asking about:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInputValue(prompt)}
                className="text-left p-4 bg-dark-700/50 hover:bg-dark-700 border border-dark-600 rounded-lg text-gray-300 hover:text-white transition-all duration-200 hover:border-primary-500"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span>{prompt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};