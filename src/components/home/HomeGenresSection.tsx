import React from 'react';
import { Mic2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGenres } from '@/hooks/use-genres';
import { useNavigate } from 'react-router-dom';

const HomeGenresSection = () => {
  const navigate = useNavigate();
  const { data: genres, isLoading, isError, error } = useGenres();

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Genres</h2>
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Genres</h2>
        <p className="text-destructive">Error loading genres: {error?.message}</p>
      </div>
    );
  }

  if (!genres || genres.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Genres</h2>
      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {genres.slice(0, 4).map((genre) => ( // Display up to 4 genres
          <div
            key={genre.id}
            className={`group cursor-pointer ${genre.color} rounded-xl p-6 text-center shadow-card border border-border hover:border-primary/50 hover:shadow-neon relative overflow-hidden`}
            onClick={() => navigate('/genre')} // Navigate to genre page
          >
            <Mic2 className="w-12 h-12 text-white opacity-70 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white">{genre.name}</h3>
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

export default HomeGenresSection;