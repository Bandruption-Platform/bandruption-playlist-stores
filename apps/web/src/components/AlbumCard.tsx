import React, { useState } from 'react';
import { Play, Heart, Plus, Info } from 'lucide-react';
import { Album } from '@shared/types';
import AlbumDetailModal from './AlbumDetailModal';

interface AlbumCardProps {
  album: Album;
  onAddToPlaylist?: (album: Album) => void;
  showAddButton?: boolean;
}

function AlbumCard({ album, onAddToPlaylist, showAddButton = false }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div
        className="album-hover relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl">
          {/* Album Cover */}
          <div className="aspect-square relative overflow-hidden">
            <img
              src={album.imageUrl}
              alt={`${album.name} by ${album.artist}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Overlay */}
            <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="absolute inset-0 flex items-center justify-center space-x-3">
                <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                  <Play className="w-6 h-6 text-white" fill="currentColor" />
                </button>
                <button 
                  onClick={() => setShowDetails(true)}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
                >
                  <Info className="w-6 h-6 text-white" />
                </button>
                {showAddButton && onAddToPlaylist && (
                  <button 
                    onClick={() => onAddToPlaylist(album)}
                    className="p-3 bg-purple-600/80 backdrop-blur-sm rounded-full hover:bg-purple-500 transition-all duration-300 transform hover:scale-110"
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Genre Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 text-xs font-medium bg-black/50 backdrop-blur-sm text-white rounded-full">
                {album.genre}
              </span>
            </div>

            {/* Heart Button */}
            <button className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
              isHovered ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
            }`}>
              <Heart className="w-5 h-5 text-white hover:text-red-400 transition-colors duration-300" />
            </button>
          </div>

          {/* Album Info */}
          <div className="p-4">
            <h3 className="font-bold text-white text-lg mb-1 truncate group-hover:text-purple-300 transition-colors duration-300">
              {album.name}
            </h3>
            <p className="text-gray-400 text-sm mb-2 truncate">{album.artist}</p>
            <p className="text-gray-500 text-xs">
              {new Date(album.releaseDate).getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <AlbumDetailModal 
        album={album}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
}

export default AlbumCard;