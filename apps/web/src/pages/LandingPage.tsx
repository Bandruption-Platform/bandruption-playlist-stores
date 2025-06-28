import React from 'react';
import { Play, Download, Palette, Coins, Users, Zap, Music, Smartphone } from 'lucide-react';
import { Button } from '@shared/ui';
import { Card } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Music,
      title: 'AI Music Discovery',
      description: 'Chat with our AI to discover new music based on your mood, preferences, and listening history.',
    },
    {
      icon: Play,
      title: 'Smart Playlists',
      description: 'Create and share intelligent playlists that evolve with your taste and social connections.',
    },
    {
      icon: Palette,
      title: 'AI Art Generation',
      description: 'Transform album covers into unique digital art using advanced AI algorithms.',
    },
    {
      icon: Coins,
      title: 'NFT Marketplace',
      description: 'Mint, buy, and sell music-inspired NFTs on the Algorand blockchain.',
    },
    {
      icon: Users,
      title: 'Artist Royalties',
      description: 'Support your favorite artists with transparent royalty distribution.',
    },
    {
      icon: Zap,
      title: 'Real-time Sync',
      description: 'Seamlessly sync across all your devices with instant updates.',
    },
  ];

  const partners = [
    { name: 'Spotify', color: 'text-green-400' },
    { name: 'Algorand', color: 'text-blue-400' },
    { name: 'Cloudflare', color: 'text-orange-400' },
    { name: 'Supabase', color: 'text-emerald-400' },
    { name: 'RevenueCat', color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-secondary-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
              Discover Music.
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Create Art.
              </span>
              <br />
              Own Digital Collectibles.
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the future of music discovery with AI-powered conversations, 
              blockchain-verified ownership, and artist-supporting royalties.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-4">
                Get the Mobile App
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Explore Web Player
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Revolutionary Music Experience
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Combining cutting-edge AI, blockchain technology, and social features 
              to transform how you discover, own, and share music.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="glass"
                hover
                className="p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-16 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Powered by Industry Leaders
            </h2>
            <p className="text-gray-300">
              Built on reliable, scalable infrastructure from trusted technology partners
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-80">
            {partners.map((partner, index) => (
              <div
                key={index}
                className={`text-2xl font-bold ${partner.color} transition-all duration-300 hover:scale-110 hover:opacity-100`}
              >
                {partner.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-24 bg-gradient-to-r from-primary-900/20 to-secondary-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Take Your Music Everywhere
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Download our mobile app for the complete Bandruption experience. 
                Discover music, create NFTs, and manage your collection on the go.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <Music className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300">Offline music discovery with AI chat</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center">
                    <Palette className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300">Create and mint NFTs directly from your phone</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center">
                    <Coins className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300">Trade NFTs and support artists instantly</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" icon={Download} className="text-lg px-8 py-4">
                  iOS App Store
                </Button>
                <Button variant="outline" size="lg" icon={Download} className="text-lg px-8 py-4">
                  Google Play
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-16 h-16 text-white mx-auto mb-4" />
                    <div className="w-32 h-32 bg-white/20 rounded-2xl flex items-center justify-center">
                      <div className="text-white font-mono text-xs">QR Code</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent-500 rounded-full animate-pulse-slow">
                  <Zap className="w-5 h-5 text-white absolute top-1.5 left-1.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-dark-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Music Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of music lovers already discovering, creating, and collecting 
            with Bandruption's revolutionary platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4">
              Start Discovering Music
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Learn More About NFTs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};