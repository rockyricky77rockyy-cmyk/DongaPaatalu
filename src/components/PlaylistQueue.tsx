import { Music, ChevronRight, Search, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { YouTubeMusicTrack, useYouTubeRelatedTracks } from "@/hooks/use-youtube-music";
import { formatDuration } from '@/lib/utils';
import Visualizer from '@/components/Visualizer'; // Import Visualizer

interface PlaylistQueueProps {
  activeVideoId?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  currentTrack?: YouTubeMusicTrack | null;
}

const PlaylistQueue = ({ activeVideoId, isMobile = false, isOpen = true, onToggle, currentTrack }: PlaylistQueueProps) => {
  const { playTrack, currentPlaylist, currentPlaylistIndex, isPlaying } = useMusicPlayer(); // Get isPlaying
  const { data: relatedTracks, isLoading: isLoadingRelated, isError: isErrorRelated, error: errorRelated } = useYouTubeRelatedTracks(currentTrack);

  const isSingleTrackMode = currentPlaylist.length === 1 && currentPlaylist[0].videoId === currentTrack?.videoId;

  const tracksToDisplay = isSingleTrackMode ? relatedTracks : (currentPlaylist.length > 0 ? currentPlaylist : relatedTracks);
  
  const title = isSingleTrackMode ? "Recommendations" : (currentPlaylist.length > 0 ? "Current Playlist" : "Recommendations");

  const isLoadingData = (isSingleTrackMode || currentPlaylist.length === 0) ? isLoadingRelated : false;
  const isErrorData = (isSingleTrackMode || currentPlaylist.length === 0) ? isErrorRelated : false;
  const errorData = (isSingleTrackMode || currentPlaylist.length === 0) ? errorRelated : undefined;

  if (isLoadingData) {
    return (
      <div className="flex flex-col bg-card/50 backdrop-blur-sm h-full">
        <div className="p-4 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {title}
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

  if (isErrorData) {
    return (
      <div className="flex flex-col bg-card/50 backdrop-blur-sm h-full p-4">
        <p className="text-destructive">Error loading {title.toLowerCase()}: {errorData?.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-card/50 backdrop-blur-sm h-full">
      {/* Header */}
      <div className="p-4 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {title}
          </h2>
          {isMobile && onToggle && (
            <Button variant="ghost" size="icon" onClick={onToggle} className="w-8 h-8 text-muted-foreground hover:text-foreground">
              {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </Button>
          )}
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

      {isOpen && (
        <ScrollArea className="flex-1">
          <div className="px-4 pb-4 space-y-2">
            {tracksToDisplay && tracksToDisplay.length > 0 ? (
              tracksToDisplay.map((track, index) => {
                const isCurrentTrack = track.videoId === activeVideoId;
                return (
                  <div
                    key={track.videoId}
                    className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all cursor-pointer group ${
                      isCurrentTrack
                        ? 'bg-primary/20 border border-primary/50 shadow-neon'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => playTrack(
                      track, 
                      currentPlaylist.length > 0 ? currentPlaylist : relatedTracks, 
                      currentPlaylist.length > 0 ? index : undefined,
                      isSingleTrackMode
                    )}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md sm:rounded-lg bg-gradient-to-br ${track.color || 'from-gray-600 to-gray-800'} flex items-center justify-center flex-shrink-0`}>
                      {track.thumbnail ? (
                        <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover rounded-md sm:rounded-lg" />
                      ) : (
                        <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate text-sm sm:text-base">{track.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{String(track.artist)}</p>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {isCurrentTrack && isPlaying && (
                        <Visualizer barCount={5} className="h-4 w-8" isPlaying={isPlaying} animationIntervalMs={150} />
                      )}
                      <span className="text-xs sm:text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No {title.toLowerCase()} found. Play a song to see suggestions!
              </p>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default PlaylistQueue;