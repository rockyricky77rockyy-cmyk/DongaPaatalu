import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define the expected structure of a YouTube Music track
interface YouTubeMusicTrack {
  title: string;
  artist: string;
  album?: string;
  // You can add more fields here as needed from the YouTube Music API response
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
        throw new Error(error.message);
      }

      // The Edge Function returns an object with 'tracks', 'albums', 'artists', etc.
      // We're interested in the 'tracks' array.
      if (data && data.tracks) {
        return data.tracks.map((track: any) => ({
          title: track.title,
          artist: track.artist?.name || 'Unknown Artist', // Handle cases where artist might be missing
          album: track.album?.name,
        }));
      }
      return [];
    },
    enabled: !!query, // Only enable the query if the 'query' string is not empty
  });
};