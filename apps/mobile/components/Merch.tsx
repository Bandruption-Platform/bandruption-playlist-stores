import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, Palette, TrendingUp, Award } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { MerchCard } from '@/components/MerchCard';
import { NFTToMerchModal } from '@/components/NFTToMerchModal';

const mockMerchItems = [
  {
    id: 'merch1',
    name: 'Cyberpunk Vision Tee',
    description: 'Premium cotton t-shirt with AI-generated cyberpunk artwork',
    type: 'tshirt' as const,
    imageUrl: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=300',
    price: 29.99,
    userId: 'user1',
    artworkId: 'nft1',
    printfulId: 'pf1'
  },
  {
    id: 'merch2',
    name: 'Abstract Jazz Poster',
    description: 'High-quality print of abstract jazz interpretation',
    type: 'poster' as const,
    imageUrl: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=300',
    price: 19.99,
    userId: 'user1',
    artworkId: 'nft2',
    printfulId: 'pf2'
  },
  {
    id: 'merch3',
    name: 'Neon Dreams Hoodie',
    description: 'Comfortable hoodie featuring neon-inspired artwork',
    type: 'hoodie' as const,
    imageUrl: 'https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?auto=compress&cs=tinysrgb&w=300',
    price: 49.99,
    userId: 'user1',
    artworkId: 'nft1',
    printfulId: 'pf3'
  }
];

export default function MerchandiseScreen() {
  const { nftGallery } = useAppStore();
  const [showNFTToMerchModal, setShowNFTToMerchModal] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Merchandise</Text>
        <TouchableOpacity style={styles.cartButton}>
          <ShoppingCart size={24} color="#70C3ED" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Create from NFT Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowNFTToMerchModal(true)}
        >
          <Palette size={24} color="#CDFF6A" />
          <View style={styles.createButtonText}>
            <Text style={styles.createButtonTitle}>Turn NFT into Merch</Text>
            <Text style={styles.createButtonSubtitle}>Convert your NFTs to physical products</Text>
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#70C3ED" />
            <Text style={styles.sectionTitle}>Popular Items</Text>
          </View>
          
          <FlatList
            data={mockMerchItems}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <MerchCard
                item={item}
                style={styles.merchCard}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalScroll}
          />
        </View>

        {/* Your Creations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color="#CDFF6A" />
            <Text style={styles.sectionTitle}>Your Creations</Text>
          </View>
          
          {mockMerchItems.length > 0 ? (
            <FlatList
              data={mockMerchItems.slice(0, 2)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <MerchCard
                  item={item}
                  style={styles.merchCard}
                  showRoyalties={true}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.horizontalScroll}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No merchandise created yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Convert your NFTs to start selling merch
              </Text>
            </View>
          )}
        </View>

        {/* License Information */}
        <View style={styles.licenseSection}>
          <Text style={styles.licenseSectionTitle}>License Options</Text>
          <View style={styles.licenseCard}>
            <Text style={styles.licenseTitle}>Personal Use License</Text>
            <Text style={styles.licenseDescription}>
              For personal use only. Cannot be resold or used commercially.
            </Text>
            <Text style={styles.licensePrice}>Free with NFT purchase</Text>
          </View>
          <View style={styles.licenseCard}>
            <Text style={styles.licenseTitle}>Commercial License</Text>
            <Text style={styles.licenseDescription}>
              Full commercial rights with 70% revenue to you, 30% to artist.
            </Text>
            <Text style={styles.licensePrice}>+$10.00</Text>
          </View>
        </View>
      </ScrollView>

      {/* NFT to Merch Modal */}
      <NFTToMerchModal
        visible={showNFTToMerchModal}
        onClose={() => setShowNFTToMerchModal(false)}
        nfts={nftGallery}
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
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A9BC7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#70C3ED',
  },
  scrollView: {
    flex: 1,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#CDFF6A',
  },
  createButtonText: {
    marginLeft: 16,
    flex: 1,
  },
  createButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createButtonSubtitle: {
    fontSize: 14,
    color: '#C4B5FD',
    marginTop: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  merchCard: {
    marginRight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#C4B5FD',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#A78BFA',
    textAlign: 'center',
  },
  licenseSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  licenseSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  licenseCard: {
    backgroundColor: '#2D1B69',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  licenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  licenseDescription: {
    fontSize: 14,
    color: '#C4B5FD',
    marginBottom: 8,
    lineHeight: 20,
  },
  licensePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CDFF6A',
  },
});