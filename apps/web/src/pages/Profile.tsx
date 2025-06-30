import React, { useState } from 'react';
import { Camera, Settings, Share, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePlaylist } from '../contexts/PlaylistContext';
import AlbumCard from '../components/AlbumCard';

function Profile() {
  const { user, updateProfile } = useAuth();
  const { playlists } = usePlaylist();
  const [activeTab, setActiveTab] = useState<'music' | 'collections' | 'statistics'>('music');

  if (!user) return null;

  const userPlaylists = playlists.filter(p => p.userId === user.id && p.isPublic);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Image */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-900 flex items-center justify-center">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <button className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
                  <p className="text-gray-400 mb-4">{user.email}</p>
                  {user.bio && <p className="text-gray-300 mb-4">{user.bio}</p>}
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-2 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300">
                    <Share className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userPlaylists.length}</div>
                  <div className="text-sm text-gray-400">Playlists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user.nftGallery?.length || 0}</div>
                  <div className="text-sm text-gray-400">NFTs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user.favoriteGenres?.length || 0}</div>
                  <div className="text-sm text-gray-400">Genres</div>
                </div>
              </div>

              {/* Favorite Genres */}
              {user.favoriteGenres && user.favoriteGenres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.favoriteGenres.map((genre, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Spotify Connection */}
              <div className="mt-6 flex items-center space-x-3">
                {user.spotifyConnected ? (
                  <div className="flex items-center space-x-2 text-green-400">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Spotify Connected</span>
                  </div>
                ) : (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all duration-300">
                    <span className="text-sm">Connect Spotify</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="glass-effect rounded-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10">
            {[
              { key: 'music', label: 'Music' },
              { key: 'collections', label: 'Art Collections' },
              { key: 'statistics', label: 'Statistics' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-4 font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-600/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'music' && (
              <div>
                {userPlaylists.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPlaylists.map((playlist) => (
                      <div key={playlist.id} className="glass-effect rounded-xl p-6 hover:transform hover:scale-105 transition-all duration-300">
                        <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          {playlist.coverImage ? (
                            <img 
                              src={playlist.coverImage} 
                              alt={playlist.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl font-bold text-white">
                              {playlist.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-white mb-2">{playlist.name}</h3>
                        <p className="text-gray-400 text-sm mb-3">{playlist.description}</p>
                        <p className="text-purple-400 text-sm">{playlist.albums.length} albums</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-4">No public playlists yet</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all duration-300">
                      Create Your First Playlist
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'collections' && (
              <div>
                {user.nftGallery.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user.nftGallery.map((nft) => (
                      <div key={nft.id} className="glass-effect rounded-xl p-4 hover:transform hover:scale-105 transition-all duration-300">
                        <div className="aspect-square mb-4 rounded-lg overflow-hidden">
                          <img 
                            src={nft.imageUrl}
                            alt={nft.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-bold text-white mb-2">{nft.name}</h3>
                        <p className="text-gray-400 text-sm mb-3">{nft.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-400 font-medium">{nft.price} ALGO</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            nft.forSale 
                              ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                              : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {nft.forSale ? 'For Sale' : 'Not Listed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-4">No NFTs in your gallery yet</p>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all duration-300">
                      Create Your First NFT
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="glass-effect rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">{userPlaylists.length}</div>
                    <div className="text-gray-400">Albums</div>
                  </div>
                  <div className="glass-effect rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">{user.nftGallery?.length || 0}</div>
                    <div className="text-gray-400">NFTs</div>
                  </div>
                  <div className="glass-effect rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">12</div>
                    <div className="text-gray-400">Merch</div>
                  </div>
                  <div className="glass-effect rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">847</div>
                    <div className="text-gray-400">Followers</div>
                  </div>
                </div>

                {/* Monthly Stats */}
                <div className="glass-effect rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">This Month</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">NFTs Created</span>
                      <span className="text-white font-semibold">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Earnings</span>
                      <span className="text-white font-semibold">$127.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Merch Sales</span>
                      <span className="text-white font-semibold">8 items</span>
                    </div>
                  </div>
                </div>

                {/* Top Genres */}
                {user.favoriteGenres && user.favoriteGenres.length > 0 && (
                  <div className="glass-effect rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Top Genres</h3>
                    <div className="space-y-3">
                      {user.favoriteGenres.map((genre, index) => (
                        <div key={genre} className="flex items-center space-x-4">
                          <span className="text-white w-20">{genre}</span>
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                              style={{ width: `${100 - index * 20}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;