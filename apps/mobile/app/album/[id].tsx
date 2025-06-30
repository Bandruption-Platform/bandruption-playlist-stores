import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Play, Heart, Share, Clock, Palette, ShoppingBag, Plus, Zap } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { Album } from '@shared/types';
import { NFTGenerationModal } from '@/components/NFTGenerationModal';

export default function AlbumDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { library } = useAppStore();
  const [isLiked, setIsLiked] = useState(false);
  const [showNFTModal, setShowNFTModal] = useState(false);

  // Find the album by ID
  const album = library.find(a => a.id === id);

  if (!album) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Album not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalDuration = album.tracks.reduce((acc, track) => acc + track.duration, 0);
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Share size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Album Cover and Info */}
        <View style={styles.albumSection}>
          <View style={styles.albumCoverContainer}>
            <Image source={{ uri: album.imageUrl }} style={styles.albumCover} />
            
            {/* Play Button Overlay */}
            <TouchableOpacity style={styles.playButtonOverlay}>
              <Play size={32} color="#000000" fill="#000000" />
            </TouchableOpacity>
          </View>

          <View style={styles.albumInfo}>
            <Text style={styles.albumTitle}>{album.name}</Text>
            <Text style={styles.artistName}>{album.artist}</Text>
            <Text style={styles.albumMeta}>
              {new Date(album.releaseDate).getFullYear()} • {album.genre} • {album.tracks.length} tracks • {formatTotalDuration(totalDuration)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Play size={20} color="#000000" fill="#000000" />
              <Text style={styles.primaryButtonText}>Play</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.addButton, isLiked && styles.likedButton]}
              onPress={() => setIsLiked(!isLiked)}
            >
              <Heart size={20} color={isLiked ? "#EF4444" : "#A78BFA"} fill={isLiked ? "#EF4444" : "none"} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color="#A78BFA" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowNFTModal(true)}
            >
              <Zap size={20} color="#CDFF6A" />
            </TouchableOpacity>
            
          </View>
        </View>

        {/* Creative Actions */}
        <View style={styles.creativeSection}>
          <Text style={styles.sectionTitle}>Create & Collect</Text>
          
          <TouchableOpacity 
            style={styles.creativeCard}
            onPress={() => setShowNFTModal(true)}
          >
            <View style={styles.creativeCardIcon}>
              <Palette size={24} color="#A78BFA" />
            </View>
            <View style={styles.creativeCardContent}>
              <Text style={styles.creativeCardTitle}>Generate AI Artwork</Text>
              <Text style={styles.creativeCardDescription}>
                Transform this album cover into unique AI-generated art
              </Text>
            </View>
            <View style={styles.creativeCardArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.creativeCard}
            onPress={() => router.push('/merchandise')}
          >
            <View style={styles.creativeCardIcon}>
              <ShoppingBag size={24} color="#A78BFA" />
            </View>
            <View style={styles.creativeCardContent}>
              <Text style={styles.creativeCardTitle}>View Merchandise</Text>
              <Text style={styles.creativeCardDescription}>
                Discover official and fan-created merchandise
              </Text>
            </View>
            <View style={styles.creativeCardArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Track List */}
        <View style={styles.trackSection}>
          <Text style={styles.sectionTitle}>Tracks</Text>
          
          {album.tracks.map((track, index) => (
            <TouchableOpacity key={track.id} style={styles.trackItem}>
              <View style={styles.trackNumber}>
                <Text style={styles.trackNumberText}>{track.trackNumber || index + 1}</Text>
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
                <Text style={styles.trackDurationText}>{formatDuration(track.duration)}</Text>
              </View>
              
              <TouchableOpacity style={styles.trackAction}>
                <Play size={16} color="#A78BFA" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Album Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Album Details</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Release Date</Text>
            <Text style={styles.detailValue}>
              {new Date(album.releaseDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Genre</Text>
            <Text style={styles.detailValue}>{album.genre}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Duration</Text>
            <Text style={styles.detailValue}>{formatTotalDuration(totalDuration)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Number of Tracks</Text>
            <Text style={styles.detailValue}>{album.tracks.length}</Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* NFT Generation Modal */}
      <NFTGenerationModal
        visible={showNFTModal}
        onClose={() => setShowNFTModal(false)}
        albums={[album]}
      />
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(45, 27, 105, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  albumSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  albumCoverContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  albumCover: {
    width: 280,
    height: 280,
    borderRadius: 16,
  },
  playButtonOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
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
    borderWidth: 1,
    borderColor: '#9BC53D',
  },
  albumInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  albumTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 20,
    color: '#A78BFA',
    fontWeight: '600',
    marginBottom: 8,
  },
  albumMeta: {
    fontSize: 14,
    color: '#8B5CF6',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CDFF6A',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: '#9BC53D',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2D1B69',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A0D33',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#CDFF6A',
  },
  likedButton: {
    backgroundColor: '#F87171',
    borderColor: '#EF4444',
  },
  creativeSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  creativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  creativeCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4C1D95',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  creativeCardContent: {
    flex: 1,
  },
  creativeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  creativeCardDescription: {
    fontSize: 14,
    color: '#A78BFA',
    lineHeight: 20,
  },
  creativeCardArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 18,
    color: '#CDFF6A',
    fontWeight: '600',
  },
  trackSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4C1D95',
  },
  trackNumber: {
    width: 32,
    alignItems: 'center',
    marginRight: 16,
  },
  trackNumberText: {
    fontSize: 16,
    color: '#A78BFA',
    fontWeight: '500',
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  trackLyrics: {
    fontSize: 12,
    color: '#8B5CF6',
  },
  trackDuration: {
    marginRight: 16,
  },
  trackDurationText: {
    fontSize: 14,
    color: '#A78BFA',
  },
  trackAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D1B69',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4C1D95',
  },
  detailLabel: {
    fontSize: 16,
    color: '#A78BFA',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#70c3ed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9BC53D',
  },
  backButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});