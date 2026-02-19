import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Product } from "@/types";

interface UseCatalogProductsParams {
  page: number;
  pageSize: number;
  searchQuery: string;
  selectedCategories: string[];
  selectedSizes: string[];
  selectedDesigners: string[];
  selectedCreatureTypes: string[];
  selectedWeapons: string[];
  sortOption: string;
  isAdmin?: boolean;
}

interface CatalogData {
  products: Product[];
  totalCount: number;
}

export const useCatalogProducts = ({
  page,
  pageSize,
  searchQuery,
  selectedCategories,
  selectedSizes,
  selectedDesigners,
  selectedCreatureTypes,
  selectedWeapons,
  sortOption,
  isAdmin = false,
}: UseCatalogProductsParams) => {
  return useQuery<CatalogData>({
    queryKey: [
      "catalog-products",
      page,
      pageSize,
      searchQuery,
      selectedCategories,
      selectedSizes,
      selectedDesigners,
      selectedCreatureTypes,
      selectedWeapons,
      sortOption,
      isAdmin,
    ],
    queryFn: async () => {
      // Use the RPC for Grouped/Filtered results
      // CRITICAL: Ensure all array parameters are valid arrays to avoid 400 Bad Request
      const { data, error } = await supabase.rpc("get_catalog_items", {
        page_number: page,
        page_size: pageSize,
        search_query: searchQuery || "",
        filter_categories: selectedCategories || [],
        filter_sizes: selectedSizes || [],
        filter_designers: selectedDesigners || [],
        filter_creature_types: selectedCreatureTypes || [],
        filter_weapons: selectedWeapons || [],
        sort_option: sortOption || "newest",
      });

      if (error) {
        console.error("RPC Error:", error);
        throw error;
      }

      // Fetch count from separate RPC
      const { data: countData, error: countError } = await supabase.rpc(
        "get_catalog_items_count",
        {
          search_query: searchQuery || "",
          filter_categories: selectedCategories || [],
          filter_sizes: selectedSizes || [],
          filter_designers: selectedDesigners || [],
          filter_creature_types: selectedCreatureTypes || [],
          filter_weapons: selectedWeapons || [],
        },
      );

      if (countError) console.error("Error fetching count:", countError);

      return {
        products: (data as unknown as Product[]) || [],
        totalCount: typeof countData === "number" ? countData : 0,
      };
    },
    // Keep previous data while fetching new page for smoother transition
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
