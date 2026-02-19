import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";

export interface CatalogMetadata {
  categories: string[];
  sizes: string[];
  designers: string[];
  creatureTypes: string[];
  weapons: string[];
}

export const useCatalogMetadata = () => {
  return useQuery<CatalogMetadata>({
    queryKey: ["catalog-metadata"],
    queryFn: async () => {
      // 1. Fetch distinct filter values from RPC (now includes categories and sizes)
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_catalog_filter_values",
      );

      if (rpcError) {
        console.error("Error fetching catalog filters from RPC:", rpcError);
      }

      const rpcResult =
        rpcData && rpcData[0]
          ? rpcData[0]
          : {
              categories: [],
              sizes: [],
              designers: [],
              creature_types: [],
              weapons: [],
            };

      // Process Categories (Merge defaults with DB values)
      const defaultCategories = ["D&D", "Warhammer", "Sci-Fi", "Anime", "Cine"];
      const dbCategories = (rpcResult.categories || []).filter(Boolean);
      const categories = Array.from(
        new Set([...defaultCategories, ...dbCategories]),
      ).sort();

      // Process Sizes (Merge defaults with DB values)
      const defaultSizes = ["Small", "Medium", "Large", "Huge", "Gargantuan"];
      const dbSizes = (rpcResult.sizes || []).filter(Boolean);
      const sizes = Array.from(new Set([...defaultSizes, ...dbSizes])).sort();

      return {
        categories,
        sizes,
        designers: rpcResult.designers || [],
        creatureTypes: rpcResult.creature_types || [],
        weapons: rpcResult.weapons || [],
      };
    },
    staleTime: 1000 * 60 * 60, // 1 hour caching
    placeholderData: {
      categories: ["D&D", "Warhammer", "Sci-Fi", "Anime", "Cine"],
      sizes: ["Small", "Medium", "Large", "Huge", "Gargantuan"],
      designers: [],
      creatureTypes: [],
      weapons: [],
    },
  });
};
