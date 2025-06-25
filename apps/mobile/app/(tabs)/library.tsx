import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Grid2x2 as Grid, List, Layers, MoveHorizontal as MoreHorizontal, Plus, Filter } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { AlbumCard } from '@/components/AlbumCard';
import { AlbumListItem } from '@/components/AlbumListItem';
import { DraftsTab } from '@/components/DraftsTab';
import { NFTGenerationModal } from '@/components/NFTGenerationModal';

type LibraryTab = 'albums' | 'drafts';

export default function LibraryScreen() {
  const { library, libraryView, setLibraryView, drafts } = useAppStore();
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

  const renderContent = () => {
    if (activeTab === 'drafts') {
      return <DraftsTab drafts={drafts} />;
    }

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
          <Plus size={20} color="#10B981" />
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
                  color={libraryView === view ? '#10B981' : '#9CA3AF'} 
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={18} color="#9CA3AF" />
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
    backgroundColor: '#0A0A0A',
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
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#FFFFFF',
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
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 4,
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeViewButton: {
    backgroundColor: '#064E3B',
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
});