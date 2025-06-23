import React, { useState } from 'react';
import { Search, Filter, Heart, ShoppingCart, Sparkles, TrendingUp } from 'lucide-react';
import { mockNFTs, mockAlbums } from '../data/mockData';
import AlbumCard from '../components/AlbumCard';

function Marketplace() {
  const [activeTab, setActiveTab] = useState<'music' | 'nfts' | 'merch'>('music');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'price' | 'recent'>('popularity');

  const tabs = [
    { id: 'music', label: 'Music', icon: TrendingUp },
    { id: 'nfts', label: 'NFTs', icon: Sparkles },
    { id: 'merch', label: 'Merchandise', icon: ShoppingCart }
  ];

  const filteredAlbums = mockAlbums.filter(album =>
    album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    album.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    album.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNFTs = mockNFTs.filter(nft =>
    nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Music <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover new music, collect unique NFTs, and find exclusive merchandise from artists around the world
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="glass-effect rounded-2xl p-2 mb-8 max-w-md mx-auto">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="price">Price: Low to High</option>
                  <option value="recent">Recently Added</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {activeTab === 'music' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Discover Music</h2>
                <span className="text-gray-400">{filteredAlbums.length} albums found</span>
              </div>
              
              {filteredAlbums.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredAlbums.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Albums Found</h3>
                    <p className="text-gray-400">Try adjusting your search terms</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'nfts' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">NFT Collection</h2>
                <span className="text-gray-400">{filteredNFTs.length} NFTs available</span>
              </div>
              
              {filteredNFTs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredNFTs.map((nft) => (
                    <div key={nft.id} className="glass-effect rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group">
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={nft.imageUrl}
                          alt={nft.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                          <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300">
                            <Heart className="w-5 h-5 text-white" />
                          </button>
                          <button className="p-3 bg-purple-600/80 backdrop-blur-sm rounded-full hover:bg-purple-500 transition-all duration-300">
                            <ShoppingCart className="w-5 h-5 text-white" />
                          </button>
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full">
                            NFT
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-bold text-white text-lg mb-2 group-hover:text-purple-300 transition-colors duration-300">
                          {nft.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {nft.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold gradient-text">
                            {nft.price} ALGO
                          </span>
                          <span className="text-xs text-green-400 bg-green-600/20 px-2 py-1 rounded-full border border-green-500/30">
                            For Sale
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                    <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No NFTs Found</h3>
                    <p className="text-gray-400">Check back soon for new collections</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'merch' && (
            <div className="text-center py-16">
              <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Merchandise Coming Soon</h3>
                <p className="text-gray-400 mb-6">
                  We're working on bringing you exclusive merchandise from your favorite artists
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all duration-300">
                  Notify Me
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Marketplace;