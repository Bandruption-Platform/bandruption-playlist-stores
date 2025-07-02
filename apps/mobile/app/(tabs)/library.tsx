import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Grid2x2 as Grid, List, Layers, MoveHorizontal as MoreHorizontal, Plus, Filter } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { AlbumCard } from '@/components/AlbumCard';
import { AlbumListItem } from '@/components/AlbumListItem';
import { PlaylistItem } from '@/components/PlaylistItem';
import { DraftsTab } from '@/components/DraftsTab';
import { NFTGenerationModal } from '@/components/NFTGenerationModal';

type LibraryTab = 'albums' | 'playlists' | 'drafts';

export default function LibraryScreen() {
  const { library, playlists, libraryView, setLibraryView, drafts } = useAppStore();
  const [activeTab, setActiveTab] = useState<LibraryTab>('albums');
  const [showNFTModal, setShowNFTModal] = useState(false);

  const viewIcons = {
    blocks: Grid,
    details: List,
    stack: Layers,
    list: MoreHorizontal,
  };

  const renderAlbumBlocks = () => (
    <FlatList
      data={library}
      numColumns={2}
      key="blocks"
      renderItem={({ item }) => (
        <AlbumCard
          album={item}
          style={styles.blockCard}
          showArtist={true}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.blocksContainer}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderAlbumList = () => (
    <FlatList
      data={library}
      key="list"
      renderItem={({ item }) => (
        <AlbumListItem album={item} />
      )}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderPlaylistList = () => (
    <FlatList
      data={playlists}
      key="playlists"
      renderItem={({ item }) => (
        <PlaylistItem playlist={item} />
      )}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.playlistContainer}
    />
  );

  const renderContent = () => {
    if (activeTab === 'drafts') {
      return <DraftsTab drafts={drafts} />;
    }

    if (activeTab === 'playlists') {
      return playlists.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No playlists yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first playlist to organize your favorite tracks
          </Text>
          <TouchableOpacity style={styles.createPlaylistButton}>
            <Plus size={20} color="#000000" />
            <Text style={styles.createPlaylistButtonText}>Create Playlist</Text>
          </TouchableOpacity>
        </View>
      ) : (
        renderPlaylistList()
      );
    }

    // Albums tab
    switch (libraryView) {
      case 'blocks':
      case 'stack':
        return renderAlbumBlocks();
      case 'details':
      case 'list':
        return renderAlbumList();
      default:
        return renderAlbumBlocks();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => setShowNFTModal(true)}
        >
          <Plus size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'albums' && styles.activeTab]}
          onPress={() => setActiveTab('albums')}
        >
          <Text style={[styles.tabText, activeTab === 'albums' && styles.activeTabText]}>
            Albums ({library.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'playlists' && styles.activeTab]}
          onPress={() => setActiveTab('playlists')}
        >
          <Text style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText]}>
            Playlists ({playlists.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drafts' && styles.activeTab]}
          onPress={() => setActiveTab('drafts')}
        >
          <Text style={[styles.tabText, activeTab === 'drafts' && styles.activeTabText]}>
            Drafts ({drafts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Controls (only for albums tab) */}
      {activeTab === 'albums' && (
        <View style={styles.controls}>
          <View style={styles.viewToggle}>
            {Object.entries(viewIcons).map(([view, Icon]) => (
              <TouchableOpacity
                key={view}
                style={[
                  styles.viewButton,
                  libraryView === view && styles.activeViewButton
                ]}
                onPress={() => setLibraryView(view as any)}
              >
                <Icon 
                  size={18} 
                  color={libraryView === view ? '#70C3ED' : '#A78BFA'} 
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={18} color="#A78BFA" />
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Controls for Playlists */}
      {activeTab === 'playlists' && playlists.length > 0 && (
        <View style={styles.controls}>
          <View style={styles.playlistFilters}>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Public</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Private</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={18} color="#A78BFA" />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* NFT Generation Modal */}
      <NFTGenerationModal
        visible={showNFTModal}
        onClose={() => setShowNFTModal(false)}
        albums={library}
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  generateButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#CDFF6A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9BC53D',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#2D1B69',
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  activeTab: {
    backgroundColor: '#CDFF6A',
    borderColor: '#9BC53D',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  activeTabText: {
    color: '#000000',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#2D1B69',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeViewButton: {
    backgroundColor: '#4A9BC7',
  },
  playlistFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2D1B69',
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A78BFA',
  },
  filterButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  blocksContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  blockCard: {
    flex: 1,
    margin: 8,
  },
  playlistContainer: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#C4B5FD',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#A78BFA',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CDFF6A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9BC53D',
  },
  createPlaylistButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
});