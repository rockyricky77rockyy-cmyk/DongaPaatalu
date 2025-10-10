import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail';
import { useAlbums } from '@/hooks/use-albums';
import { useNavigate } from 'react-router-dom';

const HomeAlbumsSection = () => {
  const navigate = useNavigate();
  const { data: albums, isLoading: isAlbumsLoading, isError: isAlbumsError, error: albumsError } = useAlbums();

  if (isAlbumsLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Albums</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:space-x-0 md:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-2xl p-4 w-[180px] flex-shrink-0 md:w-auto">
              <Skeleton className="aspect-square rounded-xl mb-4" />
              <Skeleton className="h-6 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isAlbumsError) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Albums</h2>
        <p className="text-destructive">Error loading albums: {albumsError?.message}</p>
      </div>
    );
  }

  if (!albums || albums.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Albums</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:space-x-0 md:pb-0">
        {albums.map((album) => (
          <div
            key={album.id}
            className="group cursor-pointer bg-card rounded-2xl p-4 hover:bg-card/80 transition-all border border-border hover:border-primary/50 hover:shadow-neon relative overflow-hidden w-[180px] flex-shrink-0 md:w-auto"
            onClick={() => navigate('/albums')}
          >
            <TrackThumbnail 
              thumbnail={undefined}
              title={album.title} 
              color={album.cover_color} 
              className="aspect-square rounded-xl mb-4" 
              iconClassName="w-16 h-16 text-white opacity-50"
            />
            <h3 className="font-semibold text-lg text-foreground mb-1">{album.title}</h3>
            <p className="text-sm text-muted-foreground">{album.artist_name}</p>
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

export default HomeAlbumsSection;