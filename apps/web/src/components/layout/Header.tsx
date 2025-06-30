import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@shared/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useAppStore } from '../../store/appStore';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toggleChat } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

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
          <Link to="/" className="flex items-center">
            <img 
              src="/images/bandruption-logo.png" 
              alt="Bandruption" 
              className="h-8 w-auto object-contain"
            />
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
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-white hidden sm:block">{user.email?.split('@')[0]}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-gray-700">
                        <p className="text-sm text-white font-medium">{user.email}</p>
                        <p className="text-xs text-gray-400">Signed in via {user.app_metadata?.provider || 'email'}</p>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="primary" size="sm" className="hidden sm:flex" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
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
          className="group flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          title="Built with Bolt.new"
        >
          <img 
            src="/images/bolt_white_circle.png" 
            alt="Bolt.new" 
            className="w-12 h-12 object-contain rounded-full"
          />
        </a>
      </div>
    </header>
  );
};