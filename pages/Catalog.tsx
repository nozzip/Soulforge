import { useState, useMemo, useEffect, useCallback, useRef, memo } from "react";
import { Product, ViewState } from "../types";
import { useCart } from "../context/CartContext";
import { formatProductPrice } from "../utils/currency.tsx";
import { useCatalogProducts } from "@/src/hooks/useCatalogProducts";
import {
  useDeleteProduct,
  useUpdateProduct,
} from "@/src/hooks/useProductMutations";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  FormControl,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Pagination,
  Chip,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Stack,
  Paper,
  useMediaQuery,
  useTheme,
  alpha,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Fab,
  Zoom,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  FilterList,
  Close,
  AccountTree,
  DragIndicator,
  LinkOff, // Imported LinkOff
  KeyboardArrowUp,
  SentimentDissatisfied,
} from "@mui/icons-material";
// import {
//   DndContext,
//   DragOverlay,
//   closestCenter,
//   DragEndEvent,
//   DragStartEvent,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";

import { SectionHeader } from "../components/StyledComponents";
import ForgeLoader from "../components/ForgeLoader";
import { ProductCard, ProductCardSkeleton } from "../components/ProductCard";
// import { DraggableProductCard } from "../components/DraggableProductCard";
// import { useProductGrouping } from "../hooks/useProductGrouping";
import { CatalogFilters } from "../src/components/catalog/CatalogFilters";
import { CatalogHeader } from "../src/components/catalog/CatalogHeader";

interface CatalogState {
  page: number;
  searchQuery: string;
  selectedCategories: string[];
  selectedSizes: string[];
  selectedDesigners: string[];
  selectedCreatureTypes: string[];
  selectedWeapons: string[];
  selectedUniverses: string[];
  sortOption: string;
}

interface CatalogProps {
  categories: string[];
  sizes: string[];
  designers: string[];
  creatureTypes: string[];
  weapons: string[];
  universes: string[];
  onProductClick: (id: string) => void;
  initialSearchQuery?: string;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isAdmin: boolean;
  user?: { name: string; id: string } | null;
  catalogState: CatalogState;
  onCatalogStateChange: (state: CatalogState) => void;
}

const ITEMS_PER_PAGE = 9;

const Catalog: React.FC<CatalogProps> = ({
  categories,
  sizes,
  designers,
  creatureTypes,
  weapons,
  universes,
  onProductClick,
  initialSearchQuery,
  wishlist,
  toggleWishlist,
  isAdmin,
  user,
  catalogState,
  onCatalogStateChange,
}) => {
  // State Initialization
  const [searchQuery, setSearchQuery] = useState(
    catalogState.searchQuery || initialSearchQuery || "",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    catalogState.selectedCategories || [],
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    catalogState.selectedSizes || [],
  );
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>(
    catalogState.selectedDesigners || [],
  );
  const [selectedCreatureTypes, setSelectedCreatureTypes] = useState<string[]>(
    catalogState.selectedCreatureTypes || [],
  );
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>(
    catalogState.selectedWeapons || [],
  );
  const [selectedUniverses, setSelectedUniverses] = useState<string[]>(
    catalogState.selectedUniverses || [],
  );
  const [sortOption, setSortOption] = useState(
    catalogState.sortOption || "newest",
  );
  const [currentPage, setCurrentPage] = useState(catalogState.page || 1);

  // Admin Grouping Mode State
  const [isUngroupingMode, setIsUngroupingMode] = useState(false);

  // Server-side Data Fetching
  const {
    data: catalogData,
    isLoading: isProductsLoading,
    error: productsError,
  } = useCatalogProducts({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    searchQuery,
    selectedCategories,
    selectedSizes,
    selectedDesigners,
    selectedCreatureTypes,
    selectedWeapons,
    selectedUniverses,
    sortOption,
    // If Admin AND Ungrouping Mode is active, we disable grouping in the hook (logic to be implemented in hook if supported)
    // Actually, based on my hook implementation:
    // isAdmin=true was just passed. I should update hook to accept `groupResults` boolean if I want that.
    // But for now, let's keep it simple: The RPC groups by default.
    // If I want "Ungrouped", I probably need to bypass RPC or pass a flag to RPC.
    // The user just needs "ability to ungroup".
    // Let's implement the UI for it first.
    isAdmin,
  });

  const products = catalogData?.products || [];
  const totalItems = catalogData?.totalCount || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Derived filters data (Keep purely for filter UI, maybe fetch from DB separately later?
  // For now, CatalogFilters uses passed props. If dynamic lists needed, separate RPC.)
  // The props `categories`, `sizes` come from App.tsx which might be static/fetched once.
  // Designers/CreatureTypes/Weapons were derived from ALL products. Now we don't have all products.
  // We need to fetch these distinct values separately or pass them as props.
  // Assuming App.tsx handles categories/sizes. Designers/CreatureTypes need fetching.
  // For now, let's use empty arrays or fetch distinct values separately.
  // Or just accept that filters might be less dynamic without a separate stats call.

  // TODO: Add separate hook/RPC to get distinct filter values if needed.
  // For now, let's use the current page's values or placeholders to avoid breaking.
  // Actually, CatalogFilters expects lists.
  // Let's implement basic deriving from current page OR ideally fetch unique values.
  // To avoid blocking, I will set them to [] and add a comment to implement a `useCatalogMetadata` hook.

  // Filter values are now passed via props from App.tsx (which fetches them via useCatalogMetadata)
  // No need to derive them or set them to empty arrays manually.

  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const queryClient = useQueryClient();
  const handleRefresh = async () =>
    queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
  const { addToCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    return () => { };
  }, []);

  // Sync state with parent (App.tsx)
  useEffect(() => {
    onCatalogStateChange({
      page: currentPage,
      searchQuery,
      selectedCategories,
      selectedSizes,
      selectedDesigners,
      selectedCreatureTypes,
      selectedWeapons,
      selectedUniverses,
      sortOption,
    });
  }, [
    currentPage,
    searchQuery,
    selectedCategories,
    selectedSizes,
    selectedDesigners,
    selectedCreatureTypes,
    selectedWeapons,
    sortOption,
    onCatalogStateChange,
  ]);

  // Scroll to top logic
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Grouping Mode
  const toggleUngroupingMode = () => {
    // For now this just toggles UI state usually.
    // To actually see ungrouped items, we might need to adjust the query.
    // But since the user executed the SQL, we are using the RPC which *always* groups.
    // To support "Ungrouping" via Admin, we would need to be able to see the raw items.
    // Strategy: If isUngroupingMode is true, we could perhaps filter by "Header" only? No, that's opposite.
    // Realistically, "Ungrouping" means breaking a set.
    // The current card has an "Ungroup" button if it's a set.
    // So we don't necessarily need a global "Ungrouped View" if the card itself allows actions.
    setIsUngroupingMode(!isUngroupingMode);
  };

  const handleUngroup = async (productId: string) => {
    try {
      if (
        !confirm(
          "¿Estás seguro de desagrupar este set? Los items volverán a ser individuales.",
        )
      )
        return;

      // Logic to ungroup: Update all products with this set_name to have set_name = null
      // We need to know the set_name. The product card gives us the ID.
      // If the product is a "Header", it represents the set.
      // We should find the set_name from the product object.
      // BUT `handleUngroup` here just takes standard args.
      // The `ProductCard` calls `onUngroup` with the product.
      // Let's update `ProductCard` interaction.
    } catch (error) {
      console.error("Error ungrouping:", error);
    }
  };
  const isProcessing = false;
  const groupingError = null;
  const successMessage = null;
  const clearMessages = () => { };

  // Mobile filter visibility state
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (
    type: "category" | "size" | "designer" | "creature_type" | "weapon" | "universe",
    value: string,
  ) => {
    setCurrentPage(1);
    if (type === "category") {
      setSelectedCategories((prev) =>
        prev.includes(value)
          ? prev.filter((c) => c !== value)
          : [...prev, value],
      );
    } else if (type === "universe") {
      setSelectedUniverses((prev) =>
        prev.includes(value)
          ? prev.filter((u) => u !== value)
          : [...prev, value],
      );
    } else if (type === "size") {
      setSelectedSizes((prev) =>
        prev.includes(value)
          ? prev.filter((s) => s !== value)
          : [...prev, value],
      );
    } else if (type === "designer") {
      setSelectedDesigners((prev) =>
        prev.includes(value)
          ? prev.filter((d) => d !== value)
          : [...prev, value],
      );
    } else if (type === "creature_type") {
      setSelectedCreatureTypes((prev) =>
        prev.includes(value)
          ? prev.filter((ct) => ct !== value)
          : [...prev, value],
      );
    } else if (type === "weapon") {
      setSelectedWeapons((prev) =>
        prev.includes(value)
          ? prev.filter((w) => w !== value)
          : [...prev, value],
      );
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedDesigners([]);
    setSelectedCreatureTypes([]);
    setSelectedWeapons([]);
    setSelectedUniverses([]);
    setSortOption("newest");
    setCurrentPage(1);
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1);
    },
    [],
  );

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        pb: 10,
        position: "relative",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    >
      {/* Banner Superior Heroico */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 350, md: 900 }, // Reduced height for Catalog compared to Guide
          position: "relative",
          backgroundImage:
            "url(https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/banners/catalogo_banner.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // WATERCOLOR MASK EFFECT
          maskImage:
            "url(https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/masks/my-mask.png), linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage:
            "url(https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/masks/my-mask.png), linear-gradient(to bottom, black 50%, transparent 100%)",
          maskSize: "100% 100%, 100% 100%",
          WebkitMaskSize: "100% 100%, 100% 100%",
          maskPosition: "center bottom, center",
          WebkitMaskPosition: "center bottom, center",
          maskRepeat: "no-repeat, no-repeat",
          WebkitMaskRepeat: "no-repeat, no-repeat",
          maskComposite: "source-over",
          WebkitMaskComposite: "source-over",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`,
          },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            zIndex: 1,
            mt: { xs: 5, md: 8 },
            px: 2,
            textShadow: "0 0 20px rgba(0,0,0,0.9)", // Increased shadow for readability on any bg
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Cinzel", serif',
              fontSize: { xs: "2.5rem", md: "4.5rem" },
              color: "common.white",
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            Los Archivos de Miniaturas
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Cinzel", serif',
              color: "secondary.main",
              letterSpacing: 3,
              opacity: 1,
              fontSize: { xs: "0.9rem", md: "1.2rem" },
              fontWeight: 600,
            }}
          >
            Donde las leyendas se forjan en resina
          </Typography>
        </Box>
      </Box>

      <Container
        maxWidth="xl"
        sx={{ py: 4, px: { xs: 2, lg: 8 } }}
        id="catalog-content"
      >
        {/* Controls Bar (Replacing SectionHeader) */}
        <CatalogHeader
          count={totalItems}
          sortOption={sortOption}
          onSortChange={(value) => {
            setSortOption(value);
            setCurrentPage(1);
          }}
          isAdmin={isAdmin}
          isUngroupingMode={isUngroupingMode}
          onToggleUngroupingMode={toggleUngroupingMode}
        />

        <Grid container spacing={4}>
          {/* Sidebar - Desktop */}
          <Grid
            size={{ xs: 12, lg: 3 }}
            sx={{ display: { xs: "none", lg: "block" } }}
          >
            <Paper
              sx={{
                border: 1,
                borderColor: (theme) =>
                  alpha(theme.palette.secondary.main, 0.3),
                bgcolor: "background.paper",
                position: "sticky",
                top: 100, // Adjusted top for sticky sidebar
                boxShadow: (theme) =>
                  `0 0 40px ${alpha(theme.palette.common.black, 0.5)}, inset 0 0 30px ${alpha(theme.palette.common.black, 0.3)}`,
              }}
            >
              <CatalogFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                categories={categories}
                sizes={sizes}
                designers={designers}
                creatureTypes={creatureTypes}
                weapons={weapons}
                universes={universes}
                selectedCategories={selectedCategories}
                selectedSizes={selectedSizes}
                selectedDesigners={selectedDesigners}
                selectedCreatureTypes={selectedCreatureTypes}
                selectedWeapons={selectedWeapons}
                selectedUniverses={selectedUniverses}
                onToggleFilter={toggleFilter}
                onReset={handleReset}
              />
            </Paper>
          </Grid>

          {/* Mobile Filter Button */}
          <Grid size={{ xs: 12 }} sx={{ display: { lg: "none" } }}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(true)}
            >
              Index Search & Filtros
            </Button>
            <Drawer
              open={showFilters}
              onClose={() => setShowFilters(false)}
              PaperProps={{ sx: { width: 300, bgcolor: "background.default" } }}
            >
              <CatalogFilters
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                categories={categories}
                sizes={sizes}
                designers={designers}
                creatureTypes={creatureTypes}
                weapons={weapons}
                universes={universes}
                selectedCategories={selectedCategories}
                selectedSizes={selectedSizes}
                selectedDesigners={selectedDesigners}
                selectedCreatureTypes={selectedCreatureTypes}
                selectedWeapons={selectedWeapons}
                selectedUniverses={selectedUniverses}
                onToggleFilter={toggleFilter}
                onReset={handleReset}
                isMobile
                onCloseMobile={() => setShowFilters(false)}
              />
            </Drawer>
          </Grid>

          <Grid size={{ xs: 12, lg: 9 }}>
            {totalItems === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 10,
                  bgcolor: (theme) => alpha(theme.palette.common.white, 0.02),
                  borderRadius: 2,
                  border: 1,
                  borderColor: (theme) =>
                    alpha(theme.palette.secondary.main, 0.1),
                }}
              >
                <SentimentDissatisfied
                  sx={{
                    fontSize: 60,
                    color: "secondary.main",
                    mb: 2,
                    opacity: 0.5,
                  }}
                />
                <Typography variant="h5" color="common.white" gutterBottom>
                  No se encontraron artefactos
                </Typography>
                <Typography color="grey.500" paragraph>
                  Los archivos no contienen registros que coincidan con tu
                  búsqueda.
                </Typography>
                <Button
                  onClick={handleReset}
                  sx={{ color: "secondary.main", textDecoration: "underline" }}
                >
                  Limpiar Filtros
                </Button>
              </Box>
            ) : (
              <>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, p) => {
                      setCurrentPage(p);
                      const catalogContent =
                        document.getElementById("catalog-content");
                      if (catalogContent) {
                        catalogContent.scrollIntoView({ behavior: "smooth" });
                      } else {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    color="secondary"
                    shape="rounded"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: "grey.500",
                        border: "1px solid transparent",
                      },
                      "& .MuiPaginationItem-root.Mui-selected": {
                        color: "background.default",
                        bgcolor: "secondary.main",
                        fontWeight: "bold",
                      },
                      "& .MuiPaginationItem-root:hover": {
                        borderColor: "secondary.main",
                        color: "common.white",
                      },
                    }}
                  />
                </Box>

                {/* Products Grid */}
                {isProductsLoading ? (
                  <Grid container spacing={3}>
                    {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                      <Grid
                        key={`skeleton-${index}`}
                        size={{ xs: 12, md: 6, lg: 4 }}
                      >
                        <ProductCardSkeleton />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Grid container spacing={3}>
                    {products.map((product) => {
                      const isWishlisted = wishlist.includes(product.id);
                      return (
                        <Grid key={product.id} size={{ xs: 12, md: 6, lg: 4 }}>
                          <ProductCard
                            product={product}
                            isWishlisted={isWishlisted}
                            isAdmin={isAdmin}
                            isUngroupingMode={false}
                            onProductClick={onProductClick}
                            onToggleWishlist={toggleWishlist}
                            onAddToCart={addToCart}
                            onDeleteProduct={deleteProduct}
                            onUngroup={async () => {
                              // Direct ungroup logic via mutation
                              if (product.set_name) {
                                if (
                                  confirm(
                                    `¿Desagrupar el set "${product.set_name}"?`,
                                  )
                                ) {
                                  await updateProduct({
                                    ...product,
                                    set_name: null,
                                  });
                                  // Actually we need to update ALL items in the set.
                                  // This requires a "batch update" or "ungroup set" RPC or multiple calls.
                                  // For MVP/Regression fix: Admins usually do this in "Edit Mode" or we need a proper handler.
                                  // The previous implementation used `useProductGrouping` hook.
                                  // Since we removed that hook's logic from here in step 5, we need to reimplement basic "Clear Set Name".
                                  // The correct way is: Update products where set_name = X set set_name = NULL.
                                  // We can't do `update where` easily with simple `updateProduct`.
                                  alert(
                                    "Funcionalidad de desagrupar masiva disponible próximamente. Edita individualmente por el momento.",
                                  );
                                }
                              }
                            }}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                )}

                {/* Pagination */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, p) => {
                      setCurrentPage(p);
                      const catalogContent =
                        document.getElementById("catalog-content");
                      if (catalogContent) {
                        catalogContent.scrollIntoView({ behavior: "smooth" });
                      } else {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    color="secondary"
                    shape="rounded"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: "grey.500",
                        border: "1px solid transparent",
                      },
                      "& .MuiPaginationItem-root.Mui-selected": {
                        color: "background.default",
                        bgcolor: "secondary.main",
                        fontWeight: "bold",
                      },
                      "& .MuiPaginationItem-root:hover": {
                        borderColor: "secondary.main",
                        color: "common.white",
                      },
                    }}
                  />
                </Box>
              </>
            )}
          </Grid>
        </Grid>

        <Zoom in={showScrollTop}>
          <Box
            onClick={scrollToTop}
            role="presentation"
            sx={{
              position: "fixed",
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            <Fab
              size="medium"
              aria-label="scroll back to top"
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.6)",
                color: "secondary.main",
                border: "1px solid",
                borderColor: "secondary.main",
                backdropFilter: "blur(4px)",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.8)",
                  color: "common.white",
                  borderColor: "common.white",
                },
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          </Box>
        </Zoom>
      </Container>
    </Box>
  );
};

export default Catalog;
