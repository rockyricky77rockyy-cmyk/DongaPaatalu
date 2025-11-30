import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLyrics = (videoId: string | null) => {
  return useQuery<string, Error>({
    queryKey: ["lyrics", videoId],
    queryFn: async () => {
      if (!videoId) {
        return ""; // Return empty string if no videoId
      }

      const { data, error } = await supabase.functions.invoke('yt-music-proxy/lyrics', {
        body: { videoId },
      });

      if (error) {
        console.error("Supabase Edge Function Error (lyrics):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.lyrics) {
        return data.lyrics as string;
      }
      return "";
    },
    enabled: !!videoId, // Only enable query if videoId is available
    staleTime: Infinity, // Lyrics don't change, so cache indefinitely
    gcTime: Infinity,
  });
};