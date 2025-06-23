import React from 'react';
import { X, Play, Clock, Heart, Share } from 'lucide-react';
import { Album } from '@shared/types';

interface AlbumDetailModalProps {
  album: Album;
  isOpen: boolean;
  onClose: () => void;
}

function AlbumDetailModal({ album, isOpen, onClose }: AlbumDetailModalProps) {
  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="glass-effect rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="relative">
            <div className="flex items-start space-x-6 p-8">
              {/* Album Cover */}
              <div className="flex-shrink-0">
                <img
                  src={album.imageUrl}
                  alt={`${album.name} by ${album.artist}`}
                  className="w-64 h-64 rounded-xl object-cover shadow-2xl"
                />
              </div>

              {/* Album Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-purple-400 font-medium mb-2">ALBUM</p>
                    <h1 className="text-4xl font-bold text-white mb-2">{album.name}</h1>
                    <p className="text-xl text-gray-300 mb-4">{album.artist}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-400 mb-6">
                  <span>{new Date(album.releaseDate).getFullYear()}</span>
                  <span>•</span>
                  <span>{album.tracks.length} tracks</span>
                  <span>•</span>
                  <span>{album.genre}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all duration-300">
                    <Play className="w-5 h-5" fill="currentColor" />
                    <span>Play</span>
                  </button>
                  <button className="p-3 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300">
                    <Share className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Track Listing */}
          <div className="px-8 pb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Track Listing</h2>
            <div className="space-y-2">
              {album.tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="group flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-center w-8 h-8 text-gray-400 group-hover:text-white">
                    <span className="group-hover:hidden text-sm">{track.trackNumber}</span>
                    <Play className="w-4 h-4 hidden group-hover:block" fill="currentColor" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors duration-300 truncate">
                      {track.name}
                    </h3>
                    {track.lyrics && (
                      <p className="text-sm text-gray-400 truncate mt-1">
                        {track.lyrics.slice(0, 50)}...
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatDuration(track.duration)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlbumDetailModal;