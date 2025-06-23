import React, { useState } from 'react';
import { Palette, Wand2, Download, Share, Coins, Sparkles } from 'lucide-react';
import { mockAlbums } from '../data/mockData';
import { generateAIArt } from '../services/aiService';
import { algorandService } from '../services/apiService';
import AlbumCard from '../components/AlbumCard';

function AIArtStudio() {
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [artStyle, setArtStyle] = useState<'abstract' | 'cyberpunk' | 'vintage' | 'minimalist' | 'psychedelic'>('abstract');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedArt, setGeneratedArt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const artStyles = [
    { id: 'abstract', name: 'Abstract', description: 'Flowing shapes and vibrant colors' },
    { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon lights and futuristic aesthetics' },
    { id: 'vintage', name: 'Vintage', description: 'Retro and nostalgic vibes' },
    { id: 'minimalist', name: 'Minimalist', description: 'Clean lines and simple forms' },
    { id: 'psychedelic', name: 'Psychedelic', description: 'Trippy patterns and bold colors' }
  ];

  const handleGenerateArt = async () => {
    if (!selectedAlbum) return;

    setIsGenerating(true);
    try {
      const generatedImageUrl = await generateAIArt(
        selectedAlbum.imageUrl,
        artStyle,
        customPrompt || `${artStyle} interpretation of ${selectedAlbum.name} by ${selectedAlbum.artist}`
      );
      setGeneratedArt(generatedImageUrl);
    } catch (error) {
      console.error('Art generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMintNFT = async () => {
    if (!generatedArt || !selectedAlbum) return;

    setIsMinting(true);
    try {
      const result = await algorandService.mintNFT({
        name: `${selectedAlbum.name} - ${artStyle} Remix`,
        description: `AI-generated ${artStyle} artwork inspired by ${selectedAlbum.name} by ${selectedAlbum.artist}`,
        imageUrl: generatedArt,
        price: 0.5
      });

      if (result.success) {
        alert('NFT minted successfully! Check your profile to see it.');
      }
    } catch (error) {
      console.error('NFT minting failed:', error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI <span className="gradient-text">Art Studio</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform album artwork into unique AI-generated masterpieces. Create, customize, and mint as NFTs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Creation Tools */}
          <div className="space-y-6">
            {/* Album Selection */}
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Palette className="w-6 h-6" />
                <span>Select Source Album</span>
              </h2>
              
              {selectedAlbum ? (
                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <img
                    src={selectedAlbum.imageUrl}
                    alt={selectedAlbum.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{selectedAlbum.name}</h3>
                    <p className="text-gray-400">{selectedAlbum.artist}</p>
                    <p className="text-sm text-gray-500">{selectedAlbum.genre}</p>
                  </div>
                  <button
                    onClick={() => setSelectedAlbum(null)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/20 rounded-lg hover:bg-white/5 transition-all duration-300"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {mockAlbums.slice(0, 6).map((album) => (
                    <div
                      key={album.id}
                      onClick={() => setSelectedAlbum(album)}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-2 group-hover:transform group-hover:scale-105 transition-all duration-300">
                        <img
                          src={album.imageUrl}
                          alt={album.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-white font-medium truncate group-hover:text-purple-300 transition-colors duration-300">
                        {album.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{album.artist}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Art Style Selection */}
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Wand2 className="w-6 h-6" />
                <span>Choose Art Style</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {artStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setArtStyle(style.id as any)}
                    className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                      artStyle === style.id
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <h3 className="font-semibold mb-1">{style.name}</h3>
                    <p className="text-sm opacity-80">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Custom Prompt (Optional)</h2>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add specific details or modifications to your art generation..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateArt}
              disabled={!selectedAlbum || isGenerating}
              className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Art...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate AI Art</span>
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Preview and Actions */}
          <div className="glass-effect rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Preview & Actions</h2>
            
            <div className="aspect-square rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              {generatedArt ? (
                <img
                  src={generatedArt}
                  alt="Generated AI Art"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Your AI-generated art will appear here</p>
                  <p className="text-sm text-gray-500">Select an album and generate to get started</p>
                </div>
              )}
            </div>

            {generatedArt && (
              <div className="space-y-4">
                {/* Art Info */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="font-bold text-white mb-2">
                    {selectedAlbum?.name} - {artStyles.find(s => s.id === artStyle)?.name} Remix
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    AI-generated artwork inspired by {selectedAlbum?.artist}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-purple-400">Style: {artStyles.find(s => s.id === artStyle)?.name}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">1024x1024px</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-white/20 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-white/20 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300">
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Mint NFT */}
                <button
                  onClick={handleMintNFT}
                  disabled={isMinting}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300"
                >
                  {isMinting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Minting NFT...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-5 h-5" />
                      <span>Mint as NFT (0.5 ALGO)</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Minting will create a unique NFT on the Algorand blockchain. 
                  Revenue will be shared with the original artist.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Creations */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8">Recent Community Creations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-effect rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600"></div>
                <div className="p-4">
                  <h3 className="font-bold text-white mb-1">Abstract Vision #{i}</h3>
                  <p className="text-gray-400 text-sm mb-2">by @musiclover{i}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400 font-medium">0.{i + 2} ALGO</span>
                    <span className="text-xs text-green-400">Available</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIArtStudio;