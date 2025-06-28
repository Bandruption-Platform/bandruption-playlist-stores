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
import { useAppStore } from './store/appStore';
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
  const { setUser } = useAppStore();

  // Mock authentication - in real app this would check for stored tokens
  React.useEffect(() => {
    // Simulate logged in user for demo
    const mockUser = {
      id: '1',
      email: 'alex@bandruption.com',
      username: 'alex_music',
      avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      bio: 'Electronic music producer and NFT artist.',
      favoriteGenres: ['Electronic', 'Synthwave', 'Ambient'],
      isPaidSubscriber: true,
      spotifyConnected: true,
    };
    setUser(mockUser);
  }, [setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <SpotifyProvider>
        <Router>
          <div className="min-h-screen bg-dark-900 text-white">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/playlist/:id" element={<PlaylistPage />} />
                <Route path="/player" element={<PlayerPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/chat" element={<ChatPage />} />
              </Routes>
            </main>
            <Footer />
            <ChatWidget />
          </div>
        </Router>
      </SpotifyProvider>
    </QueryClientProvider>
  );
}

export default App;