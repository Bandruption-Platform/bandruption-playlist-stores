import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MessageCircle, Sparkles, TrendingUp, Clock } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { AlbumCard } from '@/components/AlbumCard';
import { FeedCard } from '@/components/FeedCard';

export default function HomeScreen() {
  const { library, user } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  
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
        <Search size={20} color="#A78BFA" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search artists, albums, genres..."
          placeholderTextColor="#A78BFA"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Featured Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#70C3ED" />
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
            <Clock size={20} color="#70C3ED" />
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
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#70C3ED" />
            <Text style={styles.sectionTitle}>Community Feed</Text>
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E0E7FF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#C4B5FD',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#E0E7FF',
    fontSize: 16,
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
    color: '#E0E7FF',
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