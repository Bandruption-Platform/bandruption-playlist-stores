import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Play, MoveVertical as MoreVertical, Lock, Globe, Star } from 'lucide-react-native';
import { router } from 'expo-router';
import { Playlist } from '@shared/types';

interface PlaylistItemProps {
  playlist: Playlist;
  onPress?: () => void;
  showFeaturedBadge?: boolean;
}

export function PlaylistItem({ playlist, onPress, showFeaturedBadge = false }: PlaylistItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/playlist/${playlist.id}`);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: playlist.coverImage || playlist.cover_image }} 
          style={styles.image} 
        />
        {playlist.isFeatured && showFeaturedBadge && (
          <View style={styles.featuredBadge}>
            <Star size={12} color="#CDFF6A" fill="#CDFF6A" />
          </View>
        )}
      </View>
      
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{playlist.title}</Text>
          <View style={styles.privacyIcon}>
            {playlist.is_public ? (
              <Globe size={14} color="#70C3ED" />
            ) : (
              <Lock size={14} color="#A78BFA" />
            )}
          </View>
        </View>
        
        {playlist.description && (
          <Text style={styles.description} numberOfLines={2}>{playlist.description}</Text>
        )}
        
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            {playlist.is_public ? 'Public' : 'Private'} playlist
          </Text>
          <View style={styles.dot} />
          <Text style={styles.metadataText}>Updated {formatDate(playlist.updated_at)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Play size={18} color="#CDFF6A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MoreVertical size={18} color="#A78BFA" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1E1B4B',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  featuredBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#1E1B4B',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CDFF6A',
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  privacyIcon: {
    padding: 2,
  },
  description: {
    fontSize: 14,
    color: '#C4B5FD',
    marginBottom: 6,
    lineHeight: 18,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: '#A78BFA',
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#A78BFA',
    marginHorizontal: 6,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});