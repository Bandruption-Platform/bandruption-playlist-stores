import React from 'react';
import { useParams } from 'react-router-dom';
import { Play, Plus, Share2, Clock, Heart, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { mockPlaylists, mockUsers } from '../data/mockData';

export const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playlist = mockPlaylists.find(p => p.id === id);
  const playlistOwner = playlist ? mockUsers.find(u => u.id === playlist.userId) : null;
  
  if (!playlist || !playlistOwner) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Playlist not found</h1>
          <p className="text-gray-400">The playlist you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const totalDuration = playlist.tracks.reduce((sum, track) => sum + track.duration, 0);
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTrackDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Playlist Header */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-secondary-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Cover Art */}
            <div className="flex-shrink-0">
              <img
                src={playlist.coverImageUrl}
                alt={playlist.name}
                className="w-48 h-48 rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Playlist Details */}
            <div className="flex-1">
              <div className="mb-2">
                <span className="text-sm text-gray-400 uppercase tracking-wide">Playlist</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{playlist.name}</h1>
              {playlist.description && (
                <p className="text-gray-300 text-lg mb-6">{playlist.description}</p>
              )}
              
              {/* Metadata */}
              <div className="flex items-center gap-2 text-gray-300 mb-6">
                <img
                  src={playlistOwner.avatar_url}
                  alt={playlistOwner.username}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium">{playlistOwner.username}</span>
                <span>•</span>
                <span>{playlist.tracks.length} songs</span>
                <span>•</span>
                <span>{formatDuration(totalDuration)}</span>
              </div>
              
              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="lg" icon={Play} className="px-8">
                  Play All
                </Button>
                <Button variant="outline" icon={Heart}>
                  Save to Library
                </Button>
                <Button variant="ghost" icon={Share2}>
                  Share
                </Button>
                <Button variant="ghost" icon={Download}>
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Playlist Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Spotify Integration Notice */}
        <Card variant="glass" className="p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Enhanced Playback Available</h3>
              <p className="text-gray-300 mb-4">
                Connect your Spotify account to enjoy full-length tracks and enhanced features. 
                Free users can enjoy 30-second previews.
              </p>
              <div className="flex gap-3">
                <Button variant="primary" size="sm">
                  Connect Spotify
                </Button>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Track Listing */}
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-gray-400 text-sm border-b border-dark-600">
            <div className="col-span-1">#</div>
            <div className="col-span-6 sm:col-span-5">Title</div>
            <div className="hidden sm:block col-span-3">Album</div>
            <div className="col-span-3 sm:col-span-2 text-right">
              <Clock className="w-4 h-4 ml-auto" />
            </div>
            <div className="col-span-2 sm:col-span-1"></div>
          </div>
          
          {/* Tracks */}
          {playlist.tracks.map((track, index) => (
            <div
              key={track.id}
              className="grid grid-cols-12 gap-4 px-4 py-3 text-gray-300 hover:bg-dark-700/50 rounded-lg transition-colors duration-200 group"
            >
              <div className="col-span-1 flex items-center">
                <span className="group-hover:hidden">{index + 1}</span>
                <Play className="w-4 h-4 hidden group-hover:block text-white cursor-pointer" />
              </div>
              
              <div className="col-span-6 sm:col-span-5 flex items-center">
                <div>
                  <div className="text-white font-medium">{track.name}</div>
                  <div className="text-sm text-gray-400">{track.artist}</div>
                </div>
              </div>
              
              <div className="hidden sm:flex col-span-3 items-center">
                <span className="text-gray-400 text-sm">{track.album}</span>
              </div>
              
              <div className="col-span-3 sm:col-span-2 flex items-center justify-end">
                <span className="text-gray-400 text-sm">{formatTrackDuration(track.duration)}</span>
              </div>
              
              <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};