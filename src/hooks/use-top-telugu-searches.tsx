import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YouTubeMusicTrack } from "./use-youtube-music";

export const useTopTeluguSearches = () => {
  const query = "top Telugu searched songs"; // Specific query for top searched Telugu songs

  return useQuery<YouTubeMusicTrack[], Error>({
    queryKey: ["topTeluguSearches", query],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('yt-music-proxy/search', {
        body: { query: query, type: 'songs' },
      });

      if (error) {
        console.error("Supabase Edge Function Error (top Telugu searches):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.results) {
        // Filter for items that are explicitly tracks and map to YouTubeMusicTrack interface
        return data.results.filter((item: any) => item.type === 'track') as YouTubeMusicTrack[];
      }
      return [];
    },
  });
};