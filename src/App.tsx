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
import React, { useCallback, useEffect } from "react";
import AlbumDetailsPage from "./pages/AlbumDetailsPage";
import ArtistDetailsPage from "./pages/ArtistDetailsPage";
import PlaylistDetailsPage from "./pages/PlaylistDetailsPage";
import GenreOrRadioSongsPage from "./pages/GenreOrRadioSongsPage"; // Import the new page

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
    console.log("App.tsx: handlePlayerStateChange - event.data:", event.data, "currentTrack:", currentTrack?.title);

    if (!window.YT || !window.YT.PlayerState) {
      console.warn("App.tsx: YouTube PlayerState not available yet.");
      return;
    }

    if (event.data === window.YT.PlayerState.PLAYING) {
      console.log("App.tsx: Player state is PLAYING. Updating context.");
      setIsPlaying(true);
      setDuration(event.target.getDuration());
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      console.log("App.tsx: Player state is PAUSED. Updating context.");
      setIsPlaying(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      console.log("App.tsx: Player state is ENDED. Handling track end by calling playNextTrack.");
      setIsPlaying(false);
      setPlaybackProgress(0);
      setCurrentTime(0);
      playNextTrack(); // Let MusicPlayerContext handle repeat/next logic
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      console.log("App.tsx: Player state is BUFFERING.");
      // Optionally set isPlaying to false or show a loading indicator
    } else if (event.data === window.YT.PlayerState.CUED) {
      console.log("App.tsx: Player state is CUED (video loaded but not playing). Attempting to play.");
      // Explicitly try to play if cued, as autoplay might be blocked
      playerRef.current?.playVideo(); 
      setIsPlaying(true); // Assume it will play, update UI
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
          <Route path="/:queryType/songs" element={<GenreOrRadioSongsPage />} /> {/* New route */}
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