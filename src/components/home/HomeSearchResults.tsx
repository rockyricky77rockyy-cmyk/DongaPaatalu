import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import TrackThumbnail from '@/components/TrackThumbnail';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { useYouTubeMusicSearch } from '@/hooks/use-youtube-music';

interface HomeSearchResultsProps {
  searchTerm: string;
}

const HomeSearchResults = ({ searchTerm }: HomeSearchResultsProps) => {
  const { data: searchResults, isLoading: isSearchLoading, isError: isSearchError, error: searchError } = useYouTubeMusicSearch(searchTerm);
  const { playTrack } = useMusicPlayer();

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
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Search Results for "{searchTerm}"</h2>
      <ScrollArea className="h-[400px] rounded-md border border-border p-4">
        <div className="space-y-4">
          {searchResults.map((track, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer"
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
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HomeSearchResults;