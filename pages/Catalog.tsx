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
  Add,
  Favorite,
  FavoriteBorder,
  Public,
  Straighten,
  AutoStories,
  SentimentDissatisfied,
  Close,
  Delete,
  AccountTree,
  DragIndicator,
  LinkOff, // Imported LinkOff
  KeyboardArrowUp,
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
  products: Product[];
  categories: string[];
  sizes: string[];
  onProductClick: (id: string) => void;
  initialSearchQuery?: string;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  loading?: boolean;
  designers?: string[];
  creatureTypes?: string[];
  weapons?: string[];
  isAdmin: boolean;
  user?: { name: string; id: string } | null;
  onDeleteProduct?: (id: string) => void;
  onUpdateProduct?: (product: Product) => void;
  onRefreshProducts?: () => Promise<void>;
  catalogState: CatalogState;
  onCatalogStateChange: (state: CatalogState) => void;
}

const ITEMS_PER_PAGE = 9;

const Catalog: React.FC<CatalogProps> = ({
  products,
  categories,
  sizes,
  onProductClick,
  initialSearchQuery,
  wishlist,
  toggleWishlist,
  loading = false,
  designers = [],
  creatureTypes = [],
  weapons = [],
  isAdmin,
  onDeleteProduct,
  onUpdateProduct,
  onRefreshProducts,
  catalogState,
  onCatalogStateChange,
}) => {
  const { addToCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [searchQuery, setSearchQuery] = useState(
    catalogState.searchQuery || initialSearchQuery || "",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    catalogState.selectedCategories,
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    catalogState.selectedSizes,
  );
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>(
    catalogState.selectedDesigners,
  );
  const [selectedCreatureTypes, setSelectedCreatureTypes] = useState<string[]>(
    catalogState.selectedCreatureTypes,
  );
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>(
    catalogState.selectedWeapons,
  );
  const [sortOption, setSortOption] = useState(catalogState.sortOption);

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
  } = useProductGrouping(onUpdateProduct || (() => {}), onRefreshProducts);

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

  const sortedOptions = (options: string[]) =>
    [...options].sort((a, b) => a.localeCompare(b));

  const FILTER_GROUPS = [
    {
      id: "category",
      title: "Origen del Mundo",
      icon: <Public fontSize="small" />,
      options: sortedOptions(categories),
    },
    {
      id: "size",
      title: "Tamaño",
      icon: <Straighten fontSize="small" />,
      options: sortedOptions(sizes),
    },
    {
      id: "designer",
      title: "Gran Maestro (Diseñador)",
      icon: <Search fontSize="small" />,
      options: sortedOptions(designers),
    },
    {
      id: "creature_type",
      title: "Naturaleza de Criatura",
      icon: <SentimentDissatisfied fontSize="small" />,
      options: sortedOptions(creatureTypes),
    },
    {
      id: "weapon",
      title: "Arsenales (Armas)",
      icon: <Search fontSize="small" />,
      options: sortedOptions(weapons),
    },
  ];

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
    // We ONLY group if the user is NOT searching for specific attributes that might be hidden inside a set.
    // If filtering by Size, Creature Type, or Weapon -> SHOW ALL INDIVIDUAL ITEMS (No Grouping)
    // Otherwise (Default, Category, Designer, Search) -> GROUP BY SET

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

    // Default Behavior: Group products by set_name
    // UNLESS in Ungrouping Mode
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
    const processedIds = new Set<string>(); // Keep track of processed IDs to prevent duplicates

    // 1. First pass: Collect all products into sets or standalone
    baseFiltered.forEach((p) => {
      // Robust check for set name, handling potential whitespace or case issues
      const setName = p.set_name?.trim();

      if (setName && setName !== "Sin set") {
        // Use normalized key for map to avoid simple casing mismatch, though display uses setName
        const key = setName.toLowerCase();
        if (!setsMap.has(key)) {
          setsMap.set(key, []);
        }
        setsMap.get(key)!.push(p);
      } else {
        // If it's a standalone product, add it directly
        groupedProducts.push(p);
        processedIds.add(p.id);
      }
    });

    // 2. Process each set: Create ONE representative product
    setsMap.forEach((setProducts) => {
      if (setProducts.length === 0) return;

      // Sort by priority: 1) "header" in name, 2) by ID (stable sort)
      const sorted = [...setProducts].sort((a, b) => {
        const aHasHeader = a.name.toLowerCase().includes("header");
        const bHasHeader = b.name.toLowerCase().includes("header");
        if (aHasHeader && !bHasHeader) return -1;
        if (!aHasHeader && bHasHeader) return 1;

        // If no header preference, try to match the exact set name if possible,
        // but since we grouped by key, the set names are effectively the same.
        // Just use ID for stability.
        return a.id.localeCompare(b.id);
      });

      const [header, ...others] = sorted;

      groupedProducts.push({
        ...header,
        // Ensure subItems contains ALL other items in the set
        subItems: others.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          description: item.description,
        })),
      });

      // Mark all these IDs as processed so they don't appear again
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
          // Ensure robust ID comparison
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

  const FilterContent = useMemo(
    () => (
      <Box
        sx={{
          p: 3,
          height: "100%",
          overflowY: "auto",
          background: (theme) =>
            `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.default})`,
        }}
      >
        {isMobile && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" color="secondary.main">
              Filtros
            </Typography>
            <IconButton onClick={() => setShowFilters(false)}>
              <Close />
            </IconButton>
          </Box>
        )}

        <Box sx={{ position: "relative", mb: 4 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "secondary.main",
              textTransform: "uppercase",
              letterSpacing: 1,
              mb: 1,
              pb: 1,
              borderBottom: 1,
              borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2),
            }}
          >
            Búsqueda en el Índice
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar en los archivos..."
            value={searchQuery}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="secondary" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Stack spacing={4}>
          {FILTER_GROUPS.map((group) => (
            <Box key={group.id}>
              <Typography
                variant="subtitle2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "grey.300",
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                <Box component="span" sx={{ color: "primary.main" }}>
                  {group.icon}
                </Box>{" "}
                {group.title}
              </Typography>
              <List
                dense
                disablePadding
                sx={{
                  borderLeft: 1,
                  borderColor: (theme) =>
                    alpha(theme.palette.secondary.main, 0.1),
                  pl: 1,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0.5,
                }}
              >
                {group.options.map((opt) => {
                  let isSelected = false;
                  if (group.id === "category")
                    isSelected = selectedCategories.includes(opt);
                  else if (group.id === "size")
                    isSelected = selectedSizes.includes(opt);
                  else if (group.id === "designer")
                    isSelected = selectedDesigners.includes(opt);
                  else if (group.id === "creature_type")
                    isSelected = selectedCreatureTypes.includes(opt);
                  else if (group.id === "weapon")
                    isSelected = selectedWeapons.includes(opt);

                  return (
                    <ListItem
                      key={opt}
                      component="div"
                      disablePadding
                      onClick={() => toggleFilter(group.id as any, opt)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { bgcolor: "transparent" },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                          sx={{
                            p: 0.5,
                            color: "grey.700",
                            "&.Mui-checked": { color: "primary.main" },
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={opt}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: isSelected ? "common.white" : "grey.500",
                          fontWeight: isSelected ? "bold" : "normal",
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}
        </Stack>

        {/* Active Filters Section - Moved to bottom */}
        {(selectedCategories.length > 0 ||
          selectedSizes.length > 0 ||
          selectedDesigners.length > 0 ||
          selectedCreatureTypes.length > 0 ||
          selectedWeapons.length > 0) && (
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography
              variant="caption"
              color="grey.500"
              sx={{
                mb: 1,
                display: "block",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Filtros Activos
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedCategories.map((cat) => (
                <Chip
                  key={`cat-${cat}`}
                  label={cat}
                  onDelete={() => toggleFilter("category", cat)}
                  size="small"
                  color="primary"
                />
              ))}
              {selectedSizes.map((size) => (
                <Chip
                  key={`size-${size}`}
                  label={size}
                  onDelete={() => toggleFilter("size", size)}
                  size="small"
                  color="primary"
                />
              ))}
              {selectedDesigners.map((designer) => (
                <Chip
                  key={`des-${designer}`}
                  label={designer}
                  onDelete={() => toggleFilter("designer", designer)}
                  size="small"
                  color="primary"
                />
              ))}
              {selectedCreatureTypes.map((type) => (
                <Chip
                  key={`type-${type}`}
                  label={type}
                  onDelete={() => toggleFilter("creature_type", type)}
                  size="small"
                  color="primary"
                />
              ))}
              {selectedWeapons.map((weapon) => (
                <Chip
                  key={`weap-${weapon}`}
                  label={weapon}
                  onDelete={() => toggleFilter("weapon", weapon)}
                  size="small"
                  color="primary"
                />
              ))}

              <Chip
                label="Limpiar todo"
                onClick={handleReset}
                size="small"
                variant="outlined"
                color="secondary"
                sx={{ borderColor: "secondary.main", color: "secondary.main" }}
              />
            </Box>
          </Box>
        )}

        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          onClick={handleReset}
          sx={{ mt: 2, letterSpacing: 2 }}
        >
          Reiniciar Índice
        </Button>
      </Box>
    ),
    [
      searchQuery,
      isMobile,
      selectedCategories,
      selectedSizes,
      selectedDesigners,
      selectedCreatureTypes,
      selectedWeapons,
      handleSearchChange,
      handleReset,
    ],
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
          backgroundImage: "url(/images/banners/catalogo_banner.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // WATERCOLOR MASK EFFECT
          maskImage:
            "url(/images/masks/my-mask.png), linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage:
            "url(/images/masks/my-mask.png), linear-gradient(to bottom, black 50%, transparent 100%)",
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

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, lg: 8 } }}>
        {/* Controls Bar (Replacing SectionHeader) */}
        <Box
          sx={{
            mb: 4,
            pb: 2,
            borderBottom: 1,
            borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" sx={{ color: "grey.500" }}>
              Mostrando {filteredProducts.length} Artefactos
            </Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                variant="outlined"
                sx={{
                  color: "common.white",
                  bgcolor: "rgba(0,0,0,0.2)",
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) =>
                      alpha(theme.palette.secondary.main, 0.3),
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: (theme) =>
                      alpha(theme.palette.secondary.main, 0.6),
                  },
                  ".MuiSvgIcon-root": { color: "secondary.main" },
                }}
              >
                <MenuItem value="newest">Ordenar por: Más reciente</MenuItem>
                <MenuItem value="price-asc">Precio: Menor a Mayor</MenuItem>
                <MenuItem value="price-desc">Precio: Mayor a Menor</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

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
              {FilterContent}
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
              {FilterContent}
            </Drawer>
          </Grid>

          {/* Product Grid */}
          <Grid size={{ xs: 12, lg: 9 }}>
            {loading ? (
              <Box
                sx={{
                  py: 10,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: (theme) => alpha(theme.palette.common.white, 0.02),
                  borderRadius: 2,
                  border: 1,
                  borderColor: (theme) =>
                    alpha(theme.palette.secondary.main, 0.1),
                }}
              >
                <ForgeLoader message="Invocando artefactos..." size="large" />
              </Box>
            ) : filteredProducts.length === 0 ? (
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
                      window.scrollTo({ top: 0, behavior: "smooth" });
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
                {isAdmin && onUpdateProduct && (
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
                              onDeleteProduct={onDeleteProduct}
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
                              onDeleteProduct={onDeleteProduct}
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
                          onProductClick={() => {}}
                          onToggleWishlist={() => {}}
                          onAddToCart={() => {}}
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
                      window.scrollTo({ top: 0, behavior: "smooth" });
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
