import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Music, Disc3, Headphones, Radio, Mic2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import NeonLogo from "@/components/NeonLogo";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

interface AppSidebarProps {
  activeNav: string;
  onNavigate: (item: NavItem) => void;
  className?: string;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: HomeIcon, path: "/home" },
  { id: "music", label: "Music", icon: Music, path: "/music" },
  { id: "albums", label: "Albums", icon: Disc3, path: "/albums" },
  { id: "artists", label: "Artists", icon: Headphones, path: "/artists" },
  { id: "radio", label: "Radio", icon: Radio, path: "/radio" },
  { id: "genre", label: "Genre", icon: Mic2, path: "/genre" },
  { id: "playlists", label: "Playlists", icon: List, path: "/playlists" },
];

const AppSidebar = ({ activeNav, onNavigate, className }: AppSidebarProps) => {
  return (
    <aside className={`w-64 bg-card border-r border-border p-6 space-y-2 fixed top-0 bottom-[120px] overflow-y-auto z-30 ${className}`}>
      <div className="mb-8 flex justify-center">
        {/* Replaced NeonLogo with "Donga Paatalu" text */}
        <div className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
          Donga Paatalu
        </div>
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
            onClick={() => onNavigate(item)}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Neon light effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/50 to-transparent pointer-events-none" />
    </aside>
  );
};

export default AppSidebar;