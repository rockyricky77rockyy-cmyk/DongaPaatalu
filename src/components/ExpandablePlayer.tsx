import { useState } from "react";
import { X, ChevronDown, Menu, Search, Minimize2, Copy, Maximize2, Home as HomeIcon, Music, Disc3, Headphones, Radio, Mic2, List } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";
import Visualizer from "./Visualizer";
import PlaylistQueue from "./PlaylistQueue";
import NeonLogo from "./NeonLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useMusicPlayer } from "@/context/MusicPlayerContext"; // Import useMusicPlayer

interface ExpandablePlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpandablePlayer = ({ isOpen, onClose }: ExpandablePlayerProps) => {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playbackProgress,
    currentTime,
    duration,
    playerRef, // We need playerRef to seek
  } = useMusicPlayer();
  const [activeNav, setActiveNav] = useState("home"); // State for internal navigation in expanded player
  const isMobile = useIsMobile();

  const navItems = [
    { id: "home", label: "Home", icon: HomeIcon, path: "/home" },
    { id: "music", label: "Music", icon: Music, path: "/music" },
    { id: "albums", label: "Albums", icon: Disc3, path: "/albums" },
    { id: "artists", label: "Artists", icon: Headphones, path: "/artists" },
    { id: "radio", label: "Radio", icon: Radio, path: "/radio" },
    { id: "genre", label: "Genre", icon: Mic2, path: "/genre" },
    { id: "playlists", label: "Playlists", icon: List, path: "/playlists" },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveNav(item.id);
    navigate(item.path);
    onClose(); // Close the expanded player after navigating
  };

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

  if (!isOpen) return null;
  if (!currentTrack) return null; // Don't render if no track is loaded

  return (
    <div className="fixed inset-0 z-50 bg-background animate-slide-up">
      {/* Desktop Version */}
      {!isMobile ? (
        <div className="h-full flex flex-col p-4 md:p-8">
          {/* Neon Border Container */}
          <div className="flex-1 rounded-2xl md:rounded-3xl border-4 border-transparent bg-gradient-to-br from-primary via-accent to-secondary p-1 shadow-neon-strong">
            <div className="h-full rounded-2xl md:rounded-3xl bg-background flex overflow-hidden">
              {/* Left Sidebar - Navigation */}
              <aside className="w-56 lg:w-64 bg-card/50 backdrop-blur-sm p-4 lg:p-6 space-y-2 border-r border-border">
                <div className="mb-6 lg:mb-8 flex items-center gap-2 lg:gap-3">
                  <NeonLogo size="small" />
                  <Button variant="ghost" size="icon" className="ml-auto w-8 h-8 lg:w-10 lg:h-10">
                    <Menu className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeNav === item.id ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        activeNav === item.id
                          ? "bg-primary text-primary-foreground shadow-neon"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      } text-sm lg:text-base`}
                      onClick={() => handleNavClick(item)}
                    >
                      <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </aside>

              {/* Center - Player */}
              <main className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="p-4 lg:p-6 flex items-center justify-between border-b border-border">
                  <Button variant="ghost" size="icon" className="w-8 h-8 lg:w-10 lg:h-10">
                    <Menu className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                  <span className="text-xs lg:text-sm text-muted-foreground">{currentTrack.title} - {currentTrack.artist}</span>
                  <div className="flex items-center gap-1 lg:gap-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 lg:w-10 lg:h-10">
                      <Search className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 lg:w-10 lg:h-10">
                      <Minimize2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 lg:w-10 lg:h-10">
                      <Copy className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 lg:w-10 lg:h-10">
                      <X className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </div>
                </header>

                {/* Album Art & Visualizer */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                  <div className="relative">
                    {/* Album Art with Neon H */}
                    <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-neon-strong relative overflow-hidden">
                      {/* Album Thumbnail or H Logo */}
                      {currentTrack.thumbnail ? (
                        <img src={currentTrack.thumbnail} alt={currentTrack.title} className="relative z-10 w-full h-full object-cover rounded-xl md:rounded-2xl" />
                      ) : (
                        <div className="relative z-10">
                          <NeonLogo size="large" />
                        </div>
                      )}
                    </div>

                    {/* Left Visualizer */}
                    <div className="absolute -left-16 md:-left-24 lg:-32 top-1/2 -translate-y-1/2 h-48 md:h-64">
                      <Visualizer barCount={20} direction="horizontal" className="h-full" isPlaying={isPlaying} animationIntervalMs={100} /> {/* Pass animationIntervalMs */}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6 lg:px-12 pb-4">
                  <Slider
                    value={[playbackProgress]}
                    onValueChange={handleSliderChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs lg:text-sm text-muted-foreground mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="p-4 lg:p-8 border-t border-border flex items-center">
                  {/* Left Visualizer */}
                  <div className="flex-1">
                    <Visualizer barCount={25} className="h-16 w-48 lg:h-24 lg:w-64" isPlaying={isPlaying} animationIntervalMs={100} /> {/* Pass animationIntervalMs */}
                  </div>

                  {/* Center Controls */}
                  <div className="flex items-center gap-4 lg:gap-6">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-foreground w-8 h-8 lg:w-10 lg:h-10"
                      onClick={() => console.log("Shuffle clicked (future functionality)")}
                    >
                      <Shuffle className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-foreground hover:text-primary w-10 h-10 lg:w-12 lg:h-12"
                      onClick={() => console.log("Skip Back clicked (future functionality)")}
                    >
                      <SkipBack className="w-5 h-5 lg:w-7 lg:h-7" />
                    </Button>
                    <Button
                      size="icon"
                      className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 lg:w-7 lg:h-7" /> : <Play className="w-5 h-5 lg:w-7 lg:h-7 ml-1" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-foreground hover:text-primary w-10 h-10 lg:w-12 lg:h-12"
                      onClick={() => console.log("Skip Forward clicked (future functionality)")}
                    >
                      <SkipForward className="w-5 h-5 lg:w-7 lg:h-7" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-foreground w-8 h-8 lg:w-10 lg:h-10"
                      onClick={() => console.log("Repeat clicked (future functionality)")}
                    >
                      <Repeat className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </div>

                  {/* Right Space */}
                  <div className="flex-1 flex justify-end gap-1 lg:gap-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 lg:w-10 lg:h-10">
                      <span className="text-xs lg:text-sm">🎵</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 lg:w-10 lg:h-10">
                      <span className="text-xs lg:text-sm">🎤</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 lg:w-10 lg:h-10">
                      <span className="text-xs lg:text-sm">📊</span>
                    </Button>
                  </div>
                </div>
              </main>

              {/* Right Sidebar - Playlist */}
              <aside className="w-72 lg:w-96 border-l border-border">
                <PlaylistQueue activeTrackId={currentTrack?.id} />
              </aside>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile Version */
        <div className="h-full flex flex-col bg-gradient-to-br from-cyan-500/10 via-background to-purple-500/10">
          {/* Top Bar */}
          <header className="p-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={onClose} className="w-9 h-9">
              <ChevronDown className="w-5 h-5" />
            </Button>
            <div className="flex-1 flex justify-center">
              <NeonLogo size="small" />
            </div>
            <Button variant="ghost" size="icon" className="w-9 h-9">
              <Menu className="w-5 h-5" />
            </Button>
          </header>

          {/* Album Art */}
          <div className="flex justify-center p-6">
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-neon-strong relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-8 border-white/30 animate-pulse-glow" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                {/* This Visualizer is already correctly placed and receives isPlaying */}
                <Visualizer barCount={20} className="h-full w-full absolute inset-0 flex items-center justify-center" isPlaying={isPlaying} animationIntervalMs={100} /> {/* Pass animationIntervalMs */}
              </div>
              {currentTrack.thumbnail && (
                <img src={currentTrack.thumbnail} alt={currentTrack.title} className="relative z-10 w-full h-full object-cover rounded-2xl sm:rounded-3xl" />
              )}
            </div>
          </div>

          {/* Track Info */}
          <div className="text-center px-6 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{currentTrack.title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{currentTrack.artist}</p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 mb-4">
            <Slider
              value={[playbackProgress]}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Visualizer */}
          <div className="px-6 mb-6">
            <Visualizer barCount={40} className="h-16" isPlaying={isPlaying} animationIntervalMs={100} /> {/* Pass animationIntervalMs */}
          </div>

          {/* Controls */}
          <div className="px-6 mb-6">
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground w-9 h-9 sm:w-10 sm:h-10"
                onClick={() => console.log("Shuffle clicked (future functionality)")}
              >
                <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-card"
                onClick={() => console.log("Skip Back clicked (future functionality)")}
              >
                <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
              <Button
                size="icon"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon-strong"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="w-6 h-6 sm:w-8 sm:h-8" /> : <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-card"
                onClick={() => console.log("Skip Forward clicked (future functionality)")}
              >
                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground w-9 h-9 sm:w-10 sm:h-10"
                onClick={() => console.log("Repeat clicked (future functionality)")}
              >
                <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Playlist Section */}
          <div className="flex-1 min-h-0 bg-card/80 backdrop-blur-lg rounded-t-2xl sm:rounded-t-3xl border-t-2 border-primary/30 overflow-hidden">
            <PlaylistQueue activeTrackId={currentTrack?.id} isMobile />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandablePlayer;