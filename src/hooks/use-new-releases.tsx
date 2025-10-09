import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Track } from "./use-tracks"; // Re-use the Track interface

export const useNewReleases = () => {
  return useQuery<Track[], Error>({
    queryKey: ["newReleases"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tracks").select("*").order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};