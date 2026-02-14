import { useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Product } from "@/types";

export const useProducts = () => {
    return useSuspenseQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Product[];
        },
    });
};
