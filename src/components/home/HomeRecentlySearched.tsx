import React from 'react';
import TrackThumbnail from '@/components/TrackThumbnail';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

const HomeRecentlySearched = () => {
  const { recentlySearched, playTrack } = useMusicPlayer();

  if (recentlySearched.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Recently Searched</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentlySearched.map((track, index) => (
          <div 
            key={index} 
            className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer"
            onClick={() => playTrack(track)}
          >
            <TrackThumbnail 
              thumbnail={track.thumbnail} 
              title={track.title} 
              className="w-12 h-12 rounded-md" 
              iconClassName="w-6 h-6 text-primary"
            />
            <div>
              <h3 className="font-semibold text-lg text-foreground">{track.title}</h3>
              <p className="text-sm text-muted-foreground">{track.artist} {track.album && `• ${track.album}`}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeRecentlySearched;