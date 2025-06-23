import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, User, Palette, ShoppingBag, List, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  onAuthClick: () => void;
}

function Navigation({ onAuthClick }: NavigationProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">SonicCurator</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {user && (
              <>
                <Link
                  to="/playlists"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive('/playlists') 
                      ? 'bg-purple-600/20 text-purple-400' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>Playlists</span>
                </Link>

                <Link
                  to="/ai-art"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive('/ai-art') 
                      ? 'bg-purple-600/20 text-purple-400' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>AI Art</span>
                </Link>
              </>
            )}

            <Link
              to="/marketplace"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive('/marketplace') 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Market</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="hidden sm:block">{user.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;