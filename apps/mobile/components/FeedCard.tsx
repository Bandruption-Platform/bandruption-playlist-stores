import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share, Palette, Music } from 'lucide-react-native';

interface FeedCardProps {
  type: 'nft_created' | 'album_added' | 'merch_created';
  user: string;
  content: string;
  image: string;
  timestamp: Date;
}

export function FeedCard({ type, user, content, image, timestamp }: FeedCardProps) {
  const getTypeIcon = () => {
    switch (type) {
      case 'nft_created':
        return <Palette size={16} color="#8B5CF6" />;
      case 'album_added':
        return <Music size={16} color="#10B981" />;
      case 'merch_created':
        return <Heart size={16} color="#F59E0B" />;
      default:
        return <Music size={16} color="#10B981" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user[0].toUpperCase()}</Text>
          </View>
          <View style={styles.userDetails}>
            <View style={styles.usernameLine}>
              <Text style={styles.username}>{user}</Text>
              {getTypeIcon()}
            </View>
            <Text style={styles.timestamp}>{formatTimestamp(timestamp)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.content}>{content}</Text>

      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Heart size={20} color="#9CA3AF" />
          <Text style={styles.actionText}>24</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={20} color="#9CA3AF" />
          <Text style={styles.actionText}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Share size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  usernameLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  content: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
});