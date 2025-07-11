import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { X, Sparkles, Wand as Wand2 } from 'lucide-react-native';
import { Album, ArtStyle, AIArtGeneration } from '../types';
import { useAppStore } from '@/store/useAppStore';

interface NFTGenerationModalProps {
  visible: boolean;
  onClose: () => void;
  albums: Album[];
}

const artStyles: { value: ArtStyle; label: string; description: string }[] = [
  { value: 'abstract', label: 'Abstract', description: 'Fluid forms and vibrant colors' },
  { value: 'cyberpunk', label: 'Cyberpunk', description: 'Neon lights and futuristic tech' },
  { value: 'vintage', label: 'Vintage', description: 'Retro aesthetics and warm tones' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean lines and simple forms' },
  { value: 'psychedelic', label: 'Psychedelic', description: 'Surreal patterns and bright colors' },
];

export function NFTGenerationModal({ visible, onClose, albums }: NFTGenerationModalProps) {
  const { startNFTGeneration } = useAppStore();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>('abstract');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedAlbum) return;

    setIsGenerating(true);

    const generation: AIArtGeneration = {
      id: Date.now().toString(),
      sourceAlbumId: selectedAlbum.id,
      prompt: customPrompt || `${selectedStyle} interpretation of ${selectedAlbum.name} by ${selectedAlbum.artist}`,
      style: selectedStyle,
      generatedImageUrl: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=300',
      status: 'generating',
      userId: 'user1',
      createdAt: new Date(),
      needsApproval: true,
      artistApproved: false,
    };

    startNFTGeneration(generation);

    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
      onClose();
      // Reset form
      setSelectedAlbum(null);
      setCustomPrompt('');
      setSelectedStyle('abstract');
    }, 2000);
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
            <Sparkles size={24} color="#CDFF6A" />
            <Text style={styles.title}>Create Fan Art</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#A78BFA" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Album Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Album</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.albumScroll}>
              {albums.map((album) => (
                <TouchableOpacity
                  key={album.id}
                  style={[
                    styles.albumCard,
                    selectedAlbum?.id === album.id && styles.selectedAlbum
                  ]}
                  onPress={() => setSelectedAlbum(album)}
                >
                  <Image source={{ uri: album.imageUrl }} style={styles.albumImage} />
                  <Text style={styles.albumTitle} numberOfLines={1}>{album.name}</Text>
                  <Text style={styles.albumArtist} numberOfLines={1}>{album.artist}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Style Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Art Style</Text>
            <View style={styles.styleGrid}>
              {artStyles.map((style) => (
                <TouchableOpacity
                  key={style.value}
                  style={[
                    styles.styleCard,
                    selectedStyle === style.value && styles.selectedStyle
                  ]}
                  onPress={() => setSelectedStyle(style.value)}
                >
                  <Text style={[
                    styles.styleLabel,
                    selectedStyle === style.value && styles.selectedStyleText
                  ]}>
                    {style.label}
                  </Text>
                  <Text style={[
                    styles.styleDescription,
                    selectedStyle === style.value && styles.selectedStyleDescription
                  ]}>
                    {style.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Prompt */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Prompt (Optional)</Text>
            <TextInput
              style={styles.promptInput}
              placeholder="Describe your vision or leave blank for default..."
              placeholderTextColor="#A78BFA"
              value={customPrompt}
              onChangeText={setCustomPrompt}
              multiline
            />
          </View>

          {/* Artist Consent Notice */}
          <View style={styles.consentNotice}>
            <Text style={styles.consentTitle}>Artist Consent Required</Text>
            <Text style={styles.consentText}>
              Your NFT will be generated and placed in drafts while we request approval from the artist. 
              Once approved, it will be automatically minted to your wallet.
            </Text>
          </View>
        </ScrollView>

        {/* Generate Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              (!selectedAlbum || isGenerating) && styles.generateButtonDisabled
            ]}
            onPress={handleGenerate}
            disabled={!selectedAlbum || isGenerating}
          >
            {isGenerating ? (
              <>
                <Wand2 size={20} color="#000000" />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </>
            ) : (
              <>
                <Sparkles size={20} color="#000000" />
                <Text style={styles.generateButtonText}>Generate Artwork</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#4C1D95',
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
  albumScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  albumCard: {
    width: 120,
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2D1B69',
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  selectedAlbum: {
    backgroundColor: '#9BC53D',
    borderWidth: 2,
    borderColor: '#CDFF6A',
  },
  albumImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  albumArtist: {
    fontSize: 12,
    color: '#C4B5FD',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  styleCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2D1B69',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  selectedStyle: {
    backgroundColor: '#4A9BC7',
    borderWidth: 2,
    borderColor: '#70C3ED',
  },
  styleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedStyleText: {
    color: '#2D1B69',
  },
  selectedStyleDescription: {
    fontSize: 12,
    color: '#461a48',
    lineHeight: 16,
  },
  styleDescription: {
    fontSize: 12,
    color: '#C4B5FD',
    lineHeight: 16,
  },
  promptInput: {
    backgroundColor: '#2D1B69',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  consentNotice: {
    backgroundColor: '#2D1B69',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 8,
  },
  consentText: {
    fontSize: 14,
    color: '#E0E7FF',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#4C1D95',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CDFF6A',
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateButtonDisabled: {
    backgroundColor: '#4C1D95',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
});