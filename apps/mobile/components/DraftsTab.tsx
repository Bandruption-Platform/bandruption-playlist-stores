import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Eye } from 'lucide-react-native';
import { AIArtGeneration } from '@shared/types';

interface DraftsTabProps {
  drafts: AIArtGeneration[];
}

export function DraftsTab({ drafts }: DraftsTabProps) {
  const getStatusIcon = (status: AIArtGeneration['status'], needsApproval?: boolean) => {
    if (status === 'generating') {
      return <Clock size={16} color="#F59E0B" />;
    }
    if (status === 'completed' && needsApproval) {
      return <AlertCircle size={16} color="#EF4444" />;
    }
    if (status === 'completed') {
      return <CheckCircle size={16} color="#10B981" />;
    }
    return <AlertCircle size={16} color="#EF4444" />;
  };

  const getStatusText = (draft: AIArtGeneration) => {
    if (draft.status === 'generating') return 'Generating...';
    if (draft.status === 'completed' && draft.needsApproval) return 'Awaiting Approval';
    if (draft.status === 'completed') return 'Ready to Mint';
    return 'Failed';
  };

  const renderDraftItem = ({ item }: { item: AIArtGeneration }) => (
    <View style={styles.draftCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.generatedImageUrl }} style={styles.image} />
        {item.needsApproval && !item.artistApproved && (
          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>AWAITING APPROVAL</Text>
          </View>
        )}
        <TouchableOpacity style={styles.previewButton}>
          <Eye size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.draftInfo}>
        <Text style={styles.draftTitle} numberOfLines={1}>
          {item.prompt}
        </Text>
        <Text style={styles.styleText}>{item.style} style</Text>
        
        <View style={styles.statusRow}>
          {getStatusIcon(item.status, item.needsApproval)}
          <Text style={styles.statusText}>{getStatusText(item)}</Text>
        </View>
        
        <Text style={styles.dateText}>
          {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (drafts.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Clock size={48} color="#6B7280" />
        <Text style={styles.emptyStateTitle}>No drafts yet</Text>
        <Text style={styles.emptyStateText}>
          Your NFT generations will appear here while awaiting artist approval
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={drafts}
      renderItem={renderDraftItem}
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
  draftCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  previewButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  styleText: {
    fontSize: 14,
    color: '#10B981',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});