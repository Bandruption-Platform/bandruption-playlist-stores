import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MessageCircle, Sparkles, TrendingUp, Clock } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { AlbumCard } from '@/components/AlbumCard';
import { FeedCard } from '@/components/FeedCard';
import { AIChat } from '@/components/AIChat';

export default function HomeScreen() {
  const { library, user } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);

  const featuredAlbums = library.slice(0, 3);
  const recentlyPlayed = library.slice(3, 6);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good evening, {user?.username}</Text>
        <Text style={styles.subtitle}>Discover your next favorite sound</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search artists, albums, genres..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* AI Chat Button */}
      <TouchableOpacity
        style={styles.aiChatButton}
        onPress={() => setShowAIChat(true)}
      >
        <Sparkles size={20} color="#10B981" />
        <Text style={styles.aiChatText}>Want something new?</Text>
        <MessageCircle size={16} color="#10B981" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Featured Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Trending Now</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {featuredAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                style={styles.featuredCard}
                showArtist={true}
              />
            ))}
          </ScrollView>
        </View>

        {/* Recently Played */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Recently Played</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {recentlyPlayed.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                style={styles.recentCard}
                showArtist={true}
              />
            ))}
          </ScrollView>
        </View>

        {/* Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Feed</Text>
          <FeedCard
            type="nft_created"
            user="synthmaster"
            content="Just minted a new cyberpunk NFT from Digital Horizons!"
            image="https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=300"
            timestamp={new Date()}
          />
          <FeedCard
            type="album_added"
            user="jazzlover"
            content="Added Urban Jazz to my collection. The vibes are immaculate! 🎷"
            image="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300"
            timestamp={new Date(Date.now() - 3600000)}
          />
        </View>
      </ScrollView>

      {/* AI Chat Modal */}
      <AIChat
        visible={showAIChat}
        onClose={() => setShowAIChat(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  aiChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  aiChatText: {
    flex: 1,
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  featuredCard: {
    width: 200,
    marginRight: 16,
  },
  recentCard: {
    width: 160,
    marginRight: 16,
  },
});