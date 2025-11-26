import { useNewReleases } from "@/hooks/use-new-releases";
import { useTopSearches } from "@/hooks/use-top-searches";
import { useYouTubeMusicAlbums, useYouTubeMusicArtists, useYouTubeMusicPlaylists, useYouTubeMusicPodcasts } from "@/hooks/use-youtube-music";
import { useGenres } from "@/hooks/use-genres";
import { useRadioStations } from "@/hooks/use-radio-stations";
import React from "react";

// This component is responsible for pre-fetching data for the main sections
// of the Home page to improve perceived loading performance.
const AppPreloader = () => {
  // Trigger all necessary queries for the Home page
  useNewReleases();
  useTopSearches();
  useYouTubeMusicAlbums('Telugu albums'); // Pre-fetch specific album query
  useYouTubeMusicArtists('Telugu artists'); // Pre-fetch specific artist query
  useYouTubeMusicPlaylists('Telugu playlists'); // Pre-fetch specific playlist query
  useYouTubeMusicPodcasts('Bhagavadgeetha podcast'); // Pre-fetch specific podcast query
  useYouTubeMusicPodcasts('Telugu podcasts'); // Pre-fetch specific podcast query
  useYouTubeMusicPodcasts('Hindi podcasts'); // Pre-fetch specific podcast query
  useGenres();
  useRadioStations();

  // This component doesn't render any UI, it just triggers data fetching
  return null;
};

export default AppPreloader;