import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Product } from "@/types";

export const useAddProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newProduct: Product) => {
            const { data, error } = await supabase
                .from("products")
                .insert(newProduct)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updatedProduct: Product) => {
            const { data, error } = await supabase
                .from("products")
                .update(updatedProduct)
                .eq("id", updatedProduct.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error, count } = await supabase
                .from("products")
                .delete({ count: "exact" })
                .eq("id", id);

            if (error) throw error;
            if (count === 0) throw new Error("Product not found");
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};
