import React from 'react';
import { useParams } from 'react-router-dom';
import { Music, Share2, Copy, ExternalLink, Star, ShoppingBag } from 'lucide-react';
import { Button } from '@shared/ui';
import { Card } from '../components/ui/Card';
import { mockUsers, mockPlaylists, mockNFTs, mockMerchItems } from '../data/mockData';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const user = mockUsers.find(u => u.username === username);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">User not found</h1>
          <p className="text-gray-400">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const userPlaylists = mockPlaylists.filter(p => p.userId === user.id);
  const userNFTs = mockNFTs.filter(n => n.userId === user.id);
  const userMerch = mockMerchItems.filter(m => m.userId === user.id);

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Profile Header */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-secondary-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex-shrink-0">
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-32 h-32 rounded-2xl border-4 border-primary-500"
              />
            </div>
            
            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                {user.isPaidSubscriber && (
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-white inline mr-1" />
                    <span className="text-white text-sm font-medium">Pro</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-300 text-lg mb-4">{user.bio}</p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userPlaylists.length}</div>
                  <div className="text-sm text-gray-400">Playlists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userNFTs.length}</div>
                  <div className="text-sm text-gray-400">NFTs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user.favoriteGenres?.length || 0}</div>
                  <div className="text-sm text-gray-400">Genres</div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" icon={Music}>
                  Follow
                </Button>
                <Button variant="outline" icon={Share2}>
                  Share Profile
                </Button>
                {user.spotifyConnected && (
                  <Button variant="ghost" icon={ExternalLink}>
                    Spotify Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Favorite Genres */}
          {user.favoriteGenres && user.favoriteGenres.length > 0 && (
            <div className="mt-8">
              <h3 className="text-white font-semibold mb-3">Favorite Genres</h3>
              <div className="flex flex-wrap gap-2">
                {user.favoriteGenres.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-dark-700 text-primary-400 px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Public Playlists */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Public Playlists</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPlaylists.map((playlist) => (
              <Card key={playlist.id} variant="glass" hover className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={playlist.coverImageUrl}
                    alt={playlist.name}
                    className="w-16 h-16 rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{playlist.name}</h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{playlist.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{playlist.tracks?.length || 0} tracks</span>
                      <Button variant="ghost" size="sm" icon={Copy}>
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* NFT Gallery */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">NFT Collection</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userNFTs.map((nft) => (
              <Card key={nft.id} variant="glass" hover className="overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={nft.imageUrl}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1 truncate">{nft.name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{nft.description}</p>
                  {nft.forSale && (
                    <div className="flex items-center justify-between">
                      <span className="text-primary-400 font-semibold">{nft.price} ALGO</span>
                      <Button variant="primary" size="sm">
                        Buy Now
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Merchandise Store (Paid Subscribers Only) */}
        {user.isPaidSubscriber && userMerch.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Merchandise Store</h2>
                <p className="text-gray-400">Royalties go to IP holders</p>
              </div>
              <Button variant="outline" size="sm" icon={ShoppingBag}>
                View Store
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userMerch.map((item) => (
                <Card key={item.id} variant="glass" hover className="overflow-hidden">
                  <div className="aspect-square bg-dark-700 flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg"
                    />
                    <div className="ml-4">
                      <div className="text-white text-sm capitalize">{item.type}</div>
                      <div className="text-gray-400 text-xs">Design</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-1 truncate">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-400 font-semibold">${item.price}</span>
                      <Button variant="primary" size="sm">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};