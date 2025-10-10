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
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:space-x-0 md:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-[160px] flex-shrink-0 rounded-xl md:w-auto md:flex-shrink" />
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
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:space-x-0 md:pb-0">
        {genres.slice(0, 4).map((genre) => (
          <div
            key={genre.id}
            className={`group cursor-pointer ${genre.color} rounded-xl p-4 text-center shadow-card border border-border hover:border-primary/50 hover:shadow-neon relative overflow-hidden w-[160px] flex-shrink-0 md:w-auto md:flex-shrink`}
            onClick={() => navigate('/genre')}
          >
            <Mic2 className="w-10 h-10 text-white opacity-70 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white truncate">{genre.name}</h3>
            <Button 
              size="icon" 
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
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