import { useState } from "react";
import { Home as HomeIcon, Music, Disc3, Headphones, Radio, Mic2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import NeonLogo from "@/components/NeonLogo";
import Visualizer from "@/components/Visualizer";
import Player from "@/components/Player";

const Home = () => {
  const [activeNav, setActiveNav] = useState("home");

  const navItems = [
    { id: "home", label: "Bərajdor", icon: HomeIcon },
    { id: "music", label: "MuzlÇon", icon: Music },
    { id: "albums", label: "Mluzamvlön", icon: Disc3 },
    { id: "artists", label: "Açrıstıst", icon: Headphones },
    { id: "radio", label: "Bölrioct", icon: Radio },
    { id: "genre", label: "Klenrıt", icon: Mic2 },
    { id: "playlists", label: "Llziıist", icon: List },
  ];

  const albums = [
    { title: "Muzik Album", artist: "Cantılam albuy", color: "from-blue-600 to-purple-600" },
    { title: "Artly Beavilum", artist: "Öperilkiy", color: "from-slate-300 to-slate-400" },
    { title: "Sanlskir Skiküm", artist: "Öperıñ øoc", color: "from-purple-600 to-pink-600" },
    { title: "Sanavøceiıa", artist: "beürlt Leiii", color: "from-cyan-500 to-blue-600" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-card border-r border-border p-6 space-y-2">
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
                onClick={() => setActiveNav(item.id)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-card via-card to-secondary/20 rounded-3xl p-12 overflow-hidden border border-primary/20 shadow-card">
              <div className="absolute inset-0 bg-gradient-glow opacity-50" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1 flex justify-center">
                  <div className="relative">
                    <NeonLogo size="large" />
                    <Button
                      size="lg"
                      className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-neon hover:scale-110 transition-transform shadow-neon-strong"
                    >
                      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8">
                <Visualizer barCount={50} className="h-24" />
              </div>
            </div>

            {/* Albums Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Pessonse</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
