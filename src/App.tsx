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
import React, { useCallback, useEffect } from "react"; // Import useEffect
import AlbumDetailsPage from "./pages/AlbumDetailsPage";
import ArtistDetailsPage from "./pages/ArtistDetailsPage";
import PlaylistDetailsPage from "./pages/PlaylistDetailsPage";

const queryClient = new QueryClient();

// Create a wrapper component to use the MusicPlayerContext
const AppContent = () => {
  const { currentTrack, setDuration, setCurrentTime, setPlaybackProgress, playNextTrack, repeatMode, playerRef, setIsPlaying, setCurrentTrack } = useMusicPlayer();

  useEffect(() => {
    console.log("AppContent mounted! If you see this in remote debugger, it's working!");
  }, []);

  const handlePlayerReady = (event: any) => {
    event.target.setVolume(100); 
  };

  const handlePlayerStateChange = (event: any) => {
    if (!window.YT || !window.YT.PlayerState) {
      console.warn("YouTube PlayerState not available yet.");
      return;
    }

    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      setDuration(event.target.getDuration());
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      if (repeatMode === 'track') {
        playerRef.current?.seekTo(0);
        playerRef.current?.playVideo();
        setIsPlaying(true);
      } else {
        setPlaybackProgress(0);
        setCurrentTime(0);
        playNextTrack(); 
      }
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
          <Route path="/album/:albumId" element={<AlbumDetailsPage />} />
          <Route path="/artist/:artistId" element={<ArtistDetailsPage />} />
          <Route path="/playlist/:playlistId" element={<PlaylistDetailsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Player />
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
        <MusicPlayerProvider>
          <AppContent />
        </MusicPlayerProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;