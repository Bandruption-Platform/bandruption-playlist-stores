import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share, Music, Palette, Users, Crown, ChevronRight } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { NFTGallery } from '@/components/NFTGallery';
import { PlaylistItem } from '@/components/PlaylistItem';

export default function FanProfileScreen() {
  const { id } = useLocalSearchParams();
  const { user, nftGallery, library, playlists, followedArtists, fanUsers, getFanUserById } = useAppStore();
  const [activeTab, setActiveTab] = useState<'music' | 'gallery' | 'statistics'>('music');

  // Get the fan user by id, fallback to mock data for demo
  const fanUser = getFanUserById ? getFanUserById(id as string) : fanUsers?.find(u => u.id === id) || user;

  if (!fanUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const featuredPlaylists = playlists.filter(playlist => playlist.isFeatured);
  
  // Use fan user's specific data or fallback to current user's data for demo
  const fanFollowedArtists = fanUser.followedArtists || followedArtists || [];
  const fanFavoriteAlbums = fanUser.favoriteAlbums || library.slice(0, 6);
  const fanNFTGallery = fanUser.nftGallery || nftGallery;

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
              source={{ uri: fanUser.profileImage }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{fanUser.username}</Text>
              <Text style={styles.email}>{fanUser.email}</Text>
              {fanUser.bio && (
                <Text style={styles.bio}>{fanUser.bio}</Text>
              )}
              <View style={styles.badgeContainer}>
                {fanUser.spotifyConnected && (
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
              <Text style={styles.statNumber}>{fanFavoriteAlbums.length}</Text>
              <Text style={styles.statLabel}>Albums</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{fanNFTGallery.length}</Text>
              <Text style={styles.statLabel}>NFTs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{featuredPlaylists.length}</Text>
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
            style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
            onPress={() => setActiveTab('gallery')}
          >
            <Text style={[styles.tabText, activeTab === 'gallery' && styles.activeTabText]}>
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
          <ScrollView style={styles.musicContainer} showsVerticalScrollIndicator={false}>
            {/* Featured Music Section */}
            <View style={styles.featuredSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Music</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <ChevronRight size={16} color="#70C3ED" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={featuredPlaylists}
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

            {/* Followed Artists Section */}
            <View style={styles.followedArtistsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Followed Artists</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <ChevronRight size={16} color="#70C3ED" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={fanFollowedArtists.slice(0, 5)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.artistCard}>
                    <Image 
                      source={{ uri: item.imageUrl }} 
                      style={styles.artistImage} 
                    />
                    <Text style={styles.artistName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.artistGenre} numberOfLines={1}>
                      {item.genre}
                    </Text>
                  </View>
                )}
                contentContainerStyle={styles.horizontalList}
              />
            </View>

            {/* Favorite Albums Section */}
            <View style={styles.favoriteAlbumsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Favorite Albums</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <ChevronRight size={16} color="#70C3ED" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={fanFavoriteAlbums}
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
          </ScrollView>
        )}

        {activeTab === 'gallery' && (
          <View style={styles.collectionsContainer}>
            {fanNFTGallery.length > 0 ? (
              <NFTGallery nfts={fanNFTGallery} />
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
            {/* Public Stats Only - No "This Month" section */}
            <View style={styles.publicStatsCard}>
              <Text style={styles.statisticsTitle}>Public Statistics</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Creations</Text>
                <Text style={styles.statValue}>{fanFavoriteAlbums.length + fanNFTGallery.length}</Text>
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
            {fanUser.favoriteGenres && fanUser.favoriteGenres.length > 0 && (
              <View style={styles.genresCard}>
                <Text style={styles.statisticsTitle}>Favorite Genres</Text>
                {fanUser.favoriteGenres.map((genre, index) => (
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

            {/* Activity Summary - Public Only */}
            <View style={styles.activityCard}>
              <Text style={styles.statisticsTitle}>Activity Summary</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Playlists Created</Text>
                <Text style={styles.statValue}>{playlists.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Artists Followed</Text>
                <Text style={styles.statValue}>{fanFollowedArtists.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Albums in Library</Text>
                <Text style={styles.statValue}>{fanFavoriteAlbums.length}</Text>
              </View>
            </View>
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#A78BFA',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  spotifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  spotifyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 16,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#A78BFA',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#2D1B69',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#A78BFA',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  musicContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  featuredSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#70C3ED',
    fontWeight: '600',
  },
  featuredPlaylistCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 12,
  },
  featuredPlaylistImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  featuredPlaylistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredPlaylistDescription: {
    fontSize: 12,
    color: '#A78BFA',
  },
  horizontalList: {
    paddingRight: 20,
  },
  followedArtistsSection: {
    marginBottom: 24,
  },
  artistCard: {
    width: 120,
    marginRight: 16,
    alignItems: 'center',
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  artistGenre: {
    fontSize: 12,
    color: '#A78BFA',
    textAlign: 'center',
  },
  favoriteAlbumsSection: {
    marginBottom: 24,
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
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  albumArtist: {
    fontSize: 12,
    color: '#A78BFA',
  },
  collectionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#A78BFA',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  statisticsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  publicStatsCard: {
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#70C3ED',
  },
  genresCard: {
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  genreText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 16,
  },
  genreBar: {
    flex: 2,
    height: 6,
    backgroundColor: '#1E1B4B',
    borderRadius: 3,
  },
  genreBarFill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 3,
  },
  activityCard: {
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
});
