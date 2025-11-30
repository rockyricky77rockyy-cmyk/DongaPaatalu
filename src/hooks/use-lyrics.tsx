import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLyrics = (videoId: string | null, title: string | null, artist: string | null) => {
  return useQuery<string, Error>({
    queryKey: ["lyrics", videoId, title, artist], // Include title and artist in queryKey
    queryFn: async () => {
      console.log("useLyrics: Query function called with videoId:", videoId, "title:", title, "artist:", artist);
      if (!videoId || !title || !artist) {
        console.log("useLyrics: Missing videoId, title, or artist, returning empty string.");
        return ""; // Return empty string if essential info is missing
      }

      const { data, error } = await supabase.functions.invoke('yt-music-proxy/lyrics', {
        body: { videoId, title, artist }, // Pass title and artist in the body
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
    enabled: !!videoId && !!title && !!artist, // Only enable query if all necessary info is available
    staleTime: Infinity, // Lyrics don't change, so cache indefinitely
    gcTime: Infinity,
  });
};