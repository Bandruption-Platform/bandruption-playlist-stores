import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Play, MoveVertical as MoreVertical, Clock } from 'lucide-react-native';
import { Album } from '@shared/types';

interface AlbumListItemProps {
  album: Album;
  onPress?: () => void;
}

export function AlbumListItem({ album, onPress }: AlbumListItemProps) {
  const totalDuration = album.tracks.reduce((acc, track) => acc + track.duration, 0);
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to album details page
      router.push(`/album/${album.id}`);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: album.imageUrl }} style={styles.image} />
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{album.name}</Text>
        <Text style={styles.artist} numberOfLines={1}>{album.artist}</Text>
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>{album.tracks.length} tracks</Text>
          <View style={styles.dot} />
          <Text style={styles.metadataText}>{formatDuration(totalDuration)}</Text>
          <View style={styles.dot} />
          <Text style={styles.genre}>{album.genre}</Text>
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E7FF',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#C4B5FD',
    marginBottom: 4,
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
  genre: {
    fontSize: 12,
    color: '#CDFF6A',
    fontWeight: '500',
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