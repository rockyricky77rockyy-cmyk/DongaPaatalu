import React from 'react';
import { List, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useYouTubeMusicPlaylists } from '@/hooks/use-youtube-music'; // Changed to useYouTubeMusicPlaylists
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import TrackThumbnail from '../TrackThumbnail'; // Import TrackThumbnail

interface HomePlaylistsSectionProps {
  className?: string;
}

const HomePlaylistsSection = ({ className }: HomePlaylistsSectionProps) => {
  const navigate = useNavigate();
  const { data: playlists, isLoading, isError, error } = useYouTubeMusicPlaylists();

  if (isLoading) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Playlists</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-2xl p-3 flex items-center gap-3 w-[200px] flex-shrink-0 md:w-auto md:flex-shrink">
              <Skeleton className="w-10 h-10 rounded-md" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Playlists</h2>
        <p className="text-destructive">Error loading playlists: {error?.message}</p>
      </div>
    );
  }

  if (!playlists || playlists.length === 0) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Playlists</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
        {playlists.slice(0, 4).map((playlist) => (
          <div
            key={playlist.playlistId} // Use playlistId as key
            className="group cursor-pointer bg-card rounded-2xl p-3 shadow-card border border-border flex items-center gap-3 transition-all hover:border-primary/50 hover:shadow-neon-strong relative overflow-hidden w-[200px] flex-shrink-0 md:w-auto md:flex-shrink"
            onClick={() => navigate('/playlists')} // Navigate to the Playlists overview page
          >
            <TrackThumbnail // Reusing TrackThumbnail for playlist covers
              thumbnail={playlist.thumbnail}
              title={playlist.name}
              className="w-10 h-10 rounded-md flex-shrink-0"
              iconClassName="w-5 h-5 text-white opacity-70"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">{playlist.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{playlist.trackCount} tracks</p>
            </div>
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

export default HomePlaylistsSection;