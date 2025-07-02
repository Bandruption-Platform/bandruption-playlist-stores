import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { X, Play, Clock, Heart, Share, Palette, ShoppingBag } from 'lucide-react-native';
import { Album } from '@shared/types';

interface AlbumDetailProps {
  album: Album;
  isOpen: boolean;
  onClose: () => void;
  onCreateNFT?: (album: Album) => void;
  onCreateMerch?: (album: Album) => void;
}

export function AlbumDetail({ album, isOpen, onClose, onCreateNFT, onCreateMerch }: AlbumDetailProps) {
  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Album Info */}
          <View style={styles.albumSection}>
            <View style={styles.albumCover}>
              <Image
                source={{ uri: album.imageUrl }}
                style={styles.albumImage}
              />
            </View>

            <View style={styles.albumInfo}>
              <Text style={styles.albumType}>ALBUM</Text>
              <Text style={styles.albumTitle}>{album.name}</Text>
              <Text style={styles.albumArtist}>{album.artist}</Text>
              
              <View style={styles.albumMeta}>
                <Text style={styles.metaText}>{new Date(album.releaseDate).getFullYear()}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.metaText}>{album.tracks.length} tracks</Text>
                <View style={styles.metaDot} />
                <Text style={styles.metaText}>{album.genre}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.playButton}>
                  <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.playButtonText}>Play</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Heart size={20} color="#9CA3AF" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Share size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {onCreateNFT && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => onCreateNFT(album)}
                  >
                    <Palette size={20} color="#10B981" />
                  </TouchableOpacity>
                )}

                {onCreateMerch && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => onCreateMerch(album)}
                  >
                    <ShoppingBag size={20} color="#F59E0B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Track Listing */}
          <View style={styles.trackSection}>
            <Text style={styles.sectionTitle}>Track Listing</Text>
            <View style={styles.trackList}>
              {album.tracks.map((track, index) => (
                <TouchableOpacity
                  key={track.id}
                  style={styles.trackItem}
                >
                  <View style={styles.trackNumber}>
                    <Text style={styles.trackNumberText}>{track.trackNumber}</Text>
                  </View>
                  
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackName}>{track.name}</Text>
                    {track.lyrics && (
                      <Text style={styles.trackLyrics} numberOfLines={1}>
                        {track.lyrics.slice(0, 50)}...
                      </Text>
                    )}
                  </View>

                  <View style={styles.trackDuration}>
                    <Clock size={16} color="#9CA3AF" />
                    <Text style={styles.durationText}>{formatDuration(track.duration)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  albumSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  albumCover: {
    width: 250,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  albumInfo: {
    alignItems: 'center',
    width: '100%',
  },
  albumType: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  albumTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  albumArtist: {
    fontSize: 20,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  albumMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  metaText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  trackSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  trackList: {
    gap: 4,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  trackNumber: {
    width: 32,
    alignItems: 'center',
  },
  trackNumberText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 16,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  trackLyrics: {
    fontSize: 14,
    color: '#6B7280',
  },
  trackDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});