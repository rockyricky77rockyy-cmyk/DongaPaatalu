import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Maximize2, Music } from "lucide-react";
import Visualizer from "./Visualizer";
import ExpandablePlayer from "./ExpandablePlayer";
import { useIsMobile } from "@/hooks/use-mobile";

const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(33);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <div className="bg-card border-t border-border">
        {/* Progress Bar */}
        <div className="px-4 pt-2 sm:px-8 sm:pt-4">
          <Slider
            value={[progress]}
            onValueChange={(value) => setProgress(value[0])}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1 sm:mt-2">
            <span>00:43</span>
            <span>02:00</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-8 sm:py-6">
          {/* Left: Track Info & Visualizer */}
          <div className="flex-1 flex items-center gap-2 sm:gap-4 cursor-pointer" onClick={() => setIsExpanded(true)}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            {!isMobile && ( // Hide visualizer on very small screens in compact player
              <div className="hidden md:block">
                <Visualizer barCount={20} className="h-12 w-32 sm:h-16 sm:w-48" />
              </div>
            )}
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-8 h-8 sm:w-10 sm:h-10">
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary w-10 h-10 sm:w-12 sm:h-12">
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            
            <Button
              size="icon"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-1" />}
            </Button>
            
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary w-10 h-10 sm:w-12 sm:h-12">
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-8 h-8 sm:w-10 sm:h-10">
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Right: Expand Button */}
          <div className="flex-1 flex justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary w-8 h-8 sm:w-10 sm:h-10"
              onClick={() => setIsExpanded(true)}
            >
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Player */}
      <ExpandablePlayer isOpen={isExpanded} onClose={() => setIsExpanded(false)} />
    </>
  );
};

export default Player;