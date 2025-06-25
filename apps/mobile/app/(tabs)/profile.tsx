import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, CreditCard as Edit, Wallet, Crown, Music, Palette, Users, ChartBar as BarChart3 } from 'lucide-react-native';
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
              {user?.spotifyConnected && (
                <View style={styles.spotifyBadge}>
                  <Music size={12} color="#1DB954" />
                  <Text style={styles.spotifyText}>Spotify Connected</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {user?.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Music size={20} color="#10B981" />
            <Text style={styles.statNumber}>{library.length}</Text>
            <Text style={styles.statLabel}>Albums</Text>
          </View>
          <View style={styles.statCard}>
            <Palette size={20} color="#8B5CF6" />
            <Text style={styles.statNumber}>{nftGallery.length}</Text>
            <Text style={styles.statLabel}>NFTs</Text>
          </View>
          <View style={styles.statCard}>
            <Crown size={20} color="#F59E0B" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Merch</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={20} color="#EF4444" />
            <Text style={styles.statNumber}>847</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Edit size={20} color="#10B981" />
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Wallet size={20} color="#10B981" />
            <Text style={styles.actionText}>Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'nfts' && styles.activeTab]}
            onPress={() => setActiveTab('nfts')}
          >
            <Text style={[styles.tabText, activeTab === 'nfts' && styles.activeTabText]}>
              NFT Gallery
            </Text>
          </TouchableOpacity>
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
          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <BarChart3 size={20} color="#10B981" />
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
              <Text style={styles.analyticsTitle}>Top Genres</Text>
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
    backgroundColor: '#0A0A0A',
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
    color: '#9CA3AF',
    marginBottom: 8,
  },
  spotifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  spotifyText: {
    fontSize: 12,
    color: '#1DB954',
    marginLeft: 4,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 8,
  },
  bio: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
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
    color: '#9CA3AF',
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
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionText: {
    color: '#10B981',
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
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#10B981',
  },
  analyticsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  analyticsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    color: '#9CA3AF',
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
    backgroundColor: '#374151',
    borderRadius: 4,
    marginLeft: 12,
  },
  genreBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
});