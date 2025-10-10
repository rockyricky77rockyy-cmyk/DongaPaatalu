import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail';
import { useYouTubeMusicAlbums } from '@/hooks/use-youtube-music'; // Changed to useYouTubeMusicAlbums
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HomeAlbumsSectionProps {
  className?: string;
}

const HomeAlbumsSection = ({ className }: HomeAlbumsSectionProps) => {
  const navigate = useNavigate();
  // Fetch Telugu albums specifically
  const { data: albums, isLoading: isAlbumsLoading, isError: isAlbumsError, error: albumsError } = useYouTubeMusicAlbums('Telugu albums'); 

  if (isAlbumsLoading) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Albums</h2>
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

  if (isAlbumsError) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Albums</h2>
        <p className="text-destructive">Error loading albums: {albumsError?.message}</p>
      </div>
    );
  }

  if (!albums || albums.length === 0) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Albums</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md::grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
        {albums.map((album) => (
          <div
            key={album.albumId} // Use albumId as key
            className="group cursor-pointer bg-card rounded-2xl p-3 transition-all border border-border hover:border-primary/50 hover:shadow-neon-strong relative overflow-hidden w-[140px] flex-shrink-0 md:w-auto md:flex-shrink"
            onClick={() => {
              if (album.albumId) { // Add this check
                navigate(`/album/${album.albumId}`, { state: { albumTitle: album.title, albumArtist: album.artist } });
              } else {
                console.warn("Attempted to navigate to an album with no ID:", album);
              }
            }}
          >
            <TrackThumbnail
              thumbnail={album.thumbnail} // Use album.thumbnail
              title={album.title}
              // color={album.cover_color} // Removed as YouTube Music albums don't have this
              className="aspect-square rounded-xl mb-3"
              iconClassName="w-12 h-12 text-white opacity-50"
            />
            <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{album.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
            <Button
              size="icon"
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg w-7 h-7"
              onClick={(e) => { // Explicitly navigate to album details
                e.stopPropagation();
                if (album.albumId) { // Add this check
                  navigate(`/album/${album.albumId}`, { state: { albumTitle: album.title, albumArtist: album.artist } });
                } else {
                  console.warn("Attempted to navigate to an album with no ID from button:", album);
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

export default HomeAlbumsSection;