import React from 'react';
import { Headphones, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useYouTubeMusicArtists } from '@/hooks/use-youtube-music'; // Changed to useYouTubeMusicArtists
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import TrackThumbnail from '../TrackThumbnail'; // Import TrackThumbnail

interface HomeArtistsSectionProps {
  className?: string;
}

const HomeArtistsSection = ({ className }: HomeArtistsSectionProps) => {
  const navigate = useNavigate();
  // Fetch Telugu artists specifically
  const { data: artists, isLoading, isError, error } = useYouTubeMusicArtists('Telugu artists');

  if (isLoading) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Artists</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-2xl p-3 text-center w-[140px] flex-shrink-0 md:w-auto md:flex-shrink">
              <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
              <Skeleton className="h-4 w-3/4 mb-1 mx-auto" />
              <Skeleton className="h-3 w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Artists</h2>
        <p className="text-destructive">Error loading artists: {error?.message}</p>
      </div>
    );
  }

  if (!artists || artists.length === 0) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Artists</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md::grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
        {artists.slice(0, 4).map((artist) => (
          <div
            key={artist.artistId} // Use artistId as key
            className="group cursor-pointer bg-card rounded-2xl p-3 text-center transition-all border border-border hover:border-primary/50 hover:shadow-neon-strong relative overflow-hidden w-[140px] flex-shrink-0 md:w-auto md:flex-shrink"
            onClick={() => navigate('/artists')} // Navigate to the Artists overview page
          >
            <TrackThumbnail // Reusing TrackThumbnail for artist avatars
              thumbnail={artist.thumbnail}
              title={artist.name}
              className="w-16 h-16 mx-auto rounded-full mb-3"
              iconClassName="w-8 h-8 text-white opacity-50"
            />
            <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{artist.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{artist.genre || 'Artist'}</p>
            <Button 
              size="icon" 
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg w-7 h-7"
            >
              <Play className="w-4 h-4 fill-current" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeArtistsSection;