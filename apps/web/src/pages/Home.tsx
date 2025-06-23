import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Palette, MessageCircle, ShoppingBag, Sparkles, Users } from 'lucide-react';
import { mockAlbums } from '../data/mockData';
import AlbumCard from '../components/AlbumCard';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { user } = useAuth();
  const featuredAlbums = mockAlbums.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8">
            <span className="gradient-text">Curate</span>
            <span className="text-white"> Your </span>
            <span className="gradient-text">Sound</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create visual playlists, discover music with AI, and turn album art into unique NFTs. 
            Where music meets art meets technology.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            {user ? (
              <Link
                to="/playlist/builder"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Start Creating
              </Link>
            ) : (
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl">
                Get Started
              </button>
            )}
            <Link
              to="/marketplace"
              className="px-8 py-4 border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-semibold rounded-xl transition-all duration-300"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Everything You Need to <span className="gradient-text">Express Music</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-effect p-8 rounded-2xl hover:transform hover:scale-105 transition-all duration-300">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl w-fit mb-6">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Visual Playlists</h3>
              <p className="text-gray-300 leading-relaxed">
                Create stunning visual playlists with album artwork as the centerpiece. 
                Drag, drop, and curate your perfect music experience.
              </p>
            </div>

            <div className="glass-effect p-8 rounded-2xl hover:transform hover:scale-105 transition-all duration-300">
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl w-fit mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI Music Guide</h3>
              <p className="text-gray-300 leading-relaxed">
                Chat with our AI music promoter for personalized recommendations, 
                artist insights, and hidden gems tailored to your taste.
              </p>
            </div>

            <div className="glass-effect p-8 rounded-2xl hover:transform hover:scale-105 transition-all duration-300">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl w-fit mb-6">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI Art Generation</h3>
              <p className="text-gray-300 leading-relaxed">
                Transform album covers into unique AI-generated artwork. 
                Create, mint as NFTs, and showcase your artistic vision.
              </p>
            </div>

            <div className="glass-effect p-8 rounded-2xl hover:transform hover:scale-105 transition-all duration-300">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl w-fit mb-6">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Fan Marketplace</h3>
              <p className="text-gray-300 leading-relaxed">
                Buy and sell NFTs, discover unique merchandise, and support artists 
                through our integrated marketplace ecosystem.
              </p>
            </div>

            <div className="glass-effect p-8 rounded-2xl hover:transform hover:scale-105 transition-all duration-300">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl w-fit mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Revenue Sharing</h3>
              <p className="text-gray-300 leading-relaxed">
                Fair compensation for everyone. Artists, platforms, and fans 
                benefit from our transparent revenue splitting system.
              </p>
            </div>

            <div className="glass-effect p-8 rounded-2xl hover:transform hover:scale-105 transition-all duration-300">
              <div className="p-3 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl w-fit mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Community</h3>
              <p className="text-gray-300 leading-relaxed">
                Connect with fellow music lovers. Share playlists, discover new artists, 
                and build your reputation in the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Albums */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-white">
              Featured <span className="gradient-text">Albums</span>
            </h2>
            <Link 
              to="/marketplace"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300"
            >
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center glass-effect rounded-3xl p-12">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Music Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of music fans who are already creating, discovering, and collecting.
          </p>
          {!user && (
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl">
              Start Your Journey
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;