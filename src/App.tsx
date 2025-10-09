import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MusicPage from "./pages/MusicPage";
import AlbumsPage from "./pages/AlbumsPage";
import ArtistsPage from "./pages/ArtistsPage";
import RadioPage from "./pages/RadioPage";
import GenrePage from "./pages/GenrePage";
import PlaylistsPage from "./pages/PlaylistsPage";
import NotFound from "./pages/NotFound";
import Player from "./components/Player"; // Import Player

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col"> {/* Main layout container */}
          <div className="flex-1 pb-[120px]"> {/* Content area with padding for the player */}
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/albums" element={<AlbumsPage />} />
              <Route path="/artists" element={<ArtistsPage />} />
              <Route path="/radio" element={<RadioPage />} />
              <Route path="/genre" element={<GenrePage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Player /> {/* Persistent Player at the bottom */}
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;