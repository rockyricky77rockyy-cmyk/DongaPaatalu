import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Music, Disc3, Headphones, Radio, Mic2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import NeonLogo from "@/components/NeonLogo";
import Visualizer from "@/components/Visualizer";
import Player from "@/components/Player";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSidebar from "@/components/MobileSidebar";

const Home = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
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

  const albums = [
    { title: "Muzik Album", artist: "Cantılam albuy", color: "from-blue-600 to-purple-600" },
    { title: "Artly Beavilum", artist: "Öperilkiy", color: "from-slate-300 to-slate-400" },
    { title: "Sanlskir Skiküm", artist: "Öperıñ øoc", color: "from-purple-600 to-pink-600" },
    { title: "Sanavøceiıa", artist: "beürlt Leiii", color: "from-cyan-500 to-blue-600" },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveNav(item.id);
    navigate(item.path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex">
        {/* Mobile Header with Sidebar Trigger */}
        <header className="lg:hidden w-full p-4 flex items-center justify-between bg-card border-b border-border">
          <MobileSidebar navItems={navItems} activeNav={activeNav} onNavigate={handleNavClick} />
          <NeonLogo size="small" />
          {/* Placeholder for right side if needed, or just space-between */}
          <div className="w-10 h-10"></div> {/* To balance the space if no other icon is needed */}
        </header>

        {/* Left Sidebar (Desktop Only) */}
        <aside className="w-64 bg-card border-r border-border p-6 space-y-2 hidden lg:block">
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
                      <svg className="w-8 h-8 sm:w-12 sm:h-12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-4 sm:mt-8">
                <Visualizer barCount={isMobile ? 30 : 50} className="h-16 sm:h-24" />
              </div>
            </div>

            {/* Albums Section */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Pessonse</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {albums.map((album, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer bg-card rounded-2xl p-4 hover:bg-card/80 transition-all border border-border hover:border-primary/50 hover:shadow-neon"
                  >
                    <div className={`aspect-square rounded-xl bg-gradient-to-br ${album.color} mb-4 flex items-center justify-center`}>
                      <Music className="w-16 h-16 text-white opacity-50" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">{album.title}</h3>
                    <p className="text-sm text-muted-foreground">{album.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Player */}
      <Player />
    </div>
  );
};

export default Home;