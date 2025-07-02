import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share, Music, Palette, Users, Crown, ChevronRight } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const { user, nftGallery, library, playlists } = useAppStore();
  const [activeTab, setActiveTab] = useState<'music' | 'collections' | 'statistics'>('music');

  // For demo purposes, we'll use the current user's data
  // In a real app, you'd fetch the user data by id
  const profileUser = user;

  if (!profileUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Share size={24} color="#A78BFA" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <Image
              source={{ uri: profileUser.profileImage }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{profileUser.username}</Text>
              <Text style={styles.email}>{profileUser.email}</Text>
              {profileUser.bio && (
                <Text style={styles.bio}>{profileUser.bio}</Text>
              )}
              <View style={styles.badgeContainer}>
                {profileUser.spotifyConnected && (
                  <View style={styles.spotifyBadge}>
                    <Music size={12} color="#1DB954" />
                    <Text style={styles.spotifyText}>Spotify Connected</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{library.length}</Text>
              <Text style={styles.statLabel}>Albums</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{nftGallery.length}</Text>
              <Text style={styles.statLabel}>NFTs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{playlists.length}</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>847</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'music' && styles.activeTab]}
            onPress={() => setActiveTab('music')}
          >
            <Text style={[styles.tabText, activeTab === 'music' && styles.activeTabText]}>
              Music
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'collections' && styles.activeTab]}
            onPress={() => setActiveTab('collections')}
          >
            <Text style={[styles.tabText, activeTab === 'collections' && styles.activeTabText]}>
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'statistics' && styles.activeTab]}
            onPress={() => setActiveTab('statistics')}
          >
            <Text style={[styles.tabText, activeTab === 'statistics' && styles.activeTabText]}>
              Statistics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'music' && (
          <View style={styles.musicContainer}>
            {/* Featured Music */}
            <View style={styles.featuredSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Music</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <ChevronRight size={16} color="#70C3ED" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={playlists.filter(playlist => playlist.isFeatured).slice(0, 3)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.featuredPlaylistCard}
                    onPress={() => router.push(`/playlist/${item.id}`)}
                  >
                    <Image 
                      source={{ uri: item.coverImage || item.cover_image }} 
                      style={styles.featuredPlaylistImage} 
                    />
                    <Text style={styles.featuredPlaylistTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.featuredPlaylistDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.horizontalList}
              />
            </View>

            {/* Popular Albums */}
            <View style={styles.albumsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Albums</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <ChevronRight size={16} color="#70C3ED" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={library.slice(0, 4)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.albumCard}>
                    <Image 
                      source={{ uri: item.imageUrl }} 
                      style={styles.albumImage} 
                    />
                    <Text style={styles.albumTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.albumArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>
                )}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          </View>
        )}

        {activeTab === 'collections' && (
          <View style={styles.collectionsContainer}>
            {nftGallery.length > 0 ? (
              <View style={styles.nftGrid}>
                {nftGallery.map((nft) => (
                  <View key={nft.id} style={styles.nftCard}>
                    <Image source={{ uri: nft.imageUrl }} style={styles.nftImage} />
                    <Text style={styles.nftTitle} numberOfLines={1}>{nft.name}</Text>
                    <Text style={styles.nftPrice}>{nft.price} ETH</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Palette size={48} color="#A78BFA" />
                <Text style={styles.emptyText}>No gallery items yet</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'statistics' && (
          <View style={styles.statisticsContainer}>
            {/* Public Stats Only */}
            <View style={styles.publicStatsCard}>
              <Text style={styles.statisticsTitle}>Public Statistics</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Creations</Text>
                <Text style={styles.statValue}>{library.length + nftGallery.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Followers</Text>
                <Text style={styles.statValue}>847</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Following</Text>
                <Text style={styles.statValue}>234</Text>
              </View>
            </View>

            {/* Favorite Genres */}
            {profileUser.favoriteGenres && profileUser.favoriteGenres.length > 0 && (
              <View style={styles.genresCard}>
                <Text style={styles.statisticsTitle}>Favorite Genres</Text>
                {profileUser.favoriteGenres.map((genre, index) => (
                  <View key={genre} style={styles.genreRow}>
                    <Text style={styles.genreText}>{genre}</Text>
                    <View style={styles.genreBar}>
                      <View 
                        style={[
                          styles.genreBarFill, 
                          { width: `${100 - index * 20}%` }
                        ]} 
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#C4B5FD',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#E0E7FF',
    lineHeight: 20,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  spotifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  spotifyText: {
    fontSize: 12,
    color: '#1DB954',
    marginLeft: 4,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#C4B5FD',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#70C3ED',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A78BFA',
  },
  activeTabText: {
    color: '#70C3ED',
  },
  musicContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  featuredSection: {
    marginBottom: 32,
  },
  albumsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#70C3ED',
    fontWeight: '600',
    marginRight: 4,
  },
  horizontalList: {
    paddingRight: 20,
  },
  featuredPlaylistCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  featuredPlaylistImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#4C1D95',
  },
  featuredPlaylistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredPlaylistDescription: {
    fontSize: 12,
    color: '#C4B5FD',
    lineHeight: 16,
  },
  albumCard: {
    width: 120,
    marginRight: 16,
  },
  albumImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#4C1D95',
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 12,
    color: '#A78BFA',
  },
  collectionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nftCard: {
    width: '48%',
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  nftImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#4C1D95',
  },
  nftTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nftPrice: {
    fontSize: 12,
    color: '#CDFF6A',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#A78BFA',
    marginTop: 16,
  },
  statisticsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  publicStatsCard: {
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  genresCard: {
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  genreText: {
    fontSize: 16,
    color: '#FFFFFF',
    width: 100,
  },
  genreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#4C1D95',
    borderRadius: 4,
    marginLeft: 12,
  },
  genreBarFill: {
    height: '100%',
    backgroundColor: '#CDFF6A',
    borderRadius: 4,
  },
});