import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { DollarSign, Eye, Share, Palette } from 'lucide-react-native';
import { NFT } from '@shared/types';

interface NFTGalleryProps {
  nfts: NFT[];
}

export function NFTGallery({ nfts }: NFTGalleryProps) {
  const renderNFTItem = ({ item }: { item: NFT }) => (
    <View style={styles.nftCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.actionButton}>
            <Eye size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.nftInfo}>
        <Text style={styles.nftTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.nftDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.nftFooter}>
          <View style={styles.priceContainer}>
            <DollarSign size={14} color="#CDFF6A" />
            <Text style={styles.price}>{item.price} ALGO</Text>
          </View>
          {item.forSale && (
            <View style={styles.forSaleBadge}>
              <Text style={styles.forSaleText}>For Sale</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (nfts.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Palette size={48} color="#A78BFA" />
        <Text style={styles.emptyStateTitle}>No NFTs yet</Text>
        <Text style={styles.emptyStateText}>
          Generate your first NFT from your music collection
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={nfts}
      numColumns={2}
      renderItem={renderNFTItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nftCard: {
    flex: 1,
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
    overflow: 'hidden',
    margin: 8,
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
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nftInfo: {
    padding: 12,
  },
  nftTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E7FF',
    marginBottom: 4,
  },
  nftDescription: {
    fontSize: 12,
    color: '#C4B5FD',
    lineHeight: 16,
    marginBottom: 12,
  },
  nftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CDFF6A',
    marginLeft: 4,
  },
  forSaleBadge: {
    backgroundColor: '#CDFF6A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  forSaleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#C4B5FD',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#A78BFA',
    textAlign: 'center',
    lineHeight: 22,
  },
});