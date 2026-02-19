import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Product } from "@/types";

export const useProducts = () => {
  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Product[];
    },
  });

  return {
    ...query,
    data: query.data ?? ([] as Product[]),
  };
};
