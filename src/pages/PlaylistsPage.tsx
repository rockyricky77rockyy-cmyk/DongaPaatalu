import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, List, Play } from 'lucide-react';
import { useYouTubeMusicPlaylists } from '@/hooks/use-youtube-music'; // Changed to useYouTubeMusicPlaylists
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail'; // Reusing TrackThumbnail for playlist covers

const PlaylistsPage = () => {
  const navigate = useNavigate();
  const { data: playlists, isLoading, isError, error } = useYouTubeMusicPlaylists('Telugu playlists');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Playlists</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-card rounded-xl p-6">
                <Skeleton className="w-16 h-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
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
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Playlists</h1>
          <p className="text-destructive">Error loading playlists: {error?.message}</p>
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
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Playlists</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists?.map((playlist) => (
            <div 
              key={playlist.playlistId} // Use playlistId as key
              className="group cursor-pointer bg-card rounded-xl p-6 shadow-card border border-border flex items-center gap-4 hover:border-primary/50 hover:shadow-neon relative overflow-hidden"
              onClick={() => {
                if (playlist.playlistId) { // Add this check
                  navigate(`/playlist/${playlist.playlistId}`, { state: { playlistName: String(playlist.name), playlistThumbnail: playlist.thumbnail } });
                } else {
                  console.warn("Attempted to navigate to a playlist with no ID:", playlist);
                }
              }}
            >
              <TrackThumbnail // Reusing TrackThumbnail for playlist covers
                thumbnail={playlist.thumbnail}
                title={String(playlist.name)}
                className="w-16 h-16 rounded-md flex-shrink-0"
                iconClassName="w-8 h-8 text-white opacity-70"
              />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{String(playlist.name)}</h2>
                <p className="text-muted-foreground text-sm">{playlist.trackCount} tracks</p>
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
    </div>
  );
};

export default PlaylistsPage;