import React from 'react';
import { List, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlaylists } from '@/hooks/use-playlists';
import { useNavigate } from 'react-router-dom';

const HomePlaylistsSection = () => {
  const navigate = useNavigate();
  const { data: playlists, isLoading, isError, error } = usePlaylists();

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Playlists</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:space-x-0 md:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group cursor-pointer bg-card rounded-2xl p-4 flex items-center gap-4 w-[280px] flex-shrink-0 md:w-auto">
              <Skeleton className="w-16 h-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Playlists</h2>
        <p className="text-destructive">Error loading playlists: {error?.message}</p>
      </div>
    );
  }

  if (!playlists || playlists.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Playlists</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:space-x-0 md:pb-0">
        {playlists.slice(0, 4).map((playlist) => (
          <div
            key={playlist.id}
            className="group cursor-pointer bg-card rounded-2xl p-4 shadow-card border border-border flex items-center gap-4 hover:border-primary/50 hover:shadow-neon relative overflow-hidden w-[280px] flex-shrink-0 md:w-auto"
            onClick={() => navigate('/playlists')}
          >
            <div className={`w-16 h-16 rounded-md bg-gradient-to-br ${playlist.cover_color} flex items-center justify-center flex-shrink-0`}>
              <List className="w-8 h-8 text-white opacity-70" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{playlist.name}</h3>
              <p className="text-muted-foreground text-sm">{playlist.track_count} tracks</p>
            </div>
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

export default HomePlaylistsSection;