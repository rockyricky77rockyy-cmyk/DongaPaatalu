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
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:space-x-0 md:pb-0">
        {recentlySearched.map((track, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-2 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer w-[200px] flex-shrink-0 md:w-auto"
            onClick={() => playTrack(track)}
          >
            <TrackThumbnail 
              thumbnail={track.thumbnail} 
              title={track.title} 
              className="w-10 h-10 rounded-md" 
              iconClassName="w-5 h-5 text-primary"
            />
            <div>
              <h3 className="font-semibold text-base text-foreground">{track.title}</h3>
              <p className="text-xs text-muted-foreground">{track.artist} {track.album && `• ${track.album}`}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeRecentlySearched;