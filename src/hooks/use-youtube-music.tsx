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

// Define the expected structure of a YouTube Music artist
export interface YouTubeMusicArtist {
  type: 'artist';
  name: string;
  thumbnail?: string;
  artistId: string; // YouTube Music specific artist ID
  genre?: string; // Added genre, though it might be generic from search
}

// Define the expected structure of a YouTube Music playlist
export interface YouTubeMusicPlaylist {
  type: 'playlist';
  name: string;
  thumbnail?: string;
  playlistId: string; // YouTube Music specific playlist ID
  trackCount?: number;
}

// Union type for search results
export type YouTubeSearchResult = YouTubeMusicTrack | YouTubeMusicAlbum | YouTubeMusicArtist | YouTubeMusicPlaylist;

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

export const useYouTubeMusicSuggestions = (query: string) => {
  return useQuery<string[], Error>({
    queryKey: ["youtubeMusicSuggestions", query],
    queryFn: async () => {
      if (!query || query.length < 2) return []; // Only fetch suggestions for queries with at least 2 characters

      const { data, error } = await supabase.functions.invoke('yt-music-proxy/suggestions', {
        body: { query },
      });

      if (error) {
        console.error("Supabase Edge Function Error (suggestions):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.suggestions) {
        return data.suggestions as string[];
      }
      return [];
    },
    enabled: !!query && query.length >= 2, // Only enable query if query exists and is at least 2 characters
    staleTime: 5 * 60 * 1000, // Cache suggestions for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

export const useYouTubeMusicAlbums = (query?: string | null) => {
  return useQuery<YouTubeMusicAlbum[], Error>({
    queryKey: ["youtubeMusicAlbums", query],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('yt-music-proxy/albums', {
        body: { query },
      });

      if (error) {
        console.error("Supabase Edge Function Error (albums):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.albums) {
        return data.albums as YouTubeMusicAlbum[];
      }
      return [];
    },
    enabled: true,
  });
};

export const useYouTubeMusicArtists = () => {
  return useQuery<YouTubeMusicArtist[], Error>({
    queryKey: ["youtubeMusicArtists"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('yt-music-proxy/artists');

      if (error) {
        console.error("Supabase Edge Function Error (artists):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.artists) {
        return data.artists as YouTubeMusicArtist[];
      }
      return [];
    },
    enabled: true,
  });
};

export const useYouTubeMusicPlaylists = () => {
  return useQuery<YouTubeMusicPlaylist[], Error>({
    queryKey: ["youtubeMusicPlaylists"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('yt-music-proxy/playlists');

      if (error) {
        console.error("Supabase Edge Function Error (playlists):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.playlists) {
        return data.playlists as YouTubeMusicPlaylist[];
      }
      return [];
    },
    enabled: true,
  });
};