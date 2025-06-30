import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Play, Shuffle, MoveVertical as MoreVertical, Download, Share, Heart, Globe, Lock } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { Track, Album } from '../../types';

interface PlaylistTrack extends Track {
  album: Album;
  addedAt: Date;
}

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { playlists, library } = useAppStore();
  
  const playlist = playlists.find(p => p.id === id);
  
  if (!playlist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Playlist not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Get all tracks with their album information
  const playlistTracks: PlaylistTrack[] = playlist.items.map(item => {
    const album = library.find(a => a.id === item.albumId);
    const track = album?.tracks.find(t => t.id === item.trackId);
    
    if (!album || !track) return null;
    
    return {
      ...track,
      album,
      addedAt: item.addedAt
    };
  }).filter(Boolean) as PlaylistTrack[];

  const getTotalDuration = () => {
    return playlistTracks.reduce((total, track) => total + track.duration, 0);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTrackDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTrackItem = ({ item, index }: { item: PlaylistTrack; index: number }) => (
    <TouchableOpacity style={styles.trackItem}>
      <View style={styles.trackNumber}>
        <Text style={styles.trackNumberText}>{index + 1}</Text>
      </View>
      
      <Image source={{ uri: item.album.imageUrl }} style={styles.trackAlbumImage} />
      
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>{item.album.artist}</Text>
        <Text style={styles.trackAlbum} numberOfLines={1}>{item.album.name}</Text>
      </View>
      
      <View style={styles.trackMeta}>
        <Text style={styles.trackDuration}>{formatTrackDuration(item.duration)}</Text>
        <TouchableOpacity style={styles.trackMoreButton}>
          <MoreVertical size={16} color="#A78BFA" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color="#A78BFA" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Playlist Header */}
        <View style={styles.playlistHeader}>
          <Image source={{ uri: playlist.imageUrl }} style={styles.playlistImage} />
          
          <View style={styles.playlistInfo}>
            <View style={styles.playlistTitleRow}>
              <Text style={styles.playlistTitle}>{playlist.name}</Text>
              <View style={styles.privacyBadge}>
                {playlist.isPublic ? (
                  <Globe size={16} color="#70C3ED" />
                ) : (
                  <Lock size={16} color="#A78BFA" />
                )}
                <Text style={[styles.privacyText, { color: playlist.isPublic ? '#70C3ED' : '#A78BFA' }]}>
                  {playlist.isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
            </View>
            
            {playlist.description && (
              <Text style={styles.playlistDescription}>{playlist.description}</Text>
            )}
            
            <View style={styles.playlistStats}>
              <Text style={styles.statsText}>
                {playlistTracks.length} songs • {formatDuration(getTotalDuration())}
              </Text>
              <Text style={styles.statsText}>
                Created {formatDate(playlist.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.playButton}>
            <Play size={20} color="#000000" fill="#000000" />
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shuffleButton}>
            <Shuffle size={20} color="#CDFF6A" />
            <Text style={styles.shuffleButtonText}>Shuffle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton}>
            <Download size={20} color="#A78BFA" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton}>
            <Share size={20} color="#A78BFA" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton}>
            <Heart size={20} color="#A78BFA" />
          </TouchableOpacity>
        </View>

        {/* Track List */}
        <View style={styles.trackList}>
          <Text style={styles.trackListTitle}>Songs</Text>
          
          {playlistTracks.length === 0 ? (
            <View style={styles.emptyTracks}>
              <Text style={styles.emptyTracksText}>No songs in this playlist yet</Text>
            </View>
          ) : (
            <FlatList
              data={playlistTracks}
              renderItem={renderTrackItem}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  moreButton: {
    padding: 4,
  },
  playlistHeader: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  playlistImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  playlistInfo: {
    alignItems: 'center',
  },
  playlistTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playlistTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginRight: 12,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  playlistDescription: {
    fontSize: 16,
    color: '#C4B5FD',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  playlistStats: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CDFF6A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#9BC53D',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#CDFF6A',
  },
  shuffleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#CDFF6A',
    marginLeft: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D1B69',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  trackList: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  trackListTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D1B69',
  },
  trackNumber: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  trackNumberText: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '500',
  },
  trackAlbumImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 14,
    color: '#C4B5FD',
    marginBottom: 2,
  },
  trackAlbum: {
    fontSize: 12,
    color: '#A78BFA',
  },
  trackMeta: {
    alignItems: 'flex-end',
  },
  trackDuration: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 4,
  },
  trackMoreButton: {
    padding: 4,
  },
  emptyTracks: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTracksText: {
    fontSize: 16,
    color: '#A78BFA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#C4B5FD',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#CDFF6A',
    fontWeight: '600',
  },
});