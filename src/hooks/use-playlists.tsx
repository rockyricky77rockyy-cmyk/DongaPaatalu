import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Playlist {
  id: string;
  name: string;
  track_count: number;
  cover_color: string;
  created_at: string;
  updated_at: string;
}

export const usePlaylists = () => {
  return useQuery<Playlist[], Error>({
    queryKey: ["playlists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("playlists").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};