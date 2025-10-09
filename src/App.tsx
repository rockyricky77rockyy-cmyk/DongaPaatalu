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
import Player from "./components/Player";
import { MusicPlayerProvider, useMusicPlayer } from "./context/MusicPlayerContext";
import YouTubeEmbed from "./components/YouTubeEmbed";
import React from "react";

const queryClient = new QueryClient();

// Create a wrapper component to use the MusicPlayerContext
const AppContent = () => {
  const { currentTrack, setDuration, setCurrentTime, setPlaybackProgress, setIsPlaying } = useMusicPlayer();

  const handlePlayerReady = (event: any) => {
    event.target.setVolume(50); // Set default volume to 50%
  };

  const handlePlayerStateChange = (event: any) => {
    // Update context based on player state changes
    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        setDuration(event.target.getDuration());
        break;
      case window.YT.PlayerState.PAUSED:
      case window.YT.PlayerState.ENDED:
        setIsPlaying(false);
        setPlaybackProgress(0);
        setCurrentTime(0);
        break;
      case window.YT.PlayerState.BUFFERING:
        // Keep isPlaying true if buffering, as it's still "trying" to play
        setIsPlaying(true); 
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pb-[120px]">
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
      {/* Hidden YouTube Embed for global playback */}
      <YouTubeEmbed
        videoId={currentTrack?.videoId || null}
        className="absolute bottom-0 right-0"
        onReady={handlePlayerReady}
        onStateChange={handlePlayerStateChange}
      />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MusicPlayerProvider> {/* Wrap the entire app with MusicPlayerProvider */}
          <AppContent /> {/* Render the AppContent inside the provider */}
        </MusicPlayerProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;