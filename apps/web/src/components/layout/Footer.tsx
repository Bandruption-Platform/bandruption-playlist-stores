import React from 'react';
import { Github, Twitter, Instagram, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <img 
                src="/images/bandruption-logo.png" 
                alt="Bandruption" 
                className="h-8 w-auto object-contain"
              />
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
            <img src="/images/Spotify_Full_Logo_RGB_Green.png" alt="Spotify" className="h-6 w-auto object-contain filter brightness-75" />
            <img src="/images/algorand-white.svg" alt="Algorand" className="h-6 w-auto object-contain filter brightness-75" />
            <img src="/images/Cloudflare_Logo.svg" alt="Cloudflare" className="h-6 w-auto object-contain filter brightness-75" />
            <img src="/images/supabase-color.svg" alt="Supabase" className="h-6 w-auto object-contain filter brightness-75" />
            <img src="/images/revenue-cat-color.svg" alt="RevenueCat" className="h-6 w-auto object-contain filter brightness-75" />
            <img src="/images/entri-white.svg" alt="Entri" className="h-6 w-auto object-contain filter brightness-75" />
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