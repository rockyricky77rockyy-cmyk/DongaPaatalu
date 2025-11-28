import { useState, useRef, useEffect, useCallback } from "react"; // Import useCallback
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Music, Disc3, Headphones, Radio, Mic2, List, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import MobileSidebar from "@/components/MobileSidebar";
import NeonLogo from "@/components/NeonLogo";
import HomeHeroSection from "@/components/home/HomeHeroSection";
import HomeSearchResults from "@/components/home/HomeSearchResults";
import HomeRecentlySearched from "@/components/home/HomeRecentlySearched";
import HomeTopSearches from "@/components/home/HomeTopSearches";
import HomeNewReleases from "@/components/home/HomeNewReleases";
import HomeAlbumsSection from "@/components/home/HomeAlbumsSection";
import HomeArtistsSection from "@/components/home/HomeArtistsSection";
import HomeGenresSection from "@/components/home/HomeGenresSection";
import HomePlaylistsSection from "@/components/home/HomePlaylistsSection";
import HomeRadioStationsSection from "@/components/home/HomeRadioStationsSection";
import HomePodcastSection from "@/components/home/HomePodcastSection";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useYouTubeMusicSuggestions } from "@/hooks/use-youtube-music";
import { ScrollArea } from "@/components/ui/scroll-area";
import HomeHeader from "@/components/home/HomeHeader";
import VoiceSearchButton from "@/components/VoiceSearchButton"; // Import VoiceSearchButton

const Home = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mobileHeaderRef = useRef<HTMLElement>(null);
  const desktopHeaderRef = useRef<HTMLDivElement>(null);
  const [mobileSuggestionsTop, setMobileSuggestionsTop] = useState(0);
  const [desktopSuggestionsTop, setDesktopSuggestionsTop] = useState(0);

  const { data: suggestions, isLoading: isLoadingSuggestions } = useYouTubeMusicSuggestions(searchTerm);

  const navItems = [
    { id: "home", label: "Home", icon: HomeIcon, path: "/home" },
    { id: "music", label: "Music", icon: Music, path: "/music" },
    { id: "albums", label: "Albums", icon: Disc3, path: "/albums" },
    { id: "artists", label: "Artists", icon: Headphones, path: "/artists" },
    { id: "radio", label: "Radio", icon: Radio, path: "/radio" },
    { id: "genre", label: "Genre", icon: Mic2, path: "/genre" },
    { id: "playlists", label: "Playlists", icon: List, path: "/playlists" },
  ];

  useEffect(() => {
    const updateSuggestionsPositions = () => {
      if (mobileHeaderRef.current) {
        setMobileSuggestionsTop(mobileHeaderRef.current.offsetHeight + 4); // 4px for mt-1
      }
      if (desktopHeaderRef.current) {
        setDesktopSuggestionsTop(desktopHeaderRef.current.offsetHeight + 4); // 4px for mt-1
      }
    };

    updateSuggestionsPositions();
    window.addEventListener('resize', updateSuggestionsPositions);

    return () => window.removeEventListener('resize', updateSuggestionsPositions);
  }, []);

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveNav(item.id);
    navigate(item.path);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
  };

  // Moved handleVoiceSearchResult here
  const handleVoiceSearchResult = useCallback((transcript: string) => {
    setSearchTerm(transcript);
    setShowSuggestions(transcript.length > 0);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    // Optionally trigger search immediately
  };

  return (
    <div className="h-full bg-background flex flex-col relative">
      <div className="flex-1 flex flex-col lg:flex-row h-full">
        {/* Mobile Header with Sidebar Trigger and Search Bar */}
        <header
          ref={mobileHeaderRef}
          className="lg:hidden w-full p-4 flex items-center gap-4 bg-card border-b border-border sticky top-0 z-20"
        >
          <MobileSidebar navItems={navItems} activeNav={activeNav} onNavigate={handleNavClick} />
          {/* Replaced NeonLogo with "DPaata" text */}
          <div className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent ml-[-3px]">
            DPaata
          </div>
          {/* Mobile Search Bar */}
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 pr-[6rem] bg-input border-border rounded-lg h-10 text-sm w-full" // Adjusted pr-[6rem]
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(searchTerm.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            />
            <VoiceSearchButton onResult={handleVoiceSearchResult} className="absolute right-2 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-[3.5rem] top-1/2 -translate-y-1/2 w-7 h-7 text-muted-foreground hover:text-foreground" // Adjusted right-[3.5rem]
                onClick={handleClearSearch}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Mobile Search Suggestions (rendered outside the header) */}
        {showSuggestions && suggestions && suggestions.length > 0 && (
          <ScrollArea
            className="absolute z-50 w-[calc(100%-2rem)] left-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-neon-strong max-h-60 overflow-y-auto lg:hidden"
            style={{ top: `${mobileSuggestionsTop}px` }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 cursor-pointer text-foreground text-sm border-b border-border/50 last:border-b-0 hover:bg-primary/20 hover:text-primary transition-colors rounded-md"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </ScrollArea>
        )}

        {/* Left Sidebar (Desktop Only) */}
        <AppSidebar activeNav={activeNav} onNavigate={handleNavClick} className="hidden lg:block" />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative lg:ml-64">
          {/* Desktop Search Bar (now in HomeHeader) */}
          <HomeHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowSuggestions={setShowSuggestions}
            onVoiceSearchResult={handleVoiceSearchResult} // Pass the handler
            ref={desktopHeaderRef}
          />

          {/* Desktop Search Suggestions */}
          {showSuggestions && suggestions && suggestions.length > 0 && (
            <ScrollArea
              className="absolute z-50 w-[calc(100%-4rem)] left-8 right-8 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-neon-strong max-h-60 overflow-y-auto hidden lg:block"
              style={{ top: `${desktopSuggestionsTop}px` }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 cursor-pointer text-foreground text-sm border-b border-border/50 last:border-b-0 hover:bg-primary/20 hover:text-primary transition-colors rounded-md"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </ScrollArea>
          )}

          <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-0 sm:space-y-6 lg:space-y-12">
            {/* Conditional rendering for search results or home sections */}
            {searchTerm ? (
              <HomeSearchResults searchTerm={searchTerm} onClearSearch={handleClearSearch} />
            ) : (
              <>
                <HomeHeroSection className="mb-8" />
                <HomeRecentlySearched className="mt-0" />
                <HomeTopSearches />
                <HomeNewReleases />
                <HomeAlbumsSection />
                <HomePlaylistsSection />
                <HomeArtistsSection />
                <HomePodcastSection />
                <HomeGenresSection />
                <HomeRadioStationsSection />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;