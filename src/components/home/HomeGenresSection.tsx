import React from 'react';
import { Mic2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGenres } from '@/hooks/use-genres';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HomeGenresSectionProps {
  className?: string;
}

const HomeGenresSection = ({ className }: HomeGenresSectionProps) => {
  const navigate = useNavigate();
  const { data: genres, isLoading, isError, error } = useGenres();

  if (isLoading) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Genres</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-[140px] flex-shrink-0 rounded-xl md:w-auto md:flex-shrink" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn(className)}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Genres</h2>
        <p className="text-destructive">Error loading genres: {error?.message}</p>
      </div>
    );
  }

  if (!genres || genres.length === 0) {
    return null;
  }

  return (
    <div className={cn(className)}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Genres</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-x-0 md:pb-0">
        {genres.slice(0, 4).map((genre) => (
          <div
            key={genre.id}
            className={`group cursor-pointer ${genre.color} rounded-xl p-3 text-center shadow-card border border-border transition-all hover:border-transparent hover:bg-gradient-neon hover:shadow-neon-strong relative overflow-hidden w-[140px] flex-shrink-0 md:w-auto md:flex-shrink`}
            onClick={() => navigate('/genre')}
          >
            <Mic2 className="w-8 h-8 text-white opacity-70 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-white truncate">{genre.name}</h3>
            <Button 
              size="icon" 
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg w-7 h-7"
            >
              <Play className="w-4 h-4 fill-current" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeGenresSection;