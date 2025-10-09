import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Maximize2, Music } from "lucide-react";
import Visualizer from "./Visualizer";
import ExpandablePlayer from "./ExpandablePlayer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { cn } from "@/lib/utils"; // Import cn for conditional classnames

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playbackProgress,
    currentTime,
    duration,
    playerRef,
    playNextTrack,
    playPreviousTrack,
    isShuffling, // New
    toggleShuffle, // New
    repeatMode, // New
    toggleRepeatMode, // New
  } = useMusicPlayer();
  const isMobile = useIsMobile();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (value: number[]) => {
    if (playerRef.current && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      playerRef.current.seekTo(newTime);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 w-full z-50 bg-card border-t border-border">
        {/* Progress Bar */}
        <div className="px-4 pt-2 sm:px-8 sm:pt-4">
          <Slider
            value={[playbackProgress]}
            onValueChange={handleSliderChange}
            max={100}
            step={1}
            className="w-full"
            disabled={!currentTrack} // Disable slider if no track is playing
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1 sm:mt-2">
            <span>{currentTrack ? formatTime(currentTime) : '00:00'}</span>
            <span>{currentTrack ? formatTime(duration) : '00:00'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-8 sm:py-6">
          {/* Left: Track Info & Visualizer */}
          <div className="flex-1 flex items-center gap-2 sm:gap-4 cursor-pointer" onClick={() => currentTrack && setIsExpanded(true)}>
            {currentTrack?.thumbnail ? (
              <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-medium text-foreground truncate">
                {currentTrack ? currentTrack.title : 'No track playing'}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                {currentTrack ? currentTrack.artist : 'Select a song to start'}
              </span>
            </div>
            {!isMobile && currentTrack && ( // Hide visualizer on very small screens in compact player, and if no track
              <div className="hidden md:block ml-4">
                <Visualizer barCount={20} className="h-12 w-32 sm:h-16 sm:w-48" isPlaying={isPlaying} animationIntervalMs={100} /> {/* Pass animationIntervalMs */}
              </div>
            )}
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10",
                isShuffling ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={toggleShuffle} // Connected to context function
              disabled={!currentTrack}
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground hover:text-primary w-10 h-10 sm:w-12 sm:h-12" 
              onClick={playPreviousTrack} // Connected to context function
              disabled={!currentTrack}
            >
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            
            <Button
              size="icon"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon"
              onClick={togglePlayPause}
              disabled={!currentTrack} // Disable play/pause if no track
            >
              {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-1" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground hover:text-primary w-10 h-10 sm:w-12 sm:h-12" 
              onClick={playNextTrack} // Connected to context function
              disabled={!currentTrack}
            >
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10",
                repeatMode !== 'none' ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={toggleRepeatMode} // Connected to context function
              disabled={!currentTrack}
            >
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
              {repeatMode === 'track' && <span className="absolute text-xs -bottom-1 right-0">1</span>}
            </Button>
          </div>

          {/* Right: Expand Button */}
          <div className="flex-1 flex justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary w-8 h-8 sm:w-10 sm:h-10"
              onClick={() => currentTrack && setIsExpanded(true)} // Only expand if a track is playing
              disabled={!currentTrack} // Disable expand if no track
            >
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Player */}
      {currentTrack && <ExpandablePlayer isOpen={isExpanded} onClose={() => setIsExpanded(false)} />}
    </>
  );
};

export default Player;