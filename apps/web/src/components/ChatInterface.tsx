import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import AlbumCard from './AlbumCard';

function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const { messages, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const messageText = message;
    setMessage('');
    await sendMessage(messageText);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-2xl neon-glow transition-all duration-300 transform hover:scale-110 z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
          <div className="floating-chat rounded-2xl shadow-2xl h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-white">AI Music Promoter</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                  {messages.map((msg) => (
                    <div key={msg.id} className="chat-bubble">
                      <div className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.isUser 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                            : 'bg-white/10 text-gray-100'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          {msg.albumRecommendations && msg.albumRecommendations.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {msg.albumRecommendations.map((album) => (
                                <div key={album.id} className="flex items-center space-x-3 p-2 rounded-lg bg-black/20">
                                  <img 
                                    src={album.imageUrl} 
                                    alt={album.name}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-white truncate">{album.name}</p>
                                    <p className="text-xs text-gray-300 truncate">{album.artist}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 text-gray-100 p-3 rounded-2xl max-w-[80%]">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-500/20">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask about music, get recommendations..."
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || isLoading}
                      className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ChatInterface;