import React from 'react';
import TrackThumbnail from '@/components/TrackThumbnail';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils';
import Visualizer from '@/components/Visualizer'; // Import Visualizer

interface HomeRecentlySearchedProps {
  className?: string;
}

const HomeRecentlySearched = ({ className }: HomeRecentlySearchedProps) => {
  const { recentlySearched, playTrack, currentTrack, isPlaying } = useMusicPlayer(); // Get currentTrack and isPlaying

  if (recentlySearched.length === 0) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Recently Searched</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-x-0 md:pb-0">
        {recentlySearched.map((track, index) => {
          const isCurrentTrack = currentTrack?.videoId === track.videoId; // Check if this is the current track
          return (
            <div 
              key={index} 
              className="flex items-center gap-3 p-3 bg-card rounded-lg transition-all border border-border hover:border-primary/50 hover:shadow-neon-strong cursor-pointer w-[220px] flex-shrink-0 md:w-auto md:flex-shrink"
              onClick={() => playTrack(track)} // track already has duration if it was played from a source that provided it
            >
              <TrackThumbnail 
                thumbnail={track.thumbnail} 
                title={track.title} 
                className="w-10 h-10 rounded-md" 
                iconClassName="w-5 h-5 text-primary"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-foreground truncate">{track.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{track.album && `• ${track.album}`}</p>
              </div>
              {isCurrentTrack && isPlaying && ( // Conditionally render Visualizer
                <Visualizer barCount={5} className="h-4 w-8" isPlaying={isPlaying} animationIntervalMs={150} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeRecentlySearched;