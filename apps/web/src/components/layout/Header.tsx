import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, User, Search, Menu, X } from 'lucide-react';
import { Button } from '@shared/ui';
import { useAppStore } from '../../store/appStore';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, toggleChat } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Search', href: '/search', current: location.pathname === '/search' },
    { name: 'Player', href: '/player', current: location.pathname === '/player' },
  ];

  return (
    <header className="bg-dark-900/95 backdrop-blur-lg border-b border-dark-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">Bandruption</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  item.current
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-300 hover:text-white'
                } px-3 py-2 text-sm font-medium transition-colors duration-200`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Link to="/search" className="p-2 text-gray-400 hover:text-white transition-colors duration-200">
              <Search className="w-5 h-5" />
            </Link>

            {/* Chat */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="hidden sm:flex"
            >
              AI Chat
            </Button>

            {/* Auth */}
            {isAuthenticated && user ? (
              <Link to={`/profile/${user.username}`} className="flex items-center space-x-2">
                <img
                  src={user.avatar_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-white hidden sm:block">{user.username}</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">Login</Button>
                <Button variant="primary" size="sm" className="hidden sm:flex">Sign Up</Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-dark-800/95 backdrop-blur-lg border-t border-dark-600 animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  toggleChat();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-dark-700 hover:text-white transition-colors duration-200"
              >
                AI Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bolt.new Badge */}
      <div className="fixed top-4 right-4 z-50">
        <a
          href="https://bolt.new/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-100 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          title="Built with Bolt.new"
        >
          <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3L4 14h6.5l-1.5 7 9-11h-6.5L13 3z"/>
          </svg>
        </a>
      </div>
    </header>
  );
};