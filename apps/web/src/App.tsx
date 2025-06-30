import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ChatWidget } from './components/chat/ChatWidget';
import { LandingPage } from './pages/LandingPage';
import { ProfilePage } from './pages/ProfilePage';
import { PlaylistPage } from './pages/PlaylistPage';
import { PlayerPage } from './pages/PlayerPage';
import { ChatPage } from './pages/ChatPage';
import { SearchPage } from './pages/SearchPage';
import { SpotifyCallback } from './pages/SpotifyCallback';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthCallback } from './pages/AuthCallback';
import { AuthProvider } from './contexts/AuthContext';
import { SpotifyProvider } from './contexts/SpotifyContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SpotifyProvider>
          <Router>
            <div className="min-h-screen bg-dark-900 text-white">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/profile/:username" element={<ProfilePage />} />
                  <Route path="/playlist/:id" element={<PlaylistPage />} />
                  <Route path="/player" element={<PlayerPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
                </Routes>
              </main>
              <Footer />
              <ChatWidget />
            </div>
          </Router>
        </SpotifyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;