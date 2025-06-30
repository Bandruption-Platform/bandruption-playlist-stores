import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Send, Sparkles } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { ChatMessage } from '@shared/types';
import { AlbumCard } from './AlbumCard';
import { bandruptionService } from '../services/bandruptionService';

interface AIChatProps {
  visible: boolean;
  onClose: () => void;
}

export function AIChat({ visible, onClose }: AIChatProps) {
  const { chatHistory, addChatMessage } = useAppStore();
  const [message, setMessage] = useState('');

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Sparkles size={24} color="#10B981" />
            <Text style={styles.title}>Music Discovery AI</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {chatHistory.length === 0 && (
            <View style={styles.welcomeContainer}>
              <Sparkles size={48} color="#10B981" />
              <Text style={styles.welcomeTitle}>Hey there! 👋</Text>
              <Text style={styles.welcomeText}>
                I'm your personal music discovery AI. Tell me what you're in the mood for, and I'll recommend the perfect albums!
              </Text>
              <View style={styles.suggestions}>
                <TouchableOpacity style={styles.suggestionButton}>
                  <Text style={styles.suggestionText}>Something chill for working</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionButton}>
                  <Text style={styles.suggestionText}>Upbeat electronic music</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionButton}>
                  <Text style={styles.suggestionText}>Jazz with modern vibes</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {chatHistory.map((msg) => (
            <View key={msg.id} style={styles.messageWrapper}>
              <View style={[
                styles.message,
                msg.isUser ? styles.userMessage : styles.aiMessage
              ]}>
                <Text style={[
                  styles.messageText,
                  msg.isUser ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {msg.content}
                </Text>
              </View>

              {msg.albumRecommendations && (
                <View style={styles.recommendations}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {msg.albumRecommendations.map((album) => (
                      <AlbumCard
                        key={album.id}
                        album={album}
                        style={styles.recommendationCard}
                        showArtist={true}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="What kind of music are you looking for?"
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send size={20} color={message.trim() ? "#FFFFFF" : "#6B7280"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  suggestions: {
    gap: 12,
  },
  suggestionButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  suggestionText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  messageWrapper: {
    marginVertical: 8,
  },
  message: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#10B981',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A1A1A',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#D1D5DB',
  },
  recommendations: {
    marginTop: 12,
    paddingLeft: 12,
  },
  recommendationCard: {
    width: 140,
    marginRight: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
});