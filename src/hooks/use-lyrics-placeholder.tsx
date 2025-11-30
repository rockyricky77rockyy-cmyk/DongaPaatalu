import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLyricsPlaceholder = (title: string | null, artist: string | null) => {
  return useQuery<string, Error>({
    queryKey: ["lyricsPlaceholder", title, artist],
    queryFn: async () => {
      if (!title || !artist) {
        return ""; // Return empty string if no title or artist
      }

      const { data, error } = await supabase.functions.invoke('yt-music-proxy/lyrics-placeholder', {
        body: { title, artist },
      });

      if (error) {
        console.error("Supabase Edge Function Error (lyrics-placeholder):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.lyrics) {
        return data.lyrics as string;
      }
      return "";
    },
    enabled: !!title && !!artist, // Only enable query if title and artist are available
    staleTime: Infinity, // Lyrics don't change, so cache indefinitely
    gcTime: Infinity,
  });
};