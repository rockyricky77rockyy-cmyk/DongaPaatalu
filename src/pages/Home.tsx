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
import { Button } from "@/components/ui/button"; // Import Button for nav items

const Home = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");

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
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;