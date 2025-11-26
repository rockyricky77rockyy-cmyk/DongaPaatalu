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
  // trackCount?: number; // Removed as it's not reliably available in search results
}

// NEW: Define the expected structure of a YouTube Music podcast
export interface YouTubeMusicPodcast {
  type: 'podcast';
  title: string;
  artist: string; // Host or creator of the podcast
  thumbnail?: string;
  podcastId: string; // YouTube Music specific podcast ID (could be playlistId or browseId)
  description?: string;
}

// Union type for search results
export type YouTubeSearchResult = YouTubeMusicTrack | YouTubeMusicAlbum | YouTubeMusicArtist | YouTubeMusicPlaylist | YouTubeMusicPodcast;

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
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Data is garbage collected after 10 minutes
  });
};

export const useYouTubeAlbumTracks = (albumId: string | null) => {
  return useQuery<{ tracks: YouTubeMusicTrack[], albumTitle: string, albumArtist: string, albumThumbnail?: string }, Error>({
    queryKey: ["youtubeAlbumTracks", albumId],
    queryFn: async () => {
      if (!albumId) throw new Error("Album ID is required to fetch tracks.");

      const { data, error } = await supabase.functions.invoke('yt-music-proxy/album-tracks', {
        body: { albumId },
      });

      if (error) {
        console.error("Supabase Edge Function Error (album-tracks):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.tracks) {
        return {
          tracks: data.tracks as YouTubeMusicTrack[],
          albumTitle: data.albumTitle,
          albumArtist: data.albumArtist,
          albumThumbnail: data.albumThumbnail, // Include albumThumbnail
        };
      }
      return { tracks: [], albumTitle: '', albumArtist: '', albumThumbnail: undefined };
    },
    enabled: !!albumId,
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Data is garbage collected after 10 minutes
  });
};

export const useYouTubeArtistTracks = (artistId: string | null) => {
  return useQuery<{ tracks: YouTubeMusicTrack[], artistName: string, artistThumbnail?: string }, Error>({
    queryKey: ["youtubeArtistTracks", artistId],
    queryFn: async () => {
      if (!artistId) throw new Error("Artist ID is required to fetch tracks.");

      const { data, error } = await supabase.functions.invoke('yt-music-proxy/artist-tracks', {
        body: { artistId },
      });

      if (error) {
        console.error("Supabase Edge Function Error (artist-tracks):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.tracks) {
        return {
          tracks: data.tracks as YouTubeMusicTrack[],
          artistName: data.artistName,
          artistThumbnail: data.artistThumbnail,
        };
      }
      return { tracks: [], artistName: '', artistThumbnail: undefined };
    },
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Data is garbage collected after 10 minutes
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
        body: { query: query || 'popular albums' }, // Default to popular albums
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
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Data is garbage collected after 10 minutes
  });
};

export const useYouTubeMusicArtists = (query?: string | null) => {
  return useQuery<YouTubeMusicArtist[], Error>({
    queryKey: ["youtubeMusicArtists", query],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('yt-music-proxy/artists', {
        body: { query: query || 'popular artists' }, // Default to popular artists
      });

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
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Data is garbage collected after 10 minutes
  });
};

export const useYouTubeMusicPlaylists = (query?: string | null) => {
  return useQuery<YouTubeMusicPlaylist[], Error>({
    queryKey: ["youtubeMusicPlaylists", query],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('yt-music-proxy/playlists', {
        body: { query: query || 'trending playlists' }, // Default to trending playlists
      });

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
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Data is garbage collected after 10 minutes
  });
};

// New hook for fetching playlist tracks
export const useYouTubePlaylistTracks = (playlistId: string | null, playlistName: string | null) => {
  return useQuery<{ tracks: YouTubeMusicTrack[], playlistName: string, playlistThumbnail?: string, trackCount: number }, Error>({
    queryKey: ["youtubePlaylistTracks", playlistId, playlistName],
    queryFn: async () => {
      if (!playlistId) throw new Error("Playlist ID is required to fetch tracks.");

      const { data, error } = await supabase.functions.invoke('yt-music-proxy/playlist-tracks', {
        body: { playlistId, playlistName },
      });

      if (error) {
        console.error("Supabase Edge Function Error (playlist-tracks):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.tracks) {
        return {
          tracks: data.tracks as YouTubeMusicTrack[],
          playlistName: data.playlistName,
          playlistThumbnail: data.playlistThumbnail,
          trackCount: data.trackCount,
        };
      }
      return { tracks: [], playlistName: '', playlistThumbnail: undefined, trackCount: 0 };
    },
    enabled: !!playlistId,
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Data is garbage collected after 10 minutes
  });
};

// NEW: Hook for fetching related tracks
export const useYouTubeRelatedTracks = (currentTrack: YouTubeMusicTrack | null) => {
  return useQuery<YouTubeMusicTrack[], Error>({
    queryKey: ["youtubeRelatedTracks", currentTrack?.videoId, currentTrack?.artist, currentTrack?.album],
    queryFn: async () => {
      if (!currentTrack) return [];

      const { data, error } = await supabase.functions.invoke('yt-music-proxy/related-tracks', {
        body: {
          videoId: currentTrack.videoId,
          artist: currentTrack.artist,
          album: currentTrack.album,
        },
      });

      if (error) {
        console.error("Supabase Edge Function Error (related-tracks):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.relatedTracks) {
        return data.relatedTracks as YouTubeMusicTrack[];
      }
      return [];
    },
    enabled: !!currentTrack, // Only enable query if a current track is playing
    staleTime: 5 * 60 * 1000, // Cache related tracks for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

// NEW: Hook for fetching podcasts
export const useYouTubeMusicPodcasts = (query?: string | null) => {
  return useQuery<YouTubeMusicPodcast[], Error>({
    queryKey: ["youtubeMusicPodcasts", query],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('yt-music-proxy/podcasts', {
        body: { query: query || 'popular podcasts' }, // Default to popular podcasts
      });

      if (error) {
        console.error("Supabase Edge Function Error (podcasts):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.podcasts) {
        return data.podcasts as YouTubeMusicPodcast[];
      }
      return [];
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Data is garbage collected after 10 minutes
  });
};