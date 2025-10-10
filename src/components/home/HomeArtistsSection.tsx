import React from 'react';
import { Headphones, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useArtists } from '@/hooks/use-artists';
import { useNavigate } from 'react-router-dom';

const HomeArtistsSection = () => {
  const navigate = useNavigate();
  const { data: artists, isLoading, isError, error } = useArtists();

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Artists</h2>
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-2xl p-4 text-center">
              <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-3/4 mb-1 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Artists</h2>
        <p className="text-destructive">Error loading artists: {error?.message}</p>
      </div>
    );
  }

  if (!artists || artists.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Artists</h2>
      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {artists.slice(0, 4).map((artist) => ( // Display up to 4 artists
          <div
            key={artist.id}
            className="group cursor-pointer bg-card rounded-2xl p-4 text-center hover:bg-card/80 transition-all border border-border hover:border-primary/50 hover:shadow-neon relative overflow-hidden"
            onClick={() => navigate('/artists')} // Navigate to artists page
          >
            <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${artist.avatar_color} mb-4 flex items-center justify-center`}>
              <Headphones className="w-12 h-12 text-white opacity-50" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-1">{artist.name}</h3>
            <p className="text-sm text-muted-foreground">{artist.genre}</p>
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

export default HomeArtistsSection;