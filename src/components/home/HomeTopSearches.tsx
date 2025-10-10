import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail';
import { useNewReleases } from '@/hooks/use-new-releases';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils';

interface HomeTopSearchesProps {
  className?: string;
}

const HomeTopSearches = ({ className }: HomeTopSearchesProps) => {
  const { data: topTracks, isLoading: isTopTracksLoading, isError: isTopTracksError, error: topTracksError } = useNewReleases();
  const { playTrack } = useMusicPlayer();

  if (isTopTracksLoading) {
    return (
      <div className={cn("mt-8", className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Top Searches</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:space-x-0 md:pb-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-[220px] flex-shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isTopTracksError) {
    return (
      <div className={cn("mt-8", className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Top Searches</h2>
        <p className="text-destructive">Error loading top searches: {topTracksError?.message}</p>
      </div>
    );
  }

  if (!topTracks || topTracks.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-8", className)}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Top Searches</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md::grid-cols-2 lg:grid-cols-3 md:space-x-0 md:pb-0">
        {topTracks.slice(0, 3).map((track) => (
          <div 
            key={track.id} 
            className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer w-[220px] flex-shrink-0 md:w-auto md:flex-shrink"
            onClick={() => playTrack({ videoId: track.video_id || '', title: track.title, artist: track.artist, thumbnail: track.thumbnail, album: track.album })}
          >
            <TrackThumbnail 
              thumbnail={track.thumbnail} 
              title={track.title} 
              color={track.color} 
              className="w-10 h-10 rounded-md" 
              iconClassName="w-5 h-5 text-white opacity-70"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground truncate">{track.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeTopSearches;