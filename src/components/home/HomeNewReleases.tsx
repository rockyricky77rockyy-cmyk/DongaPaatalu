import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail';
import { useNewReleases } from '@/hooks/use-new-releases';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { cn } from '@/lib/utils';
import Visualizer from '@/components/Visualizer'; // Import Visualizer

interface HomeNewReleasesProps {
  className?: string;
}

const HomeNewReleases = ({ className }: HomeNewReleasesProps) => {
  const { data: newReleases, isLoading: isNewReleasesLoading, isError: isNewReleasesError, error: newReleasesError } = useNewReleases();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer(); // Get currentTrack and isPlaying

  if (isNewReleasesLoading) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">New Releases</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-2xl p-3 w-[140px] flex-shrink-0 md:w-auto md:flex-shrink">
              <Skeleton className="aspect-square rounded-xl mb-3" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isNewReleasesError) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">New Releases</h2>
        <p className="text-destructive">Error loading new releases: {newReleasesError?.message}</p>
      </div>
    );
  }

  if (!newReleases || newReleases.length === 0) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">New Releases</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
        {newReleases.map((track) => {
          const isCurrentTrack = currentTrack?.videoId === track.videoId;
          return (
            <div
              key={track.videoId}
              className="group cursor-pointer bg-card rounded-2xl p-3 transition-all border border-border hover:border-primary/50 hover:shadow-neon-strong relative overflow-hidden w-[140px] flex-shrink-0 md:w-auto md:flex-shrink"
              onClick={() => playTrack({ videoId: track.videoId || '', title: track.title, artist: String(track.artist), thumbnail: track.thumbnail, album: track.album, duration: track.duration })}
            >
              <TrackThumbnail 
                thumbnail={track.thumbnail} 
                title={track.title} 
                color={track.color} 
                className="aspect-square rounded-xl mb-3" 
                iconClassName="w-12 h-12 text-white opacity-50"
              />
              <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{track.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{String(track.artist)}</p>
              {isCurrentTrack && isPlaying && (
                <div className="absolute top-3 right-3">
                  <Visualizer barCount={5} className="h-4 w-8" isPlaying={isPlaying} animationIntervalMs={150} />
                </div>
              )}
              <Button 
                size="icon" 
                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg w-7 h-7"
              >
                <Play className="w-4 h-4 fill-current" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeNewReleases;