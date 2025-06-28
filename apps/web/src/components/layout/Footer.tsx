import React from 'react';
import { Music, Github, Twitter, Instagram, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Bandruption</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Discover music through AI-powered conversations, create unique NFT art from album covers, and own your digital music collectibles on the blockchain.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Discover Music</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Create NFTs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Marketplace</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">AI Chat</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Technology Partners */}
        <div className="mt-12 pt-8 border-t border-dark-700">
          <h3 className="text-white font-semibold mb-6 text-center">Powered By</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-green-400 font-semibold">Spotify</div>
            <div className="text-blue-400 font-semibold">Algorand</div>
            <div className="text-orange-400 font-semibold">Cloudflare</div>
            <div className="text-emerald-400 font-semibold">Supabase</div>
            <div className="text-purple-400 font-semibold">RevenueCat</div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-dark-700 text-center">
          <p className="text-gray-400">
            © 2024 Bandruption. All rights reserved. Built with ❤️ for music lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};