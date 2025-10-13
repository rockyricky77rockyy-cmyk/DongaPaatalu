import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YouTubeMusicTrack } from "./use-youtube-music"; // Import YouTubeMusicTrack

export const useNewReleases = () => {
  return useQuery<YouTubeMusicTrack[], Error>({
    queryKey: ["newReleases"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('yt-music-proxy/search', {
        body: { query: 'Telugu new releases songs', type: 'songs' }, // Request Telugu new releases songs
      });

      if (error) {
        console.error("Supabase Edge Function Error (new releases):", error);
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