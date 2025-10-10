import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Music, Disc3, Headphones, Radio, Mic2, List, Search } from "lucide-react";
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
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useYouTubeMusicSuggestions } from "@/hooks/use-youtube-music";
import { ScrollArea } from "@/components/ui/scroll-area";

const Home = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveNav(item.id);
    navigate(item.path);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
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
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(searchTerm.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            />
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <ScrollArea className="absolute z-50 w-full top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 cursor-pointer hover:bg-muted text-foreground text-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </ScrollArea>
            )}
          </div>
        </header>

        {/* Left Sidebar (Desktop Only) */}
        <AppSidebar activeNav={activeNav} onNavigate={handleNavClick} className="hidden lg:block" />

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
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              />
              {showSuggestions && suggestions && suggestions.length > 0 && (
                <ScrollArea className="absolute z-50 w-full top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 cursor-pointer hover:bg-muted text-foreground text-sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </ScrollArea>
              )}
            </div>

            {/* Conditional rendering for search results or home sections */}
            {searchTerm ? (
              <HomeSearchResults searchTerm={searchTerm} />
            ) : (
              <>
                <HomeHeroSection />
                <HomeRecentlySearched />
                <HomeTopSearches />
                <HomeNewReleases />
                <HomeAlbumsSection />
                <HomeArtistsSection />
                <HomeGenresSection />
                <HomePlaylistsSection />
                <HomeRadioStationsSection />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;