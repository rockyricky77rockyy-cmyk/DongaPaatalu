import { useState } from "react";
import { X, ChevronDown, Menu, Search, Minimize2, Copy, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";
import Visualizer from "./Visualizer";
import PlaylistQueue from "./PlaylistQueue";
import NeonLogo from "./NeonLogo";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExpandablePlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpandablePlayer = ({ isOpen, onClose }: ExpandablePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(33);
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background animate-slide-up">
      {/* Desktop Version */}
      {!isMobile ? (
        <div className="h-full flex flex-col p-8">
          {/* Neon Border Container */}
          <div className="flex-1 rounded-3xl border-4 border-transparent bg-gradient-to-br from-primary via-accent to-secondary p-1 shadow-neon-strong">
            <div className="h-full rounded-3xl bg-background flex overflow-hidden">
              {/* Left Sidebar - Navigation */}
              <aside className="w-64 bg-card/50 backdrop-blur-sm p-6 space-y-2 border-r border-border">
                <div className="mb-8 flex items-center gap-3">
                  <NeonLogo size="small" />
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <Menu className="w-5 h-5" />
                  </Button>
                </div>

                <Button variant="default" className="w-full justify-start gap-3 bg-primary shadow-neon">
                  <span className="w-5 h-5 flex items-center justify-center">🏠</span>
                  Bırajdor
                </Button>
                {["MuzlÇru", "Mluzamvlön", "Açrıstıst", "Bölrioct", "Klenrıt", "Llziıist", "Yeparıar"].map((item, i) => (
                  <Button key={i} variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                    <span className="w-5 h-5">📱</span>
                    {item}
                  </Button>
                ))}
              </aside>

              {/* Center - Player */}
              <main className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="p-6 flex items-center justify-between border-b border-border">
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Petweer...</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Search className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Minimize2 className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Copy className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </header>

                {/* Album Art & Visualizer */}
                <div className="flex-1 flex items-center justify-center p-12">
                  <div className="relative">
                    {/* Album Art with Neon H */}
                    <div className="w-96 h-96 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-neon-strong relative overflow-hidden">
                      {/* Animated bars in background */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <div className="grid grid-cols-8 gap-2 h-3/4 w-3/4">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-white/50 rounded-full animate-visualizer"
                              style={{ animationDelay: `${i * 0.05}s` }}
                            />
                          ))}
                        </div>
                      </div>
                      {/* H Logo */}
                      <div className="relative z-10">
                        <NeonLogo size="large" />
                      </div>
                    </div>

                    {/* Left Visualizer */}
                    <div className="absolute -left-32 top-1/2 -translate-y-1/2 h-64">
                      <Visualizer barCount={20} direction="horizontal" className="h-full" />
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-12 pb-4">
                  <Slider
                    value={[progress]}
                    onValueChange={(value) => setProgress(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>00:43</span>
                    <span>05:00</span>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="p-8 border-t border-border flex items-center">
                  {/* Left Visualizer */}
                  <div className="flex-1">
                    <Visualizer barCount={25} className="h-24 w-64" />
                  </div>

                  {/* Center Controls */}
                  <div className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Shuffle className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                      <SkipBack className="w-7 h-7" />
                    </Button>
                    <Button
                      size="icon"
                      className="w-16 h-16 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                      <SkipForward className="w-7 h-7" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Repeat className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Right Space */}
                  <div className="flex-1 flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <span className="text-sm">🎵</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <span className="text-sm">🎤</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <span className="text-sm">📊</span>
                    </Button>
                  </div>
                </div>
              </main>

              {/* Right Sidebar - Playlist */}
              <aside className="w-96 border-l border-border">
                <PlaylistQueue activeTrackId={3} />
              </aside>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile Version */
        <div className="h-full flex flex-col bg-gradient-to-br from-cyan-500/10 via-background to-purple-500/10">
          {/* Top Bar */}
          <header className="p-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ChevronDown className="w-6 h-6" />
            </Button>
            <div className="flex-1 flex justify-center">
              <NeonLogo size="small" />
            </div>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </header>

          {/* Album Art */}
          <div className="flex justify-center p-8">
            <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-neon-strong relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-48 h-48 rounded-full border-8 border-white/30 animate-pulse-glow" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 bg-white/40 rounded-full animate-visualizer"
                    style={{
                      height: `${Math.random() * 100 + 50}px`,
                      left: `${(i / 20) * 100}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center px-8 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">Sertıam Sounte</h2>
            <p className="text-muted-foreground">Artisi Arnéct</p>
          </div>

          {/* Visualizer */}
          <div className="px-8 mb-8">
            <Visualizer barCount={40} className="h-20" />
          </div>

          {/* Controls */}
          <div className="px-8 mb-8">
            <div className="flex items-center justify-center gap-8 mb-8">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Shuffle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-14 h-14 rounded-full bg-card">
                <SkipBack className="w-6 h-6" />
              </Button>
              <Button
                size="icon"
                className="w-20 h-20 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon-strong"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </Button>
              <Button variant="ghost" size="icon" className="w-14 h-14 rounded-full bg-card">
                <SkipForward className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Repeat className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Playlist Section */}
          <div className="flex-1 bg-card/80 backdrop-blur-lg rounded-t-3xl border-t-2 border-primary/30 overflow-hidden">
            <PlaylistQueue activeTrackId={2} isMobile />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandablePlayer;
