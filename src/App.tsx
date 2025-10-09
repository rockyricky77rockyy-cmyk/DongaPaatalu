import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MusicPage from "./pages/MusicPage";
import AlbumsPage from "./pages/AlbumsPage";
import ArtistsPage from "./pages/ArtistsPage";
import RadioPage from "./pages/RadioPage";
import GenrePage from "./pages/GenrePage";
import PlaylistsPage from "./pages/PlaylistsPage";
import NotFound from "./pages/NotFound";
// import { SessionContextProvider } from "./components/SessionContextProvider"; // Removed

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* <SessionContextProvider> Removed */}
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} /> {/* Redirect to home */}
            <Route path="/login" element={<Login />} /> {/* Login page still exists but won't be redirected to by default */}
            <Route path="/home" element={<Home />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/albums" element={<AlbumsPage />} />
            <Route path="/artists" element={<ArtistsPage />} />
            <Route path="/radio" element={<RadioPage />} />
            <Route path="/genre" element={<GenrePage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        {/* </SessionContextProvider> Removed */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;