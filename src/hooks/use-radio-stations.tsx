import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  icon_color: string;
  created_at: string;
  updated_at: string;
}

export const useRadioStations = () => {
  return useQuery<RadioStation[], Error>({
    queryKey: ["radioStations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("radio_stations").select("*");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
};