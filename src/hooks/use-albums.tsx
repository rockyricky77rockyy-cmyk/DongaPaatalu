import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Album {
  id: string;
  title: string;
  artist_name: string;
  cover_color: string;
  language?: string; -- Added language field
  created_at: string;
  updated_at: string;
}

export const useAlbums = (language?: string) => { // Added optional language parameter
  return useQuery<Album[], Error>({
    queryKey: ["albums", language], // Include language in query key for caching
    queryFn: async () => {
      let query = supabase.from("albums").select("*");

      if (language) {
        query = query.eq("language", language); // Apply language filter
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};