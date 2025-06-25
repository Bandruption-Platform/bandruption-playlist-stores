import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { Play, MoveVertical as MoreVertical } from 'lucide-react-native';
import { Album } from '@shared/types';

interface AlbumCardProps {
  album: Album;
  style?: ViewStyle;
  showArtist?: boolean;
  onPress?: () => void;
}

export function AlbumCard({ album, style, showArtist = false, onPress }: AlbumCardProps) {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: album.imageUrl }} style={styles.image} />
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.playButton}>
            <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
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
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
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
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  genre: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
});