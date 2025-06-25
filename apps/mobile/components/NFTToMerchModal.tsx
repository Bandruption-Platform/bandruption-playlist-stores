import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { X, ShoppingBag, DollarSign } from 'lucide-react-native';
import { NFT, MerchType } from '@shared/types';

interface NFTToMerchModalProps {
  visible: boolean;
  onClose: () => void;
  nfts: NFT[];
}

const merchTypes: { value: MerchType; label: string; basePrice: number }[] = [
  { value: 'tshirt', label: 'T-Shirt', basePrice: 24.99 },
  { value: 'hoodie', label: 'Hoodie', basePrice: 44.99 },
  { value: 'poster', label: 'Poster', basePrice: 19.99 },
  { value: 'sticker', label: 'Sticker Pack', basePrice: 9.99 },
  { value: 'vinyl', label: 'Vinyl Mockup', basePrice: 34.99 },
];

export function NFTToMerchModal({ visible, onClose, nfts }: NFTToMerchModalProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [selectedMerchType, setSelectedMerchType] = useState<MerchType>('tshirt');
  const [selectedLicense, setSelectedLicense] = useState<'personal' | 'commercial'>('personal');

  const getLicensePrice = () => {
    const basePrice = merchTypes.find(t => t.value === selectedMerchType)?.basePrice || 0;
    return selectedLicense === 'commercial' ? basePrice + 10 : basePrice;
  };

  const handleCreateMerch = () => {
    if (!selectedNFT) return;
    
    // Here would be the logic to create merchandise
    console.log('Creating merch:', {
      nft: selectedNFT,
      merchType: selectedMerchType,
      license: selectedLicense,
      price: getLicensePrice()
    });
    
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ShoppingBag size={24} color="#10B981" />
            <Text style={styles.title}>Create Merchandise</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* NFT Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select NFT Artwork</Text>
            {nfts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No NFTs available</Text>
                <Text style={styles.emptyStateSubtext}>Create some NFTs first to turn them into merchandise</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nftScroll}>
                {nfts.map((nft) => (
                  <TouchableOpacity
                    key={nft.id}
                    style={[
                      styles.nftCard,
                      selectedNFT?.id === nft.id && styles.selectedNFT
                    ]}
                    onPress={() => setSelectedNFT(nft)}
                  >
                    <Image source={{ uri: nft.imageUrl }} style={styles.nftImage} />
                    <Text style={styles.nftName} numberOfLines={1}>{nft.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {selectedNFT && (
            <>
              {/* Product Type Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Product Type</Text>
                <View style={styles.merchGrid}>
                  {merchTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.merchCard,
                        selectedMerchType === type.value && styles.selectedMerch
                      ]}
                      onPress={() => setSelectedMerchType(type.value)}
                    >
                      <Text style={[
                        styles.merchLabel,
                        selectedMerchType === type.value && styles.selectedMerchText
                      ]}>
                        {type.label}
                      </Text>
                      <Text style={styles.merchPrice}>${type.basePrice}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* License Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>License Type</Text>
                
                <TouchableOpacity
                  style={[
                    styles.licenseCard,
                    selectedLicense === 'personal' && styles.selectedLicense
                  ]}
                  onPress={() => setSelectedLicense('personal')}
                >
                  <View style={styles.licenseHeader}>
                    <Text style={styles.licenseTitle}>Personal Use</Text>
                    <Text style={styles.licensePrice}>Included</Text>
                  </View>
                  <Text style={styles.licenseDescription}>
                    For personal use only. Cannot be resold or used commercially.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.licenseCard,
                    selectedLicense === 'commercial' && styles.selectedLicense
                  ]}
                  onPress={() => setSelectedLicense('commercial')}
                >
                  <View style={styles.licenseHeader}>
                    <Text style={styles.licenseTitle}>Commercial License</Text>
                    <Text style={styles.licensePrice}>+$10.00</Text>
                  </View>
                  <Text style={styles.licenseDescription}>
                    Full commercial rights. 70% revenue to you, 30% to artist.
                  </Text>
                  <View style={styles.royaltyBreakdown}>
                    <View style={styles.royaltyRow}>
                      <Text style={styles.royaltyLabel}>Your share:</Text>
                      <Text style={styles.royaltyValue}>70%</Text>
                    </View>
                    <View style={styles.royaltyRow}>
                      <Text style={styles.royaltyLabel}>Artist royalty:</Text>
                      <Text style={styles.royaltyValue}>30%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Price Summary */}
              <View style={styles.priceCard}>
                <Text style={styles.priceTitle}>Total Price</Text>
                <Text style={styles.totalPrice}>${getLicensePrice().toFixed(2)}</Text>
              </View>
            </>
          )}
        </ScrollView>

        {/* Create Button */}
        {selectedNFT && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateMerch}>
              <DollarSign size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Merchandise</Text>
            </TouchableOpacity>
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  nftScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  nftCard: {
    width: 120,
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  selectedNFT: {
    backgroundColor: '#064E3B',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  nftImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
    marginBottom: 8,
  },
  nftName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  merchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  merchCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedMerch: {
    backgroundColor: '#064E3B',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  merchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedMerchText: {
    color: '#10B981',
  },
  merchPrice: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  licenseCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedLicense: {
    backgroundColor: '#064E3B',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  licenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  licensePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  licenseDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  royaltyBreakdown: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  royaltyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  royaltyLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  royaltyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  priceCard: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  priceTitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  totalPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});