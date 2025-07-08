import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Send, Sparkles } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { ChatMessage } from '@shared/types';
import { AlbumCard } from '@/components/AlbumCard';
import { bandruptionService } from '@/services/bandruptionService';

export default function AIChat() {
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={24} color="#CDFF6A" />
          <Text style={styles.title}>Music Discovery AI</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {chatHistory.length === 0 && (
          <View style={styles.welcomeContainer}>
            <Sparkles size={48} color="#CDFF6A" />
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
          placeholderTextColor="#A78BFA"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!message.trim()}
        >
          <Send size={20} color={message.trim() ? "#000000" : "#A78BFA"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#4C1D95',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E0E7FF',
    marginLeft: 12,
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
    color: '#E0E7FF',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#C4B5FD',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  suggestions: {
    gap: 12,
  },
  suggestionButton: {
    backgroundColor: '#2D1B69',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CDFF6A',
  },
  suggestionText: {
    fontSize: 14,
    color: '#CDFF6A',
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
    backgroundColor: '#70C3ED',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2D1B69',
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#000000',
  },
  aiMessageText: {
    color: '#E0E7FF',
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
    borderTopColor: '#4C1D95',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2D1B69',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4C1D95',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#E0E7FF',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#70c3ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#4C1D95',
  },
});