/// <reference lib="dom" />
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  memo,
} from "react";
import { Product, ViewState } from "../types";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/currency.tsx";
import { useProducts } from "@/src/hooks/useProducts";
import { useDeleteProduct, useUpdateProduct } from "@/src/hooks/useProductMutations";
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
import {
  DndContext,
  DragOverlay,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { SectionHeader } from "../components/StyledComponents";
import ForgeLoader from "../components/ForgeLoader";
import { ProductCard } from "../components/ProductCard";
import { DraggableProductCard } from "../components/DraggableProductCard";
import { useProductGrouping } from "../hooks/useProductGrouping";
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
  sortOption: string;
}

interface CatalogProps {
  categories: string[];
  sizes: string[];
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
  onProductClick,
  initialSearchQuery,
  wishlist,
  toggleWishlist,
  isAdmin,
  user,
  catalogState,
  onCatalogStateChange,
}) => {
  const { data: products } = useProducts();
  const designers = useMemo(() => Array.from(new Set(products.map((p) => p.designer).filter(Boolean))), [products]) as string[];
  const creatureTypes = useMemo(() => Array.from(new Set(products.map((p) => p.creature_type).filter(Boolean))), [products]) as string[];
  const weapons = useMemo(() => Array.from(new Set(products.map((p) => p.weapon).filter(Boolean).flatMap((w) => (w as string).split("/").map((s) => s.trim())))), [products]).sort() as string[];
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const queryClient = useQueryClient();
  const handleRefresh = async () => queryClient.invalidateQueries({ queryKey: ["products"] });
  const { addToCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [searchQuery, setSearchQuery] = useState(
    catalogState.searchQuery || initialSearchQuery || "",
  );

  useEffect(() => {
    console.log('[Catalog] Mounted. State:', {
      page: catalogState.page,
      searchQuery: catalogState.searchQuery,
      initialSearchQuery
    });
    return () => console.log('[Catalog] Unmounted');
  }, []);
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
  const [sortOption, setSortOption] = useState(catalogState.sortOption || "newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(catalogState.page);

  // Mobile filter visibility state
  const [showFilters, setShowFilters] = useState(false);

  // Drag & Drop grouping state
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const {
    isGroupingMode,
    toggleGroupingMode,
    isUngroupingMode,
    toggleUngroupingMode,
    handleDragEnd,
    handleUngroup,
    isProcessing,
    error: groupingError,
    successMessage,
    clearMessages,
  } = useProductGrouping(updateProduct, handleRefresh);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Configure drag sensors - need activation constraint to distinguish drag from click
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
  );

  const activeDragProduct = activeDragId
    ? products.find((p) => p.id === activeDragId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEndEvent = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      await handleDragEnd(active.id as string, over.id as string, products);
    }
  };

  // Sync state back to parent
  useEffect(() => {
    onCatalogStateChange({
      page: currentPage,
      searchQuery,
      selectedCategories,
      selectedSizes,
      selectedDesigners,
      selectedCreatureTypes,
      selectedWeapons,
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

  useEffect(() => {
    if (
      initialSearchQuery !== undefined &&
      initialSearchQuery !== searchQuery
    ) {
      setSearchQuery(initialSearchQuery);
      setCurrentPage(1);
    }
  }, [initialSearchQuery]);

  // Remove the automatic reset pagination effect that runs on mount
  // and replace it with manual resets in handlers.

  // Filter logic moved to CatalogFilters component - Wait, NO! logic stays here, UI moved.

  const toggleFilter = (
    type: "category" | "size" | "designer" | "creature_type" | "weapon",
    value: string,
  ) => {
    setCurrentPage(1);
    if (type === "category") {
      setSelectedCategories((prev) =>
        prev.includes(value)
          ? prev.filter((c) => c !== value)
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
    setSortOption("newest");
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    let baseFiltered = products;

    // Apply Filters if any
    if (
      searchQuery ||
      selectedCategories.length > 0 ||
      selectedSizes.length > 0 ||
      selectedDesigners.length > 0 ||
      selectedCreatureTypes.length > 0 ||
      selectedWeapons.length > 0
    ) {
      const searchLower = searchQuery.toLowerCase();
      baseFiltered = products.filter((product) => {
        // Quick checks first
        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes(product.category)
        ) {
          return false;
        }
        if (
          selectedSizes.length > 0 &&
          product.size &&
          !selectedSizes.includes(product.size)
        ) {
          return false;
        }
        if (
          selectedDesigners.length > 0 &&
          product.designer &&
          !selectedDesigners.includes(product.designer)
        ) {
          return false;
        }
        if (
          selectedCreatureTypes.length > 0 &&
          product.creature_type &&
          !selectedCreatureTypes.includes(product.creature_type)
        ) {
          return false;
        }
        if (selectedWeapons.length > 0) {
          if (!product.weapon) return false;
          const productWeapons = product.weapon.split("/").map((w) => w.trim());
          if (!selectedWeapons.some((sw) => productWeapons.includes(sw))) {
            return false;
          }
        }

        // Search check only if there's a search query
        if (searchQuery) {
          return (
            product.name.toLowerCase().includes(searchLower) ||
            product.category.toLowerCase().includes(searchLower) ||
            (product.designer &&
              product.designer.toLowerCase().includes(searchLower)) ||
            (product.creature_type &&
              product.creature_type.toLowerCase().includes(searchLower))
          );
        }

        return true;
      });
    }

    // Grouping Logic
    const shouldUngroup =
      selectedSizes.length > 0 ||
      selectedCreatureTypes.length > 0 ||
      selectedWeapons.length > 0;

    if (shouldUngroup) {
      return baseFiltered.sort((a, b) => {
        switch (sortOption) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "newest":
          default:
            const idA = Number(a.id);
            const idB = Number(b.id);
            if (!isNaN(idA) && !isNaN(idB)) return idB - idA;
            return a.id.localeCompare(b.id);
        }
      });
    }

    if (isAdmin && isUngroupingMode) {
      return baseFiltered.sort((a, b) => {
        switch (sortOption) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "newest":
          default:
            const idA = Number(a.id);
            const idB = Number(b.id);
            if (!isNaN(idA) && !isNaN(idB)) return idB - idA;
            return a.id.localeCompare(b.id);
        }
      });
    }

    const groupedProducts: Product[] = [];
    const setsMap = new Map<string, Product[]>();
    const processedIds = new Set<string>();

    baseFiltered.forEach((p) => {
      const setName = p.set_name?.trim();

      if (setName && setName !== "Sin set") {
        const key = setName.toLowerCase();
        if (!setsMap.has(key)) {
          setsMap.set(key, []);
        }
        setsMap.get(key)!.push(p);
      } else {
        groupedProducts.push(p);
        processedIds.add(p.id);
      }
    });

    setsMap.forEach((setProducts) => {
      if (setProducts.length === 0) return;

      const sorted = [...setProducts].sort((a, b) => {
        const aHasHeader = a.name.toLowerCase().includes("header");
        const bHasHeader = b.name.toLowerCase().includes("header");
        if (aHasHeader && !bHasHeader) return -1;
        if (!aHasHeader && bHasHeader) return 1;
        return a.id.localeCompare(b.id);
      });

      const [header, ...others] = sorted;

      groupedProducts.push({
        ...header,
        subItems: others.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          description: item.description,
        })),
      });

      setProducts.forEach((p) => processedIds.add(p.id));
    });

    return groupedProducts.sort((a, b) => {
      switch (sortOption) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
        default:
          const idA = Number(a.id);
          const idB = Number(b.id);
          if (!isNaN(idA) && !isNaN(idB)) {
            return idB - idA;
          }
          return a.id.localeCompare(b.id);
      }
    });
  }, [
    searchQuery,
    selectedCategories,
    selectedSizes,
    selectedDesigners,
    selectedCreatureTypes,
    selectedWeapons,
    sortOption,
    products,
    isAdmin, // Added dependencies that were likely missing or implicit
    isUngroupingMode,
  ]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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
            "url(https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/banners/catalogo_banner.png)",
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

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, lg: 8 } }} id="catalog-content">
        {/* Controls Bar (Replacing SectionHeader) */}
        <CatalogHeader
          count={filteredProducts.length}
          sortOption={sortOption}
          onSortChange={(value) => {
            setSortOption(value);
            setCurrentPage(1);
          }}
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
                selectedCategories={selectedCategories}
                selectedSizes={selectedSizes}
                selectedDesigners={selectedDesigners}
                selectedCreatureTypes={selectedCreatureTypes}
                selectedWeapons={selectedWeapons}
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
                selectedCategories={selectedCategories}
                selectedSizes={selectedSizes}
                selectedDesigners={selectedDesigners}
                selectedCreatureTypes={selectedCreatureTypes}
                selectedWeapons={selectedWeapons}
                onToggleFilter={toggleFilter}
                onReset={handleReset}
                isMobile
                onCloseMobile={() => setShowFilters(false)}
              />
            </Drawer>
          </Grid>

          {/* Product Grid */}
          <Grid size={{ xs: 12, lg: 9 }}>
            {filteredProducts.length === 0 ? (
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
                      console.log(
                        "[Catalog] Page changed to",
                        p,
                        "- scrolling to content",
                      );
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

                {/* Admin Grouping Mode UI */}
                {isAdmin && (
                  <Paper
                    sx={{
                      mb: 3,
                      p: 2,
                      bgcolor: isGroupingMode
                        ? alpha(theme.palette.primary.main, 0.1)
                        : "transparent",
                      border: 2,
                      borderStyle: isGroupingMode ? "solid" : "dashed",
                      borderColor: isGroupingMode
                        ? "primary.main"
                        : alpha(theme.palette.secondary.main, 0.3),
                      transition: "all 0.3s",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      justifyContent="space-between"
                      flexWrap="wrap"
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {isUngroupingMode ? (
                          <LinkOff color="error" />
                        ) : (
                          <AccountTree
                            color={isGroupingMode ? "primary" : "secondary"}
                          />
                        )}
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            color="common.white"
                          >
                            {isUngroupingMode
                              ? "Modo Desagrupación"
                              : "Modo Agrupación"}
                          </Typography>
                          <Typography variant="caption" color="grey.500">
                            {isUngroupingMode
                              ? "Haz clic en 'Desagrupar' en las cartas para romper el set"
                              : isGroupingMode
                                ? "Arrastra una miniatura sobre otra para agruparlas en un set"
                                : "Gestión de Sets de Miniaturas"}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        {/* Ungroup Toggle */}
                        <Button
                          variant={isUngroupingMode ? "contained" : "outlined"}
                          color={isUngroupingMode ? "error" : "secondary"}
                          onClick={toggleUngroupingMode}
                          startIcon={isUngroupingMode ? <Close /> : <LinkOff />}
                          disabled={isGroupingMode}
                        >
                          {isUngroupingMode ? "Salir" : "Desagrupar"}
                        </Button>

                        {/* Group Toggle */}
                        <Button
                          variant={isGroupingMode ? "contained" : "outlined"}
                          color={isGroupingMode ? "primary" : "secondary"}
                          onClick={toggleGroupingMode}
                          startIcon={
                            isGroupingMode ? <Close /> : <DragIndicator />
                          }
                          disabled={isUngroupingMode}
                        >
                          {isGroupingMode ? "Salir" : "Agrupar"}
                        </Button>
                      </Stack>
                    </Stack>

                    {isProcessing && (
                      <LinearProgress sx={{ mt: 2 }} color="primary" />
                    )}

                    {groupingError && (
                      <Alert
                        severity="error"
                        sx={{ mt: 2 }}
                        onClose={clearMessages}
                      >
                        {groupingError}
                      </Alert>
                    )}
                  </Paper>
                )}

                {/* Products Grid with DnD */}
                <DndContext
                  sensors={sensors}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEndEvent}
                  collisionDetection={closestCenter}
                >
                  <Grid container spacing={3}>
                    {currentProducts.map((product) => {
                      const isWishlisted = wishlist.includes(product.id);
                      return (
                        <Grid key={product.id} size={{ xs: 12, md: 6, lg: 4 }}>
                          {isAdmin && isGroupingMode ? (
                            <DraggableProductCard
                              id={product.id}
                              product={product}
                              isGroupingMode={isGroupingMode}
                              isWishlisted={isWishlisted}
                              isAdmin={isAdmin}
                              onProductClick={onProductClick}
                              onToggleWishlist={toggleWishlist}
                              onAddToCart={addToCart}
                              onDeleteProduct={deleteProduct}
                              onUngroup={(id) => handleUngroup(id, products)}
                            />
                          ) : (
                            <ProductCard
                              product={product}
                              isWishlisted={isWishlisted}
                              isAdmin={isAdmin}
                              isUngroupingMode={isUngroupingMode}
                              onProductClick={onProductClick}
                              onToggleWishlist={toggleWishlist}
                              onAddToCart={addToCart}
                              onDeleteProduct={deleteProduct}
                              onUngroup={(id) => handleUngroup(id, products)}
                            />
                          )}
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Drag Overlay for visual feedback */}
                  <DragOverlay>
                    {activeDragProduct && (
                      <Box sx={{ width: 300, opacity: 0.9 }}>
                        <ProductCard
                          product={activeDragProduct}
                          isWishlisted={false}
                          isAdmin={false}
                          isDragging
                          onProductClick={() => { }}
                          onToggleWishlist={() => { }}
                          onAddToCart={() => { }}
                        />
                      </Box>
                    )}
                  </DragOverlay>
                </DndContext>

                {/* Success Snackbar */}
                <Snackbar
                  open={!!successMessage}
                  autoHideDuration={3000}
                  onClose={clearMessages}
                  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                  <Alert
                    severity="success"
                    onClose={clearMessages}
                    sx={{ width: "100%" }}
                  >
                    {successMessage}
                  </Alert>
                </Snackbar>

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
