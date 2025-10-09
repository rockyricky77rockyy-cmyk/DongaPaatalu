import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Artist {
  id: string;
  name: string;
  genre: string;
  avatar_color: string;
  created_at: string;
  updated_at: string;
}

export const useArtists = () => {
  return useQuery<Artist[], Error>({
    queryKey: ["artists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("artists").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};