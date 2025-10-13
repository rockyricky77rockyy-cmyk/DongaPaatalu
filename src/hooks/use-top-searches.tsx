import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YouTubeMusicTrack } from "./use-youtube-music";

export const useTopSearches = () => {
  return useQuery<YouTubeMusicTrack[], Error>({
    queryKey: ["topSearches", "allLanguages"], // More generic query key
    queryFn: async () => {
      const queries = [
        "top Telugu searched songs",
        "top Hindi searched songs",
        "top English searched songs",
      ];

      const allResults: YouTubeMusicTrack[] = [];
      const seenVideoIds = new Set<string>();

      for (const query of queries) {
        const { data, error } = await supabase.functions.invoke('yt-music-proxy/search', {
          body: { query: query, type: 'songs' },
        });

        if (error) {
          console.error(`Supabase Edge Function Error (top searches for "${query}"):`, error);
          // Continue to next query even if one fails
          continue;
        }

        if (data && data.results) {
          const tracks = data.results.filter((item: any) => item.type === 'track') as YouTubeMusicTrack[];
          tracks.forEach(track => {
            if (track.videoId && !seenVideoIds.has(track.videoId)) {
              allResults.push(track);
              seenVideoIds.add(track.videoId);
            }
          });
        }
      }
      return allResults;
    },
  });
};