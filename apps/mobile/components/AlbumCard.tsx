import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { Play, MoveVertical as MoreVertical } from 'lucide-react-native';
import { Album } from '@shared/types';

interface AlbumCardProps {
  album: Album;
  style?: ViewStyle;
  showArtist?: boolean;
  onPress?: () => void;
}

export function AlbumCard({ album, style, showArtist = false, onPress }: AlbumCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to album details page
      router.push(`/album/${album.id}`);
    }
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: album.imageUrl }} style={styles.image} />
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.playButton}>
            <Play size={20} color="#000000" fill="#000000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{album.name}</Text>
        {showArtist && (
          <Text style={styles.artist} numberOfLines={1}>{album.artist}</Text>
        )}
        <Text style={styles.genre}>{album.genre}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: 12,
    opacity: 0,
  },
  playButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(205, 255, 106, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    alignSelf: 'flex-start',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 12,
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
  genre: {
    fontSize: 12,
    color: '#CDFF6A',
    fontWeight: '500',
  },
});