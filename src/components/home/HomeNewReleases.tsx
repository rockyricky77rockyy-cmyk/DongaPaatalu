import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail';
import { useNewReleases } from '@/hooks/use-new-releases';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

const HomeNewReleases = () => {
  const { data: newReleases, isLoading: isNewReleasesLoading, isError: isNewReleasesError, error: newReleasesError } = useNewReleases();
  const { playTrack } = useMusicPlayer();

  if (isNewReleasesLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">New Releases</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:space-x-0 md:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-2xl p-4 w-[160px] flex-shrink-0 md:w-auto md:flex-shrink">
              <Skeleton className="aspect-square rounded-xl mb-4" />
              <Skeleton className="h-5 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isNewReleasesError) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">New Releases</h2>
        <p className="text-destructive">Error loading new releases: {newReleasesError?.message}</p>
      </div>
    );
  }

  if (!newReleases || newReleases.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">New Releases</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:space-x-0 md:pb-0">
        {newReleases.map((track) => (
          <div
            key={track.id}
            className="group cursor-pointer bg-card rounded-2xl p-4 hover:bg-card/80 transition-all border border-border hover:border-primary/50 hover:shadow-neon relative overflow-hidden w-[160px] flex-shrink-0 md:w-auto md:flex-shrink"
            onClick={() => playTrack({ videoId: track.video_id || '', title: track.title, artist: track.artist, thumbnail: track.thumbnail, album: track.album })}
          >
            <TrackThumbnail 
              thumbnail={track.thumbnail} 
              title={track.title} 
              color={track.color} 
              className="aspect-square rounded-xl mb-4" 
              iconClassName="w-14 h-14 text-white opacity-50"
            />
            <h3 className="font-semibold text-base text-foreground mb-1 truncate">{track.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
            <Button 
              size="icon" 
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
            >
              <Play className="w-5 h-5 fill-current" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeNewReleases;