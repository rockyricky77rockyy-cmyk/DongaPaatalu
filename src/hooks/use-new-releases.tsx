import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YouTubeMusicTrack } from "./use-youtube-music"; // Import YouTubeMusicTrack

export const useNewReleases = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('en-us', { month: 'long' }); // e.g., "July"

  const query = `Telugu new releases songs ${currentMonth} ${currentYear}`;

  return useQuery<YouTubeMusicTrack[], Error>({
    queryKey: ["newReleases", query], // Update queryKey to reflect the dynamic query
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('yt-music-proxy/search', {
        body: { query: query, type: 'songs' },
      });

      if (error) {
        console.error("Supabase Edge Function Error (new releases):", error);
        throw new Error(error.message || "An unknown error occurred with the Edge Function.");
      }

      if (data && data.results) {
        // Filter for items that are explicitly tracks and map to YouTubeMusicTrack interface
        const tracks = data.results.filter((item: any) => item.type === 'track') as YouTubeMusicTrack[];

        // Add client-side filtering for trailers and promotional content
        const filteredTracks = tracks.filter(track => {
          const lowerCaseTitle = track.title.toLowerCase();
          const isTrailer = ['trailer', 'teaser', 'promo', 'glimpse', 'motion poster', 'official video', 'lyric video'].some(keyword =>
            lowerCaseTitle.includes(keyword)
          );
          // We want to EXCLUDE trailers, so return true if it's NOT a trailer
          return !isTrailer;
        });

        return filteredTracks;
      }
      return [];
    },
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Data is garbage collected after 10 minutes
  });
};