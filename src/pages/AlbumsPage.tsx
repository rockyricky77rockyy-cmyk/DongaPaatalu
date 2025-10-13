import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Disc3, Play } from 'lucide-react';
import { useYouTubeMusicAlbums } from '@/hooks/use-youtube-music'; // Changed to useYouTubeMusicAlbums
import { Skeleton } from '@/components/ui/skeleton';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import TrackThumbnail from '@/components/TrackThumbnail'; // Import TrackThumbnail

const AlbumsPage = () => {
  const navigate = useNavigate();
  // Fetch Telugu albums specifically
  const { data: albums, isLoading, isError, error } = useYouTubeMusicAlbums('Telugu albums'); 
  const { playTrack } = useMusicPlayer();

  // The play button on the album card will now navigate to the album details page
  const handleAlbumClick = (albumId: string, albumTitle: string, albumArtist: string) => {
    navigate(`/album/${albumId}`, { state: { albumTitle, albumArtist } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <Button variant="ghost" onClick={() => navigate('/home')} className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">New Albums</h1>
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="group cursor-pointer bg-card rounded-2xl p-4">
                <Skeleton className="aspect-square rounded-xl mb-4" />
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
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">New Albums</h1>
          <p className="text-destructive">Error loading albums: {error?.message}</p>
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
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">New Albums</h1>
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {albums?.map((album) => (
            <div 
              key={album.albumId} // Use albumId as key
              className="group cursor-pointer bg-card rounded-2xl p-4 hover:bg-card/80 transition-all border border-border hover:border-primary/50 hover:shadow-neon relative overflow-hidden"
              onClick={() => {
                if (album.albumId) { // Add this check
                  handleAlbumClick(album.albumId, album.title, album.artist);
                } else {
                  console.warn("Attempted to navigate to an album with no ID:", album);
                }
              }}
            >
              <TrackThumbnail 
                thumbnail={album.thumbnail} 
                title={album.title} 
                className="aspect-square rounded-xl mb-4" 
                iconClassName="w-16 h-16 text-white opacity-50"
              />
              <h3 className="font-semibold text-lg text-foreground mb-1">{album.title}</h3>
              <p className="text-sm text-muted-foreground">{album.artist}</p>
              <Button 
                size="icon" 
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
              >
                <Disc3 className="w-5 h-5 fill-current" /> {/* Changed to Disc3 icon */}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlbumsPage;