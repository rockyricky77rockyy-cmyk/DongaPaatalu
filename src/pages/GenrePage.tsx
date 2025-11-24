import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic2 } from 'lucide-react';
import { useGenres } from '@/hooks/use-genres';
import { Skeleton } from '@/components/ui/skeleton';

const GenrePage = () => {
  const navigate = useNavigate();
  const { data: genres, isLoading, isError, error } = useGenres();

  const handleGenreClick = (genreName: string) => {
    navigate(`/genre/songs`, { state: { queryName: genreName } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Genres</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Genres</h1>
          <p className="text-destructive">Error loading genres: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 sm:p-8">
        <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Genres</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {genres?.map((genre) => (
            <div 
              key={genre.id} 
              className={`group cursor-pointer ${genre.color} rounded-xl p-6 text-center shadow-card border border-border hover:border-primary/50 hover:shadow-neon`}
              onClick={() => handleGenreClick(genre.name)}
            >
              <Mic2 className="w-12 h-12 text-white opacity-70 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white">{genre.name}</h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenrePage;