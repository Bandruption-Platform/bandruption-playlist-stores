import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '@shared/ui';
import { Card } from '../components/ui/Card';
import { mockTracks, mockPlaylists } from '../data/mockData';
import { useAppStore } from '../store/appStore';

export const PlayerPage: React.FC = () => {
  const { currentTrack, currentPlaylist } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use first track as default if no current track
  const track = currentTrack || mockTracks[0];
  const playlist = currentPlaylist || mockPlaylists[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = (parseFloat(e.target.value) / 100) * audio.duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = audioRef.current ? (currentTime / audioRef.current.duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Spotify Compliance Notice */}
      <div className="bg-green-600/20 border-b border-green-600/30 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-400 text-sm">
            <strong>Note:</strong> This is a demo player. Connect your Spotify Premium account for full track playback. 
            Preview functionality requires Spotify integration.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Player Card */}
        <Card variant="glass" className="p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Album Art */}
            <div className="flex-shrink-0">
              <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={mockTracks[0].album === 'Synthwave Dreams' ? 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop' : 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'}
                  alt={track.album}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Track Info and Controls */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{track.name}</h1>
                <h2 className="text-xl text-gray-300 mb-1">{track.artist}</h2>
                <h3 className="text-lg text-gray-400">{track.album}</h3>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-400 w-12 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress || 0}
                      onChange={handleSeek}
                      className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-12">
                    {formatTime(track.duration)}
                  </span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="lg"
                  icon={Shuffle}
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={isShuffled ? 'text-primary-400' : 'text-gray-400'}
                />
                <Button variant="ghost" size="lg" icon={SkipBack} />
                <Button
                  variant="primary"
                  size="lg"
                  onClick={togglePlayPause}
                  className="w-16 h-16 rounded-full"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </Button>
                <Button variant="ghost" size="lg" icon={SkipForward} />
                <Button
                  variant="ghost"
                  size="lg"
                  icon={Repeat}
                  onClick={() => {
                    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
                    const currentIndex = modes.indexOf(repeatMode);
                    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
                  }}
                  className={repeatMode !== 'off' ? 'text-primary-400' : 'text-gray-400'}
                />
              </div>

              {/* Secondary Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" icon={Heart} className="text-gray-400 hover:text-red-400" />
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <Button variant="ghost" icon={MoreHorizontal} className="text-gray-400" />
              </div>
            </div>
          </div>
        </Card>

        {/* Queue */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Up Next</h2>
            <Button variant="outline" size="sm">
              Clear Queue
            </Button>
          </div>

          <div className="space-y-2">
            {playlist.tracks.slice(1, 6).map((queueTrack, index) => (
              <div
                key={queueTrack.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-700/50 transition-colors duration-200 group cursor-pointer"
              >
                <span className="text-gray-400 text-sm w-6">{index + 2}</span>
                <img
                  src={queueTrack.album === 'Synthwave Dreams' ? 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=48&h=48&fit=crop' : 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=48&h=48&fit=crop'}
                  alt={queueTrack.album}
                  className="w-12 h-12 rounded-lg"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{queueTrack.name}</div>
                  <div className="text-gray-400 text-sm">{queueTrack.artist}</div>
                </div>
                <div className="text-gray-400 text-sm">
                  {Math.floor(queueTrack.duration / 60)}:{(queueTrack.duration % 60).toString().padStart(2, '0')}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Play}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={track.previewUrl}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Custom Slider Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 6px rgba(139, 92, 246, 0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          box-shadow: 0 0 0 6px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
};