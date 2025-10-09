import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Music, Disc3, Headphones, Radio, Mic2, List, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import NeonLogo from "@/components/NeonLogo";
import Visualizer from "@/components/Visualizer";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSidebar from "@/components/MobileSidebar";
import { Input } from "@/components/ui/input";
import { useYouTubeMusicSearch } from "@/hooks/use-youtube-music";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { useAlbums } from "@/hooks/use-albums"; // Import useAlbums hook
import { useNewReleases } from "@/hooks/use-new-releases"; // Import useNewReleases hook
import { useTracks } from "@/hooks/use-tracks"; // Import useTracks for Top Searches
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading states

const Home = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const { playTrack, isPlaying } = useMusicPlayer(); // Destructure isPlaying

  const { data: searchResults, isLoading: isSearchLoading, isError: isSearchError, error: searchError } = useYouTubeMusicSearch(searchTerm);
  const { data: albums, isLoading: isAlbumsLoading, isError: isAlbumsError, error: albumsError } = useAlbums();
  const { data: newReleases, isLoading: isNewReleasesLoading, isError: isNewReleasesError, error: newReleasesError } = useNewReleases();
  const { data: allTracks, isLoading: isAllTracksLoading, isError: isAllTracksError, error: allTracksError } = useTracks(); // For Top Searches

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
  };

  // Placeholder for playing an album's first track (or a representative track)
  const handlePlayAlbum = (albumTitle: string, artistName: string) => {
    // In a real app, you'd fetch tracks for this album and play the first one.
    // For now, we'll simulate playing a generic track.
    playTrack({
      videoId: 'dQw4w9WgXcQ', // Example video ID
      title: `Playing ${albumTitle}`,
      artist: artistName,
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      album: albumTitle,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Mobile Header with Sidebar Trigger and Search Bar */}
        <header className="lg:hidden w-full p-4 flex items-center gap-4 bg-card border-b border-border">
          <MobileSidebar navItems={navItems} activeNav={activeNav} onNavigate={handleNavClick} />
          <NeonLogo size="small" />
          {/* Mobile Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-input border-border rounded-lg h-10 text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Left Sidebar (Desktop Only) */}
        <aside className="w-64 bg-card border-r border-border p-6 space-y-2 hidden lg:block sticky top-0 h-screen overflow-y-auto">
          <div className="mb-8 flex justify-center">
            <NeonLogo size="small" />
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
                }`}
                onClick={() => handleNavClick(item)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8 space-y-8">
            {/* Search Bar (Desktop Only) */}
            <div className="relative mb-6 hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search music, artists, albums..."
                className="pl-10 bg-input border-border rounded-lg h-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Conditional rendering for search results or hero/sections */}
            {searchTerm ? (
              <div className="mt-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Search Results for "{searchTerm}"</h2>
                {isSearchLoading && <p className="text-muted-foreground">Searching...</p>}
                {isSearchError && <p className="text-destructive">Error: {searchError?.message}</p>}
                {searchResults && searchResults.length > 0 ? (
                  <ScrollArea className="h-[400px] rounded-md border border-border p-4">
                    <div className="space-y-4">
                      {searchResults.map((track, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer"
                          onClick={() => playTrack(track)}
                        >
                          {track.thumbnail && (
                            <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded-md object-cover" />
                          )}
                          {!track.thumbnail && <Music className="w-6 h-6 text-primary" />}
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{track.title}</h3>
                            <p className="text-sm text-muted-foreground">{track.artist} {track.album && `• ${track.album}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  !isSearchLoading && !isSearchError && <p className="text-muted-foreground">No results found.</p>
                )}
              </div>
            ) : (
              <>
                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-card via-card to-secondary/20 rounded-3xl p-6 sm:p-12 overflow-hidden border border-primary/20 shadow-card">
                  <div className="absolute inset-0 bg-gradient-glow opacity-50" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex-1 flex justify-center mb-8 sm:mb-0">
                      <div className="relative">
                        <NeonLogo size={isMobile ? "medium" : "large"} />
                        <Button
                          size={isMobile ? "md" : "lg"}
                          className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon-strong"
                        >
                          <Play className="w-8 h-8 sm:w-12 sm:h-12 fill-current text-white" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 sm:mt-8">
                    <Visualizer barCount={isMobile ? 30 : 50} className="h-16 sm:h-24" isPlaying={isPlaying} /> {/* Pass isPlaying */}
                  </div>
                </div>

                {/* Top Searches Section */}
                <div className="mt-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Top Searches</h2>
                  {isAllTracksLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-lg" />
                      ))}
                    </div>
                  )}
                  {isAllTracksError && <p className="text-destructive">Error loading top searches: {allTracksError?.message}</p>}
                  {allTracks && allTracks.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allTracks.slice(0, 3).map((track) => ( // Display top 3 tracks as "Top Searches"
                        <div 
                          key={track.id} 
                          className="flex items-center gap-4 p-3 bg-card rounded-lg hover:bg-card/80 transition-colors cursor-pointer"
                          onClick={() => playTrack({ videoId: track.video_id || '', title: track.title, artist: track.artist, thumbnail: track.thumbnail, album: track.album })}
                        >
                          {track.thumbnail ? (
                            <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded-md object-cover" />
                          ) : (
                            <div className={`w-12 h-12 rounded-md bg-gradient-to-br ${track.color || 'from-gray-600 to-gray-800'} flex items-center justify-center`}>
                              <Music className="w-6 h-6 text-white opacity-70" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{track.title}</h3>
                            <p className="text-sm text-muted-foreground">{track.artist}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* New Releases Section */}
                <div className="mt-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">New Releases</h2>
                  {isNewReleasesLoading && (
                    <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="group cursor-pointer bg-card rounded-2xl p-4">
                          <Skeleton className="aspect-square rounded-xl mb-4" />
                          <Skeleton className="h-6 w-3/4 mb-1" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  )}
                  {isNewReleasesError && <p className="text-destructive">Error loading new releases: {newReleasesError?.message}</p>}
                  {newReleases && newReleases.length > 0 && (
                    <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {newReleases.map((track) => (
                        <div
                          key={track.id}
                          className="group cursor-pointer bg-card rounded-2xl p-4 hover:bg-card/80 transition-all border border-border hover:border-primary/50 hover:shadow-neon relative overflow-hidden"
                          onClick={() => playTrack({ videoId: track.video_id || '', title: track.title, artist: track.artist, thumbnail: track.thumbnail, album: track.album })}
                        >
                          {track.thumbnail ? (
                            <img src={track.thumbnail} alt={track.title} className="aspect-square rounded-xl mb-4 object-cover" />
                          ) : (
                            <div className={`aspect-square rounded-xl bg-gradient-to-br ${track.color || 'from-gray-600 to-gray-800'} mb-4 flex items-center justify-center`}>
                              <Music className="w-16 h-16 text-white opacity-50" />
                            </div>
                          )}
                          <h3 className="font-semibold text-lg text-foreground mb-1">{track.title}</h3>
                          <p className="text-sm text-muted-foreground">{track.artist}</p>
                          <Button 
                            size="icon" 
                            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
                          >
                            <Play className="w-5 h-5 fill-current" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Albums Section */}
                <div className="mt-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Albums</h2>
                  {isAlbumsLoading && (
                    <div className="flex flex-col md:grid md::grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="group cursor-pointer bg-card rounded-2xl p-4">
                          <Skeleton className="aspect-square rounded-xl mb-4" />
                          <Skeleton className="h-6 w-3/4 mb-1" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  )}
                  {isAlbumsError && <p className="text-destructive">Error loading albums: {albumsError?.message}</p>}
                  {albums && albums.length > 0 && (
                    <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {albums.map((album) => (
                        <div
                          key={album.id}
                          className="group cursor-pointer bg-card rounded-2xl p-4 hover:bg-card/80 transition-all border border-border hover:border-primary/50 hover:shadow-neon relative overflow-hidden"
                          onClick={() => handlePlayAlbum(album.title, album.artist_name)}
                        >
                          <div className={`aspect-square rounded-xl bg-gradient-to-br ${album.cover_color} mb-4 flex items-center justify-center`}>
                            <Disc3 className="w-16 h-16 text-white opacity-50" />
                          </div>
                          <h3 className="font-semibold text-lg text-foreground mb-1">{album.title}</h3>
                          <p className="text-sm text-muted-foreground">{album.artist_name}</p>
                          <Button 
                            size="icon" 
                            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full shadow-lg"
                          >
                            <Play className="w-5 h-5 fill-current" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;