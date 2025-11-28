import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Menu, Search, Minimize2, Copy, Maximize2, Home as HomeIcon, Music, Disc3, Headphones, Radio, Mic2, List } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";
import Visualizer from "./Visualizer";
import PlaylistQueue from "./PlaylistQueue";
// import NeonLogo from "./NeonLogo"; // Removed NeonLogo import
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { cn } from "@/lib/utils";
import AppSidebar from "./AppSidebar";
import MobileSidebar from "./MobileSidebar";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import TrackThumbnail from "./TrackThumbnail";
import { useYouTubeMusicSearch, YouTubeMusicAlbum, YouTubeMusicTrack, YouTubeMusicArtist } from "@/hooks/use-youtube-music";

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
    playerRef,
    playNextTrack,
    playPreviousTrack,
    isShuffling,
    toggleShuffle,
    repeatMode,
    toggleRepeatMode,
    recentlySearched,
    playTrack,
  } = useMusicPlayer();
  const [activeNav, setActiveNav] = useState("home");
  const [isPlaylistQueueOpen, setIsPlaylistQueueOpen] = useState(false); // Changed to false to be closed by default
  const isMobile = useIsMobile();

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false); // Controls if search results are shown
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading: isSearchLoading, isError: isSearchError, error: searchError } = useYouTubeMusicSearch(searchTerm);

  const handleNavClick = (item: { id: string; path: string }) => {
    setActiveNav(item.id);
    navigate(item.path);
    onClose();
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

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsSearching(e.target.value.length > 0); // Show search results if there's a query
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur(); // Remove focus from search input
    }
  };

  const handlePlaySearchResult = (track: YouTubeMusicTrack) => {
    playTrack({
      videoId: track.videoId,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      album: track.album,
      duration: track.duration, // Include duration
    });
    // Optionally, clear search after playing a track
    // handleClearSearch();
  };

  const handleNavigateToAlbum = (album: YouTubeMusicAlbum) => {
    navigate(`/album/${album.albumId}`, { state: { albumTitle: album.title, albumArtist: String(album.artist) } });
    onClose(); // Close the expanded player when navigating to album details
  };

  const handleNavigateToArtist = (artist: YouTubeMusicArtist) => {
    navigate(`/artist/${artist.artistId}`, { state: { artistName: String(artist.name), artistThumbnail: artist.thumbnail } });
    onClose(); // Close the expanded player when navigating to artist details
  };

  // Effect to focus search input when search is activated
  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);


  if (!isOpen) return null;
  // If not searching and no current track, maybe show a message or disable player
  if (!currentTrack && !isSearching) return null; // Or render a "No track playing" state

  return (
    <div className="fixed inset-0 z-50 bg-background animate-slide-up">
      {/* Desktop Version */}
      {!isMobile ? (
        <div className="h-full flex flex-col p-4 md:p-8">
          {/* Neon Border Container */}
          <div className="flex-1 rounded-2xl md:rounded-3xl border-4 border-transparent bg-gradient-to-br from-primary via-accent to-secondary p-1 shadow-neon-strong">
            <div className="h-full rounded-2xl md:rounded-3xl bg-background flex overflow-hidden">
              {/* Left Sidebar - Navigation */}
              <AppSidebar activeNav={activeNav} onNavigate={handleNavClick} className="hidden lg:block" />

              {/* Center - Player/Search Results */}
              <main className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="p-4 lg:p-6 flex items-center justify-between border-b border-border">
                  <Button variant="ghost" size="icon" className="w-8 h-8 lg:w-10 lg:h-10">
                    <Menu className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                  {/* Search Input */}
                  <div className="relative flex-1 mx-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search music, artists, albums..."
                      className="pl-10 bg-input border-border rounded-lg h-10 text-sm w-full"
                      value={searchTerm}
                      onChange={handleSearchInputChange}
                      onFocus={() => setIsSearching(true)}
                      // onBlur={() => setTimeout(() => setIsSearching(false), 100)} // Keep search results visible until cleared
                    />
                  </div>
                  <div className="flex items-center gap-1 lg:gap-2">
                    {isSearching && (
                      <Button variant="ghost" size="icon" onClick={handleClearSearch} className="w-8 h-8 lg:w-10 lg:h-10">
                        <X className="w-4 h-4 lg:w-5 lg:h-5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 lg:w-10 lg:h-10">
                      <Minimize2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 lg:w-10 lg:h-10">
                      <X className="w-4 h-4 lg:w-5 lg:h-5" />
                    </Button>
                  </div>
                </header>

                {/* Main Content Area: Player or Search Results */}
                {isSearching && searchTerm.length > 0 ? (
                  <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Search Results for "{searchTerm}"</h2>
                    {isSearchLoading && <p className="text-muted-foreground">Searching...</p>}
                    {isSearchError && <p className="text-destructive">Error: {searchError?.message}</p>}
                    {!isSearchLoading && !isSearchError && (!searchResults || searchResults.length === 0) && (
                      <p className="text-muted-foreground">No results found.</p>
                    )}
                    <div className="space-y-4">
                      {searchResults?.map((item, index) => {
                        if (item.type === 'track') {
                          const track = item as YouTubeMusicTrack;
                          const isCurrentTrack = currentTrack?.videoId === track.videoId; // Check if this is the current track
                          return (
                            <div
                              key={track.videoId || index}
                              className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer relative group"
                              onClick={() => handlePlaySearchResult(track)}
                            >
                              <TrackThumbnail
                                thumbnail={track.thumbnail}
                                title={track.title}
                                className="w-12 h-12 rounded-md"
                                iconClassName="w-6 h-6 text-primary"
                              />
                              <div>
                                <h3 className="font-semibold text-lg text-foreground">{track.title}</h3>
                                <p className="text-sm text-muted-foreground">{String(track.artist)} {track.album && `• ${track.album}`}</p>
                              </div>
                              {isCurrentTrack && isPlaying && ( // Conditionally render Visualizer
                                <div className="absolute top-1/2 right-16 -translate-y-1/2">
                                  <Visualizer barCount={5} className="h-4 w-8" isPlaying={isPlaying} animationIntervalMs={150} />
                                </div>
                              )}
                              <Button
                                size="icon"
                                className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
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
                              onClick={() => handleNavigateToAlbum(album)}
                            >
                              <TrackThumbnail
                                thumbnail={album.thumbnail}
                                title={album.title}
                                className="w-12 h-12 rounded-md"
                                iconClassName="w-6 h-6 text-primary"
                              />
                              <div>
                                <h3 className="font-semibold text-lg text-foreground">{album.title}</h3>
                                <p className="text-sm text-muted-foreground">{String(album.artist)} • Album</p>
                              </div>
                              <Button
                                size="icon"
                                className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
                              >
                                <Disc3 className="w-4 h-4 fill-current" />
                              </Button>
                            </div>
                          );
                        } else if (item.type === 'artist') {
                          const artist = item as YouTubeMusicArtist;
                          return (
                            <div
                              key={artist.artistId || index}
                              className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer relative group"
                              onClick={() => handleNavigateToArtist(artist)}
                            >
                              <TrackThumbnail
                                thumbnail={artist.thumbnail}
                                title={typeof artist.name === 'string' ? artist.name : 'Unknown Artist'} // Defensive check
                                className="w-12 h-12 rounded-full"
                                iconClassName="w-6 h-6 text-primary"
                              />
                              <div>
                                <h3 className="font-semibold text-lg text-foreground">{String(artist.name)}</h3>
                                <p className="text-sm text-muted-foreground">Artist</p>
                              </div>
                              <Button
                                size="icon"
                                className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
                              >
                                <Headphones className="w-4 h-4 fill-current" />
                              </Button>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Album Art & Visualizer */}
                    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 mb-8">
                      <div className="relative">
                        {/* Left Visualizer */}
                        <div className="absolute -left-16 md:-left-24 lg:-32 top-1/2 -translate-y-1/2 h-48 md:h-64">
                          <Visualizer barCount={20} direction="horizontal" className="h-full" isPlaying={isPlaying} animationIntervalMs={100} />
                        </div>

                        {/* Album Art with Neon H */}
                        <div className={cn(
                          "w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-neon-strong relative overflow-hidden z-10", // Added z-10
                          isPlaying && "animate-zoom-pulse" // Apply animation when playing
                        )}>
                          <TrackThumbnail // Using TrackThumbnail component here
                            thumbnail={currentTrack?.thumbnail}
                            title={currentTrack?.title || 'No track'}
                            className="relative z-10 w-full h-full object-cover rounded-xl md:rounded-2xl"
                            iconClassName="relative z-10 text-6xl font-bold bg-gradient-neon bg-clip-text text-transparent" // Pass text as iconClassName
                          />
                        </div>

                        {/* Right Visualizer */}
                        <div className="absolute -right-16 md:-right-24 lg:-32 top-1/2 -translate-y-1/2 h-48 md:h-64">
                          <Visualizer barCount={20} direction="horizontal" className="h-full" isPlaying={isPlaying} animationIntervalMs={100} />
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 lg:px-12 pb-4 mb-6">
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
                    <div className="p-3 lg:p-6 border-t border-border flex items-center">
                      {/* Left Visualizer */}
                      <div className="flex-1">
                        <Visualizer barCount={25} className="h-12 w-48 lg:h-16 lg:w-64" isPlaying={isPlaying} animationIntervalMs={100} />
                      </div>

                      {/* Center Controls */}
                      <div className="flex items-center gap-4 lg:gap-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "w-8 h-8 lg:w-10 lg:h-10",
                            isShuffling ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={toggleShuffle}
                        >
                          <Shuffle className="w-4 h-4 lg:w-5 lg:h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-foreground hover:text-primary w-10 h-10 lg:w-12 lg:h-12"
                          onClick={playPreviousTrack}
                        >
                          <SkipBack className="w-5 h-5 lg:w-7 lg:h-7" />
                        </Button>
                        <Button
                          size="icon"
                          className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? <Pause className="w-5 h-5 lg:w-7 lg:h-7" /> : <Play className="w-5 h-5 lg:w-7 lg:h-7 ml-1" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-foreground hover:text-primary w-10 h-10 lg:w-12 lg:h-12"
                          onClick={playNextTrack}
                        >
                          <SkipForward className="w-5 h-5 lg:w-7 lg:h-7" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "w-8 h-8 lg:w-10 lg:h-10 relative",
                            repeatMode !== 'none' ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={toggleRepeatMode}
                        >
                          <Repeat className="w-4 h-4 lg:w-5 lg:h-5" />
                          {repeatMode === 'track' && <span className="absolute text-xs -bottom-1 right-0">1</span>}
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
                      </div>
                    </div>
                  </>
                )}
              </main>

              {/* Right Sidebar - Playlist */}
              <aside className="w-72 lg:w-96 border-l border-border">
                <PlaylistQueue activeVideoId={currentTrack?.videoId} currentTrack={currentTrack} /> {/* Pass currentTrack */}
              </aside>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile Version */
        <div className="h-full flex flex-col bg-gradient-to-br from-cyan-500/10 via-background to-purple-500/10">
          <div className="flex-1 overflow-y-auto"> {/* This div will handle scrolling for the top content */}
            {/* Top Bar */}
            <header className="p-4 flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={onClose} className="w-9 h-9">
                <ChevronDown className="w-5 h-5" />
              </Button>
              <div className="flex-1 flex justify-center">
                {/* Replaced NeonLogo with "Donga Paatalu" text */}
                <div className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent ml-[-3px]">
                  Donga Paatalu
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile search icon navigates to home search */}
                <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => { navigate('/home'); onClose(); }}>
                  <Search className="w-5 h-5" />
                </Button>
                <MobileSidebar navItems={[
                  { id: "home", label: "Home", icon: HomeIcon, path: "/home" },
                  { id: "music", label: "Music", icon: Music, path: "/music" },
                  { id: "albums", label: "Albums", icon: Disc3, path: "/albums" },
                  { id: "artists", label: "Artists", icon: Headphones, path: "/artists" },
                  { id: "radio", label: "Radio", icon: Radio, path: "/radio" },
                  { id: "genre", label: "Genre", icon: Mic2, path: "/genre" },
                  { id: "playlists", label: "Playlists", icon: List, path: "/playlists" },
                ]} activeNav={activeNav} onNavigate={handleNavClick} />
              </div>
            </header>

            {/* Main Content Area: Album Art */}
            <>
              {/* Album Art */}
              <div className="flex justify-center p-6">
                <div className="relative">
                  {/* Left Visualizer */}
                  <div className="absolute -left-16 top-1/2 -translate-y-1/2 h-48">
                    <Visualizer barCount={20} direction="horizontal" className="h-full" isPlaying={isPlaying} animationIntervalMs={100} />
                  </div>

                  <div className={cn(
                    "w-64 h-64 sm:w-80 sm:h-80 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-neon-strong relative overflow-hidden z-10",
                    isPlaying && "animate-zoom-pulse" // Apply animation when playing
                  )}>
                    <TrackThumbnail // Using TrackThumbnail component here
                      thumbnail={currentTrack?.thumbnail}
                      title={currentTrack?.title || 'No track'}
                      className="relative z-10 w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                      iconClassName="relative z-10 text-6xl font-bold bg-gradient-neon bg-clip-text text-transparent" // Pass text as iconClassName
                    />
                  </div>

                  {/* Right Visualizer */}
                  <div className="absolute -right-16 top-1/2 -translate-y-1/2 h-48">
                    <Visualizer barCount={20} direction="horizontal" className="h-full" isPlaying={isPlaying} animationIntervalMs={100} />
                  </div>
                </div>
              </div>

              {/* Track Info */}
              <div className="text-center px-6 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 truncate">{currentTrack?.title}</h2>
                <p className="text-sm sm:text-base text-muted-foreground truncate">{currentTrack ? String(currentTrack.artist) : ''}</p>
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
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Visualizer */}
              <div className="px-6 mb-6">
                <Visualizer barCount={40} className="h-16" isPlaying={isPlaying} animationIntervalMs={100} />
              </div>
            </>

            {/* Controls */}
            <div className="px-6 mb-6">
              <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-muted-foreground w-9 h-9 sm:w-10 sm:h-10",
                    isShuffling ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={toggleShuffle}
                >
                  <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-card"
                  onClick={playPreviousTrack}
                >
                  <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                <Button
                  size="icon"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon-strong"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="w-6 h-6 sm:w-8 sm:h-8" /> : <Play className="w-6 h-6 sm:w-8 h-8 ml-1" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-card"
                  onClick={playNextTrack}
                >
                  <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-muted-foreground w-9 h-9 sm:w-10 sm:h-10 relative",
                    repeatMode !== 'none' ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={toggleRepeatMode}
                >
                  <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
                  {repeatMode === 'track' && <span className="absolute text-xs -bottom-1 right-0">1</span>}
                </Button>
              </div>
            </div>
          </div>

          {/* Playlist Section */}
          <div className={cn(
            "flex-none bg-gradient-glow rounded-t-2xl sm:rounded-t-3xl border-t-2 border-primary/30 overflow-hidden transition-all duration-300 ease-in-out",
            isPlaylistQueueOpen ? "h-[300px] sm:h-[400px]" : "h-16" // Dynamic height
          )}>
            <PlaylistQueue
              activeVideoId={currentTrack?.videoId}
              isMobile
              recentlySearched={recentlySearched}
              isOpen={isPlaylistQueueOpen} // Pass isOpen prop
              onToggle={() => setIsPlaylistQueueOpen(prev => !prev)} // Pass toggle function
              currentTrack={currentTrack} // Pass currentTrack to PlaylistQueue
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandablePlayer;