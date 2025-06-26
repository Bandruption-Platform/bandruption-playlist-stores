import { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AIChat } from '@/components/AIChat'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MessageCircle } from 'lucide-react-native';

const queryClient = new QueryClient();

export default function RootLayout() {
  useFrameworkReady();

  const [showAIChat, setShowAIChat] = useState(false); // add state for modal visability

  const styles = StyleSheet.create({
    chatButtonContainer: {
      position: 'absolute',
      bottom: 100,
      right: 20,
      zIndex: 1000,
    },
    aiChatButton:{
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#10B981',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />

      {/* AI Chat Modal */}
      <AIChat
        visible={showAIChat}
        onClose={() => setShowAIChat(false)}
      />

      {/* Persistent AI Chat Button */}
      <View style = {styles.chatButtonContainer}>
        <TouchableOpacity
          style = {styles.aiChatButton}
          onPress={() => setShowAIChat(true)}
        >
          <MessageCircle size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

    </QueryClientProvider>
  );
  
}