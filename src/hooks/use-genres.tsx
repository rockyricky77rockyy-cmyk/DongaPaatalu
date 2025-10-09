import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Genre {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useGenres = () => {
  return useQuery<Genre[], Error>({
    queryKey: ["genres"],
    queryFn: async () => {
      const { data, error } = await supabase.from("genres").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};