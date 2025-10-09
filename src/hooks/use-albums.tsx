import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Album {
  id: string;
  title: string;
  artist_name: string;
  cover_color: string;
  created_at: string;
  updated_at: string;
}

export const useAlbums = () => {
  return useQuery<Album[], Error>({
    queryKey: ["albums"],
    queryFn: async () => {
      const { data, error } = await supabase.from("albums").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};