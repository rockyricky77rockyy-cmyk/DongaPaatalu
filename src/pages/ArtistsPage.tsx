import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Headphones, Play } from 'lucide-react';
import { useYouTubeMusicArtists } from '@/hooks/use-youtube-music'; // Changed to useYouTubeMusicArtists
import { Skeleton } from '@/components/ui/skeleton';
import TrackThumbnail from '@/components/TrackThumbnail'; // Reusing TrackThumbnail for artist avatars

const ArtistsPage = () => {
  const navigate = useNavigate();
  const { data: artists, isLoading, isError, error } = useYouTubeMusicArtists();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Artists</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-24 h-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
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
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Artists</h1>
          <p className="text-destructive">Error loading artists: {error?.message}</p>
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
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Artists</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists?.map((artist) => (
            <div 
              key={artist.artistId} // Use artistId as key
              className="group cursor-pointer bg-card rounded-2xl p-4 text-center hover:bg-card/80 transition-all border border-border hover:border-primary/50 hover:shadow-neon relative overflow-hidden"
              onClick={() => console.log(`Navigate to artist: ${artist.name}`)} // Placeholder for artist details navigation
            >
              <TrackThumbnail // Reusing TrackThumbnail for artist avatars
                thumbnail={artist.thumbnail}
                title={artist.name}
                className="w-24 h-24 mx-auto rounded-full mb-4"
                iconClassName="w-12 h-12 text-white opacity-50"
              />
              <h3 className="font-semibold text-lg text-foreground mb-1">{artist.name}</h3>
              <p className="text-sm text-muted-foreground">{artist.genre || 'Artist'}</p>
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

export default ArtistsPage;