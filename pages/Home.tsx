/// <reference lib="dom" />
import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { ViewState, Product } from "../types";
import HeroSection from "../src/components/home/HeroSection";
import FeaturedCollections from "../src/components/home/FeaturedCollections";
import RiftChronicles from "../src/components/home/RiftChronicles";
import Testimonials from "../src/components/home/Testimonials";
import Promotions from "../src/components/home/Promotions";
import { useProducts } from "@/src/hooks/useProducts";

interface HomeProps {
  setView: (view: ViewState) => void;
  onFilterNavigate: (filters: {
    categories?: string[];
    creatureTypes?: string[];
  }) => void;
}

const Home: React.FC<HomeProps> = ({ setView, onFilterNavigate }) => {
  const { data: products } = useProducts();
  // Optimization: Sort products once here if needed for all children, 
  // or pass raw products and let children handle their specific filtering.
  // Since multiple children need "Hero" products (most recent), 
  // we can sort once here to avoid sorting repeatedly in children if we passed filtered lists.
  // However, the children need specific category filtering.
  // Ideally, we might pass a lookup map or just the list. 
  // Given the previous implementation sorted repeatedly, passing the list 
  // and letting components find their specific items is cleaner separation,
  // but we can optimize by sorting once by ID descending (newest first).

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => b.id.localeCompare(a.id));
  }, [products]);

  return (
    <Box sx={{ pb: 8 }}>
      <HeroSection setView={setView} />

      <FeaturedCollections
        products={sortedProducts}
        setView={setView}
        onFilterNavigate={onFilterNavigate}
      />

      <RiftChronicles
        products={sortedProducts}
        onFilterNavigate={onFilterNavigate}
      />

      <Testimonials />

      <Promotions />
    </Box>
  );
};

export default Home;
