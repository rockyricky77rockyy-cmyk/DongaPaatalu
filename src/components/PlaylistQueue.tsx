import { Music, ChevronRight, Search, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { YouTubeMusicTrack, useYouTubeRelatedTracks } from "@/hooks/use-youtube-music";
import { useEffect } from "react";

interface PlaylistQueueProps {
  activeVideoId?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  currentTrack?: YouTubeMusicTrack | null;
}

const PlaylistQueue = ({ activeVideoId, isMobile = false, isOpen = true, onToggle, currentTrack }: PlaylistQueueProps) => {
  const { playTrack, updateRecommendations, currentRecommendations, recentlySearched } = useMusicPlayer();
  const { data: fetchedRelatedTracks, isLoading: isLoadingRelated, isError: isErrorRelated, error: errorRelated } = useYouTubeRelatedTracks(currentTrack);

  // This effect ensures that if related tracks are fetched and there's no active album/playlist queue,
  // they become the current recommendations.
  useEffect(() => {
    // Only update currentRecommendations if it's currently empty (meaning no album/playlist queue is active)
    // AND we have fetched related tracks for the current playing track.
    if (fetchedRelatedTracks && fetchedRelatedTracks.length > 0 && currentRecommendations.length === 0) {
      updateRecommendations(fetchedRelatedTracks, currentTrack?.videoId || null);
    }
  }, [fetchedRelatedTracks, currentTrack?.videoId, updateRecommendations, currentRecommendations.length]);


  let tracksToDisplay: YouTubeMusicTrack[] = [];
  let queueTitle = "Recommendations";
  let isLoadingQueue = false;
  let isErrorQueue = false;
  let errorQueue: Error | null = null;

  if (currentRecommendations.length > 0) {
    tracksToDisplay = currentRecommendations;
    queueTitle = "Current Queue"; // Reflects album/playlist queue
  } else if (currentTrack) {
    // If no specific queue, but a track is playing, show related tracks
    tracksToDisplay = fetchedRelatedTracks || [];
    isLoadingQueue = isLoadingRelated;
    isErrorQueue = isErrorRelated;
    errorQueue = errorRelated;
    queueTitle = "Related Tracks";
  } else {
    // If nothing playing, show recently searched
    tracksToDisplay = recentlySearched;
    queueTitle = "Recently Played";
  }

  if (isLoadingQueue) {
    return (
      <div className="flex flex-col bg-card/50 backdrop-blur-sm h-full">
        <div className="p-4 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {queueTitle}
            </h2>
            {!isMobile && <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
          </div>
          {!isMobile && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 sm:pl-10 bg-input border-border rounded-lg sm:rounded-xl h-9 sm:h-10 text-sm"
              />
            </div>
          )}
          {!isMobile && (
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 text-primary bg-primary/10 hover:bg-primary/20 text-sm h-9 sm:h-10">
                Plist
              </Button>
              <Button variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground text-sm h-9 sm:h-10">
                Playlet Plesly
              </Button>
            </div>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="px-4 pb-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-md" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (isErrorQueue) {
    return (
      <div className="flex flex-col bg-card/50 backdrop-blur-sm h-full p-4">
        <p className="text-destructive">Error loading {queueTitle.toLowerCase()}: {errorQueue?.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-card/50 backdrop-blur-sm h-full">
      {/* Header */}
      <div className="p-4 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {queueTitle}
          </h2>
          {isMobile && onToggle && ( // Show toggle button only on mobile
            <Button variant="ghost" size="icon" onClick={onToggle} className="w-8 h-8 text-muted-foreground hover:text-foreground">
              {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </Button>
          )}
          {!isMobile && <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
        </div>
        
        {/* Search Input (Desktop Only) */}
        {!isMobile && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 sm:pl-10 bg-input border-border rounded-lg sm:rounded-xl h-9 sm:h-10 text-sm"
            />
          </div>
        )}

        {/* Tabs (Desktop Only) */}
        {!isMobile && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1 text-primary bg-primary/10 hover:bg-primary/20 text-sm h-9 sm:h-10"
            >
              Plist
            </Button>
            <Button variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground text-sm h-9 sm:h-10">
              Playlet Plesly
            </Button>
          </div>
        )}
      </div>

      {/* Playlist / Similarities */}
      {isOpen && ( // Conditionally render content based on isOpen
        <ScrollArea className="flex-1">
          <div className="px-4 pb-4 space-y-2">
            {tracksToDisplay && tracksToDisplay.length > 0 ? (
              tracksToDisplay.map((track) => (
                <div
                  key={track.videoId}
                  className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all cursor-pointer group ${
                    track.videoId === activeVideoId
                      ? 'bg-primary/20 border border-primary/50 shadow-neon'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => playTrack({ videoId: track.videoId || '', title: track.title, artist: String(track.artist), thumbnail: track.thumbnail, album: track.album })}
                >
                  {/* Album Art */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md sm:rounded-lg bg-gradient-to-br ${track.color || 'from-gray-600 to-gray-800'} flex items-center justify-center flex-shrink-0`}>
                    {track.thumbnail ? (
                      <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover rounded-md sm:rounded-lg" />
                    ) : (
                      <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate text-sm sm:text-base">{track.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{String(track.artist)}</p>
                  </div>

                  {/* Duration & Action */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">{track.duration}</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No {queueTitle.toLowerCase()} found. Play a song to see suggestions!
              </p>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default PlaylistQueue;