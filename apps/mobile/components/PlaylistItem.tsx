import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Play, MoveVertical as MoreVertical, Lock, Globe } from 'lucide-react-native';
import { router } from 'expo-router';
import { Playlist } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface PlaylistItemProps {
  playlist: Playlist;
  onPress?: () => void;
}

export function PlaylistItem({ playlist, onPress }: PlaylistItemProps) {
  const { library } = useAppStore();
  
  const getTotalDuration = () => {
    let totalSeconds = 0;
    playlist.items.forEach(item => {
      const album = library.find(a => a.id === item.albumId);
      const track = album?.tracks.find(t => t.id === item.trackId);
      if (track) {
        totalSeconds += track.duration;
      }
    });
    return totalSeconds;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date: Date) => {
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
      <Image source={{ uri: playlist.imageUrl }} style={styles.image} />
      
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{playlist.name}</Text>
          <View style={styles.privacyIcon}>
            {playlist.isPublic ? (
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
          <Text style={styles.metadataText}>{playlist.items.length} songs</Text>
          <View style={styles.dot} />
          <Text style={styles.metadataText}>{formatDuration(getTotalDuration())}</Text>
          <View style={styles.dot} />
          <Text style={styles.metadataText}>Updated {formatDate(playlist.updatedAt)}</Text>
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
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
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