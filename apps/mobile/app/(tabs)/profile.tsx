import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Edit, Wallet, Crown, Music, Palette, Users, ChartBar as BarChart3 } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { NFTGallery } from '@/components/NFTGallery';

export default function ProfileScreen() {
  const { user, nftGallery, library } = useAppStore();
  const [activeTab, setActiveTab] = useState<'nfts' | 'stats'>('nfts');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: user?.profileImage }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{user?.username}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <View style={styles.badgeContainer}>
                {user?.spotifyConnected && (
                  <View style={styles.spotifyBadge}>
                    <Music size={12} color="#1DB954" />
                    <Text style={styles.spotifyText}>Spotify Connected</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.walletBadge}>
                  <Wallet size={12} color="#70C3ED" />
                  <Text style={styles.walletText}>Wallet</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={24} color="#A78BFA" />
            </TouchableOpacity>
          </View>

          {user?.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.bio}>{user.bio}</Text>
              <TouchableOpacity style={styles.editProfileButton}>
                <Edit size={14} color="#CDFF6A" />
                <Text style={styles.editProfileText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          
          {/* Playlists Tab */}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'nfts' && styles.activeTab]}
            onPress={() => setActiveTab('nfts')}
          >
            <Text style={[styles.tabText, activeTab === 'nfts' && styles.activeTabText]}>
              Playlists
            </Text>
          </TouchableOpacity>
          
          {/* NFT Gallery Tab */}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'nfts' && styles.activeTab]}
            onPress={() => setActiveTab('nfts')}
          >
            <Text style={[styles.tabText, activeTab === 'nfts' && styles.activeTabText]}>
              NFT Gallery
            </Text>
          </TouchableOpacity>

          {/* Analytics Tab */}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
              Analytics
            </Text>
          </TouchableOpacity>

        </View>

        {/* Tab Content */}
        {activeTab === 'nfts' ? (
          <NFTGallery nfts={nftGallery} />
        ) : (

          // Analytics Tab
          <View style={styles.analyticsContainer}>

            {/* Stats Cards */}
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <BarChart3 size={20} color="#70C3ED" />
                <Text style={styles.analyticsTitle}>Statistics</Text>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Music size={20} color="#CDFF6A" />
                  <Text style={styles.statNumber}>{library.length}</Text>
                  <Text style={styles.statLabel}>Albums</Text>
                </View>
                <View style={styles.statCard}>
                  <Palette size={20} color="#A78BFA" />
                  <Text style={styles.statNumber}>{nftGallery.length}</Text>
                  <Text style={styles.statLabel}>NFTs</Text>
                </View>
                <View style={styles.statCard}>
                  <Crown size={20} color="#CDFF6A" />
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Merch</Text>
                </View>
                <View style={styles.statCard}>
                  <Users size={20} color="#70C3ED" />
                  <Text style={styles.statNumber}>847</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
              </View>
            </View>

            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <BarChart3 size={20} color="#70C3ED" />
                <Text style={styles.analyticsTitle}>This Month</Text>
              </View>
              <View style={styles.analyticsRow}>
                <Text style={styles.analyticsLabel}>NFTs Created</Text>
                <Text style={styles.analyticsValue}>3</Text>
              </View>
              <View style={styles.analyticsRow}>
                <Text style={styles.analyticsLabel}>Total Earnings</Text>
                <Text style={styles.analyticsValue}>$127.50</Text>
              </View>
              <View style={styles.analyticsRow}>
                <Text style={styles.analyticsLabel}>Merch Sales</Text>
                <Text style={styles.analyticsValue}>8 items</Text>
              </View>
            </View>

            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <BarChart3 size={20} color="#70C3ED" />
                <Text style={styles.analyticsTitle}>Top Genres</Text>
              </View>
              {user?.favoriteGenres?.map((genre, index) => (
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  spotifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  spotifyText: {
    fontSize: 12,
    color: '#1DB954',
    marginLeft: 4,
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#70C3ED',
  },
  walletText: {
    fontSize: 12,
    color: '#70C3ED',
    marginLeft: 4,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 8,
  },
  bioSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  bio: {
    fontSize: 16,
    color: '#E0E7FF',
    lineHeight: 22,
    flex: 1,
    marginRight: 12,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CDFF6A',
  },
  editProfileText: {
    fontSize: 12,
    color: '#CDFF6A',
    fontWeight: '500',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#C4B5FD',
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D1B69',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  actionText: {
    color: '#CDFF6A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  analyticsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  analyticsCard: {
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  analyticsLabel: {
    fontSize: 16,
    color: '#C4B5FD',
  },
  analyticsValue: {
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