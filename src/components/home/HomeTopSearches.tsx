import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail';
import { useTracks } from '@/hooks/use-tracks';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

const HomeTopSearches = () => {
  const { data: allTracks, isLoading: isAllTracksLoading, isError: isAllTracksError, error: allTracksError } = useTracks();
  const { playTrack } = useMusicPlayer();

  if (isAllTracksLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Top Searches</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isAllTracksError) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Top Searches</h2>
        <p className="text-destructive">Error loading top searches: {allTracksError?.message}</p>
      </div>
    );
  }

  if (!allTracks || allTracks.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Top Searches</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allTracks.slice(0, 3).map((track) => (
          <div 
            key={track.id} 
            className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer"
            onClick={() => playTrack({ videoId: track.video_id || '', title: track.title, artist: track.artist, thumbnail: track.thumbnail, album: track.album })}
          >
            <TrackThumbnail 
              thumbnail={track.thumbnail} 
              title={track.title} 
              color={track.color} 
              className="w-12 h-12 rounded-md" 
              iconClassName="w-6 h-6 text-white opacity-70"
            />
            <div>
              <h3 className="font-semibold text-lg text-foreground">{track.title}</h3>
              <p className="text-sm text-muted-foreground">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeTopSearches;