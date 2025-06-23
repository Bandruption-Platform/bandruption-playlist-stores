import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from '@shared/types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlaylistProvider } from './contexts/PlaylistContext';
import { ChatProvider } from './contexts/ChatContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Playlists from './pages/Playlists';
import PlaylistBuilder from './pages/PlaylistBuilder';
import Marketplace from './pages/Marketplace';
import AIArtStudio from './pages/AIArtStudio';
import AuthModal from './components/AuthModal';
import ChatInterface from './components/ChatInterface';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      <Navigation onAuthClick={() => setAuthModalOpen(true)} />
      
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:userId?" element={user ? <Profile /> : <Navigate to="/" />} />
          <Route path="/playlists" element={user ? <Playlists /> : <Navigate to="/" />} />
          <Route path="/playlist/builder" element={user ? <PlaylistBuilder /> : <Navigate to="/" />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/ai-art" element={user ? <AIArtStudio /> : <Navigate to="/" />} />
        </Routes>
      </main>

      {user && <ChatInterface />}
      
      <AuthModal 
        isOpen={authModalOpen && !user} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlaylistProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </PlaylistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;