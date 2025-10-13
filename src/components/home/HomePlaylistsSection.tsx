import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useYouTubeMusicPlaylists } from '@/hooks/use-youtube-music';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import TrackThumbnail from '../TrackThumbnail';

interface HomePlaylistsSectionProps {
  className?: string;
}

const HomePlaylistsSection = ({ className }: HomePlaylistsSectionProps) => {
  const navigate = useNavigate();
  // Fetch Telugu playlists specifically
  const { data: playlists, isLoading, isError, error } = useYouTubeMusicPlaylists('Telugu playlists');

  if (isLoading) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Playlists</h2>
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
        {playlists.map((playlist) => (
          <div
            key={playlist.playlistId}
            className="group cursor-pointer bg-card rounded-2xl p-3 text-center transition-all border border-border hover:border-primary/50 hover:shadow-neon-strong relative overflow-hidden w-[140px] flex-shrink-0 md:w-auto md:flex-shrink"
            onClick={() => {
              if (playlist.playlistId) {
                navigate(`/playlist/${playlist.playlistId}`, { state: { playlistName: playlist.name, playlistThumbnail: playlist.thumbnail } });
              } else {
                console.warn("Attempted to navigate to a playlist with no ID:", playlist);
              }
            }}
          >
            <TrackThumbnail
              thumbnail={playlist.thumbnail}
              title={playlist.name}
              className="aspect-square rounded-xl mb-3"
              iconClassName="w-12 h-12 text-white opacity-50"
            />
            <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{playlist.name}</h3>
            <Button
              size="icon"
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg w-7 h-7"
              onClick={(e) => {
                e.stopPropagation();
                if (playlist.playlistId) {
                  navigate(`/playlist/${playlist.playlistId}`, { state: { playlistName: playlist.name, playlistThumbnail: playlist.thumbnail } });
                } else {
                  console.warn("Attempted to navigate to a playlist with no ID from button:", playlist);
                }
              }}
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