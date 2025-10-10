import { Music, ChevronRight, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useTracks } from "@/hooks/use-tracks"; // Import useTracks hook
import { useMusicPlayer } from "@/context/MusicPlayerContext"; // Import useMusicPlayer
import { Skeleton } from "./ui/skeleton";

interface Track {
  videoId: string;
  title: string;
  artist: string;
  thumbnail?: string;
  album?: string;
}

interface PlaylistQueueProps {
  activeTrackId?: string; // Changed to string for UUID
  isMobile?: boolean;
  recentlySearched?: Track[]; // Added recentlySearched prop for mobile
}

const PlaylistQueue = ({ activeTrackId, isMobile = false, recentlySearched = [] }: PlaylistQueueProps) => {
  const { data: tracks, isLoading, isError, error } = useTracks();
  const { playTrack } = useMusicPlayer();

  const tracksToDisplay = isMobile ? recentlySearched : tracks;
  const isLoadingData = isMobile ? false : isLoading; // No loading state for recently searched
  const isErrorData = isMobile ? false : isError; // No error state for recently searched
  const errorData = isMobile ? null : error;

  if (isLoadingData) {
    return (
      <div className="flex flex-col bg-card/50 backdrop-blur-sm h-full">
        <div className="p-4 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Soru Pejje</h2>
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

  if (isErrorData) {
    return (
      <div className="flex flex-col bg-card/50 backdrop-blur-sm h-full p-4">
        <p className="text-destructive">Error loading playlist: {errorData?.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-card/50 backdrop-blur-sm h-full">
      {/* Header */}
      <div className="p-4 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {isMobile ? "Similarities" : "Soru Pejje"}
          </h2>
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
      <ScrollArea className="flex-1">
        <div className="px-4 pb-4 space-y-2">
          {tracksToDisplay?.map((track) => (
            <div
              key={track.videoId} // Use videoId as key for recently searched tracks
              className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all cursor-pointer group ${
                track.videoId === activeTrackId
                  ? 'bg-primary/20 border border-primary/50 shadow-neon'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => playTrack({ videoId: track.videoId || '', title: track.title, artist: track.artist, thumbnail: track.thumbnail, album: track.album })}
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
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>

              {/* Duration & Action */}
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">{track.duration}</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlaylistQueue;