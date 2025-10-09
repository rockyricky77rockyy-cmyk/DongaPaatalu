import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define the expected structure of a YouTube Music track
interface YouTubeMusicTrack {
  title: string;
  artist: string;
  album?: string; // Album might be undefined now
  thumbnail?: string; // New field
  videoId?: string; // New field
}

export const useYouTubeMusicSearch = (query: string) => {
  return useQuery<YouTubeMusicTrack[], Error>({
    queryKey: ["youtubeMusicSearch", query], // Unique key for caching and re-fetching
    queryFn: async () => {
      if (!query) return []; // Don't fetch if the query is empty

      // Invoke the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('yt-music-proxy/search', {
        body: { query }, // Pass the search query in the request body
      });

      if (error) {
        console.error("Supabase Edge Function Error:", error); // Log the full error object
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      // The Edge Function now returns an object with a 'tracks' array.
      if (data && data.tracks) {
        return data.tracks.map((track: any) => ({
          title: track.title,
          artist: track.artist || 'Unknown Artist', // Artist is now directly from Edge Function
          album: track.album, // Album might be undefined
          thumbnail: track.thumbnail, // New field
          videoId: track.videoId, // New field
        }));
      }
      return [];
    },
    enabled: !!query, // Only enable the query if the 'query' string is not empty
  });
};