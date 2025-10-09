import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Maximize2, Music } from "lucide-react";
import Visualizer from "./Visualizer";
import ExpandablePlayer from "./ExpandablePlayer";

const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(33);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="bg-card border-t border-border">
        {/* Progress Bar */}
        <div className="px-8 pt-4">
          <Slider
            value={[progress]}
            onValueChange={(value) => setProgress(value[0])}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>00:43</span>
            <span>02:00</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-8 py-6">
          {/* Left: Track Info & Visualizer */}
          <div className="flex-1 flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(true)}>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block">
              <Visualizer barCount={20} className="h-16 w-48" />
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Shuffle className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <SkipBack className="w-6 h-6" />
            </Button>
            
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
            
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <SkipForward className="w-6 h-6" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Repeat className="w-5 h-5" />
            </Button>
          </div>

          {/* Right: Expand Button */}
          <div className="flex-1 flex justify-end">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-primary"
              onClick={() => setIsExpanded(true)}
            >
              <Maximize2 className="w-5 h-5" />
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
