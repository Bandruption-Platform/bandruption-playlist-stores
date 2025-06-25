import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { ShoppingCart, DollarSign } from 'lucide-react-native';
import { MerchItem } from '@shared/types';

interface MerchCardProps {
  item: MerchItem;
  style?: ViewStyle;
  showRoyalties?: boolean;
}

export function MerchCard({ item, style, showRoyalties = false }: MerchCardProps) {
  const getMerchTypeLabel = (type: string) => {
    switch (type) {
      case 'tshirt': return 'T-Shirt';
      case 'hoodie': return 'Hoodie';
      case 'poster': return 'Poster';
      case 'sticker': return 'Sticker';
      case 'vinyl': return 'Vinyl';
      default: return type;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <TouchableOpacity style={styles.cartButton}>
          <ShoppingCart size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.type}>{getMerchTypeLabel(item.type)}</Text>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>${item.price}</Text>
          {showRoyalties && (
            <View style={styles.royaltyBadge}>
              <DollarSign size={12} color="#10B981" />
              <Text style={styles.royaltyText}>70%</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
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
  cartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 12,
  },
  type: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  royaltyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  royaltyText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 2,
  },
});