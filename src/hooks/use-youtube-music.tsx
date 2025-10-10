import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define the expected structure of a YouTube Music track
export interface YouTubeMusicTrack {
  type: 'track';
  title: string;
  artist: string;
  album?: string;
  thumbnail?: string;
  videoId: string; // videoId is now mandatory for tracks
  duration?: string; // Added duration
}

// Define the expected structure of a YouTube Music album
export interface YouTubeMusicAlbum {
  type: 'album';
  title: string;
  artist: string;
  thumbnail?: string;
  albumId: string; // YouTube Music specific album ID
}

// Union type for search results
export type YouTubeSearchResult = YouTubeMusicTrack | YouTubeMusicAlbum;

export const useYouTubeMusicSearch = (query: string) => {
  return useQuery<YouTubeSearchResult[], Error>({
    queryKey: ["youtubeMusicSearch", query],
    queryFn: async () => {
      if (!query) return [];

      const { data, error } = await supabase.functions.invoke('yt-music-proxy/search', {
        body: { query },
      });

      if (error) {
        console.error("Supabase Edge Function Error:", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.results) {
        return data.results as YouTubeSearchResult[];
      }
      return [];
    },
    enabled: !!query,
  });
};

export const useYouTubeAlbumTracks = (albumId: string | null) => {
  return useQuery<{ tracks: YouTubeMusicTrack[], albumTitle: string, albumArtist: string }, Error>({
    queryKey: ["youtubeAlbumTracks", albumId],
    queryFn: async () => {
      if (!albumId) throw new Error("Album ID is required to fetch tracks.");

      const { data, error } = await supabase.functions.invoke('yt-music-proxy/album-tracks', {
        body: { albumId },
      });

      if (error) {
        console.error("Supabase Edge Function Error:", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.tracks) {
        return {
          tracks: data.tracks as YouTubeMusicTrack[],
          albumTitle: data.albumTitle,
          albumArtist: data.albumArtist,
        };
      }
      return { tracks: [], albumTitle: '', albumArtist: '' };
    },
    enabled: !!albumId,
  });
};