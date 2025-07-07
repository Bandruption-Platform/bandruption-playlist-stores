import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@shared/ui';
import { Card } from '../ui/Card';
import { useAppStore } from '../../store/appStore';
import { bandruptionApi } from '../../services/bandruptionApi';

export const ChatWidget: React.FC = () => {
  const { isChatOpen, toggleChat } = useAppStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      message: 'Hello! I\'m Bandruption AI. I can help you discover new music, recommend songs based on your mood, and suggest album art for NFT creation. What would you like to explore today?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  return (
    <>
      {/* Chat Button */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full animate-pulse-slow">
            <Sparkles className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 max-w-[calc(100vw-2rem)] animate-slide-up">
          <Card variant="glass" className="h-96 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-600">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Bandruption AI</h3>
                  <p className="text-xs text-gray-400">Music discovery assistant</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.isUser
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-dark-600">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about music, artists, or NFT ideas..."
                  className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button
                  onClick={handleSendMessage}
                  variant="primary"
                  size="sm"
                  icon={Send}
                  disabled={!message.trim()}
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};