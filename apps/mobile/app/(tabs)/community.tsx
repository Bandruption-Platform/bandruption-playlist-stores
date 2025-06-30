import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Heart, MessageCircle, Share, Music, Plus, Search, X } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';

// Mock community feed data
const mockCommunityFeed = [
  {
    id: 'post1',
    user: {
      id: 'user1',
      username: 'synthmaster',
      avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
      isFollowing: true,
    },
    type: 'nft_created',
    content: 'Just minted a new cyberpunk NFT from Digital Horizons!✨',
    imageUrl: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=300',
    albumRef: {
      name: 'Digital Horizons',
      artist: 'Cyber Symphony',
    },
    likes: 24,
    comments: 8,
    timestamp: '2h ago',
    isLiked: false,
  },
  {
    id: 'post2',
    user: {
      id: 'user2',
      username: 'beatdreamer',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      isFollowing: true,
    },
    type: 'playlist_shared',
    content: 'Created the perfect late-night coding playlist! Check it out 🌙💻',
    playlistRef: {
      name: 'Midnight Code Sessions',
      trackCount: 24,
      coverUrl: 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    likes: 42,
    comments: 15,
    timestamp: '4h ago',
    isLiked: true,
  },
];

export default function CommunityScreen() {
  const { user, fanUsers } = useAppStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(fanUsers || []);

  const handleLike = (postId: string) => {
    console.log('Liked post:', postId);
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const handleProfilePress = () => {
    console.log('Profile pressed');
  };

  const handleSearchPress = () => {
    setSearchModalVisible(true);
  };

  const handleUserPress = (userId: string) => {
    console.log('Navigate to user:', userId);
    setSearchModalVisible(false);
    router.push(`/fan/${userId}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredUsers(fanUsers || []);
    } else {
      const filtered = (fanUsers || []).filter(
        user =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleFollowToggle = (userId: string) => {
    console.log('Toggle follow for user:', userId);
  };

  const renderFeedItem = ({ item }: { item: any }) => (
    <View style={styles.feedItem}>
      <View style={styles.userHeader}>
        <TouchableOpacity onPress={() => handleUserPress(item.user.id)}>
          <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.userInfo} onPress={() => handleUserPress(item.user.id)}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Following</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}

      {item.albumRef && (
        <View style={styles.referenceCard}>
          <View style={styles.refInfo}>
            <Text style={styles.refTitle}>{item.albumRef.name}</Text>
            <Text style={styles.refSubtitle}>{item.albumRef.artist}</Text>
          </View>
          <Music size={20} color="#A78BFA" />
        </View>
      )}

      {item.playlistRef && (
        <View style={styles.referenceCard}>
          <Image source={{ uri: item.playlistRef.coverUrl }} style={styles.refImage} />
          <View style={styles.refInfo}>
            <Text style={styles.refTitle}>{item.playlistRef.name}</Text>
            <Text style={styles.refSubtitle}>{item.playlistRef.trackCount} tracks</Text>
          </View>
          <Music size={20} color="#A78BFA" />
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Heart 
            size={20} 
            color={item.isLiked ? "#EF4444" : "#A78BFA"} 
            fill={item.isLiked ? "#EF4444" : "none"}
          />
          <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleComment(item.id)}
        >
          <MessageCircle size={20} color="#A78BFA" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(item.id)}
        >
          <Share size={20} color="#A78BFA" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.userItem}>
      <TouchableOpacity onPress={() => handleUserPress(item.id)} style={styles.userItemContent}>
        <Image source={{ uri: item.profileImage || item.avatar_url }} style={styles.userItemAvatar} />
        <View style={styles.userItemInfo}>
          <Text style={styles.userItemName}>{item.username}</Text>
          <Text style={styles.userItemUsername}>@{item.username}</Text>
          <Text style={styles.userItemBio} numberOfLines={2}>
            {item.bio}
          </Text>
          <Text style={styles.userItemStats}>
            Music lover • Creator
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.followUserButton}
        onPress={() => handleFollowToggle(item.id)}
      >
        <Text style={styles.followUserButtonText}>
          Follow
        </Text>
      </TouchableOpacity>
    </View>
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Profile Button and Search */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>See what your friends are creating</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
            <Search size={20} color="#A78BFA" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
            <Image 
              source={{ uri: user.profileImage }} 
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Community Feed */}
      <FlatList
        data={mockCommunityFeed}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Plus size={24} color="#000000" />
      </TouchableOpacity>

      {/* User Search Modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.searchModal}>
          <View style={styles.searchHeader}>
            <Text style={styles.searchTitle}>Find Friends</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSearchModalVisible(false)}
            >
              <X size={24} color="#A78BFA" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchInputContainer}>
            <Search size={20} color="#A78BFA" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor="#A78BFA"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.usersList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4C1D95',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#A78BFA',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D1B69',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#CDFF6A',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  feedContainer: {
    paddingBottom: 100,
  },
  feedItem: {
    backgroundColor: '#2D1B69',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#A78BFA',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#4C1D95',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#70C3ED',
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#70C3ED',
  },
  postContent: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  referenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  refImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  refInfo: {
    flex: 1,
  },
  refTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  refSubtitle: {
    fontSize: 12,
    color: '#A78BFA',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#4C1D95',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#A78BFA',
    marginLeft: 6,
    fontWeight: '500',
  },
  likedText: {
    color: '#EF4444',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#CDFF6A',
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
  // Search Modal Styles
  searchModal: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4C1D95',
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D1B69',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#FFFFFF',
  },
  usersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  userItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userItemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  userItemInfo: {
    flex: 1,
  },
  userItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userItemUsername: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 4,
  },
  userItemBio: {
    fontSize: 13,
    color: '#C4B5FD',
    marginBottom: 4,
    lineHeight: 18,
  },
  userItemStats: {
    fontSize: 12,
    color: '#8B5CF6',
  },
  followUserButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  followingUserButton: {
    backgroundColor: '#2D1B69',
    borderWidth: 1,
    borderColor: '#A78BFA',
  },
  followUserButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  followingUserButtonText: {
    color: '#A78BFA',
  },
});
