import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import TrackThumbnail from '@/components/TrackThumbnail';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { useYouTubeMusicSearch, YouTubeMusicAlbum, YouTubeMusicTrack, YouTubeMusicArtist } from '@/hooks/use-youtube-music';
import { useNavigate } from 'react-router-dom';
import { Disc3, Play, ChevronLeft, Headphones } from 'lucide-react'; // Import Headphones icon
import { Button } from '@/components/ui/button';

interface HomeSearchResultsProps {
  searchTerm: string;
  onClearSearch: () => void; // New prop to clear the search term
}

const HomeSearchResults = ({ searchTerm, onClearSearch }: HomeSearchResultsProps) => {
  const { data: searchResults, isLoading: isSearchLoading, isError: isSearchError, error: searchError } = useYouTubeMusicSearch(searchTerm);
  const { playTrack } = useMusicPlayer();
  const navigate = useNavigate();

  const handleBackToHome = () => {
    onClearSearch(); // Clear the search term
    navigate('/home'); // Navigate to home
  };

  if (isSearchLoading) {
    return <p className="text-muted-foreground">Searching...</p>;
  }

  if (isSearchError) {
    return <p className="text-destructive">Error: {searchError?.message}</p>;
  }

  if (!searchResults || searchResults.length === 0) {
    return <p className="text-muted-foreground">No results found.</p>;
  }

  return (
    <div className="mt-8">
      <Button variant="ghost" onClick={handleBackToHome} className="mb-6 text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-5 h-5 mr-2" /> Back to Home
      </Button>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Search Results for "{searchTerm}"</h2>
      <ScrollArea className="h-[400px] rounded-md border border-border p-4">
        <div className="space-y-4">
          {searchResults.map((item, index) => {
            if (item.type === 'track') {
              const track = item as YouTubeMusicTrack;
              return (
                <div
                  key={track.videoId || index}
                  className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer relative group"
                  onClick={() => playTrack(track)}
                >
                  <TrackThumbnail
                    thumbnail={track.thumbnail}
                    title={track.title}
                    className="w-12 h-12 rounded-md"
                    iconClassName="w-6 h-6 text-primary"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{track.title}</h3>
                    <p className="text-sm text-muted-foreground">{track.artist} {track.album && `• ${track.album}`}</p>
                  </div>
                  <Button
                    size="icon"
                    className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
                    onClick={(e) => { // Explicitly play track
                      e.stopPropagation(); 
                      playTrack(track);
                    }}
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              );
            } else if (item.type === 'album') {
              const album = item as YouTubeMusicAlbum;
              return (
                <div
                  key={album.albumId || index}
                  className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer relative group"
                  onClick={() => {
                    console.log(`Navigating to album details for: ${album.title} (ID: ${album.albumId})`);
                    navigate(`/album/${album.albumId}`, { state: { albumTitle: album.title, albumArtist: album.artist } });
                  }}
                >
                  <TrackThumbnail
                    thumbnail={album.thumbnail}
                    title={album.title}
                    className="w-12 h-12 rounded-md"
                    iconClassName="w-6 h-6 text-primary"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{album.title}</h3>
                    <p className="text-sm text-muted-foreground">{album.artist} • Album</p>
                  </div>
                  <Button
                    size="icon"
                    className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
                    onClick={(e) => { // Explicitly navigate to album details
                      e.stopPropagation(); 
                      navigate(`/album/${album.albumId}`, { state: { albumTitle: album.title, albumArtist: album.artist } });
                    }}
                  >
                    <Disc3 className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              );
            } else if (item.type === 'artist') { // Handle artist type
              const artist = item as YouTubeMusicArtist;
              return (
                <div
                  key={artist.artistId || index}
                  className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer relative group"
                  onClick={() => {
                    console.log(`Navigating to artist details for: ${artist.name} (ID: ${artist.artistId})`);
                    navigate(`/artist/${artist.artistId}`, { state: { artistName: artist.name, artistThumbnail: artist.thumbnail } });
                  }}
                >
                  <TrackThumbnail
                    thumbnail={artist.thumbnail}
                    title={artist.name}
                    className="w-12 h-12 rounded-full" // Artists usually have round avatars
                    iconClassName="w-6 h-6 text-primary"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{artist.name}</h3>
                    <p className="text-sm text-muted-foreground">Artist</p>
                  </div>
                  <Button
                    size="icon"
                    className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
                    onClick={(e) => { // Explicitly navigate to artist details
                      e.stopPropagation(); 
                      navigate(`/artist/${artist.artistId}`, { state: { artistName: artist.name, artistThumbnail: artist.thumbnail } });
                    }}
                  >
                    <Headphones className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              );
            }
            return null;
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HomeSearchResults;