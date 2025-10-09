import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  color?: string;
  video_id?: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export const useTracks = () => {
  return useQuery<Track[], Error>({
    queryKey: ["tracks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tracks").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};