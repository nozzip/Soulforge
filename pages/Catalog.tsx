/// <reference lib="dom" />
import React, { useState, useMemo, useEffect, useCallback, useRef, memo } from 'react';
import { Product, ViewState } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
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
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Stack,
  Chip,
  Paper,
  useMediaQuery,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import { Search, FilterList, Add, Favorite, FavoriteBorder, Public, Straighten, AutoStories, SentimentDissatisfied, Close, Delete } from '@mui/icons-material';

import { SectionHeader } from '../components/StyledComponents';
import ForgeLoader from '../components/ForgeLoader';

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
  onDeleteProduct
}) => {
  const { addToCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>([]);
  const [selectedCreatureTypes, setSelectedCreatureTypes] = useState<string[]>([]);
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Mobile filter visibility state
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, selectedSizes, selectedDesigners, selectedCreatureTypes, selectedWeapons, sortOption]);

  const FILTER_GROUPS = [
    {
      id: 'category',
      title: "Origen del Mundo",
      icon: <Public fontSize="small" />,
      options: categories
    },
    {
      id: 'size',
      title: "Clase de Escala",
      icon: <Straighten fontSize="small" />,
      options: sizes
    },
    {
      id: 'designer',
      title: "Gran Maestro (Diseñador)",
      icon: <Search fontSize="small" />,
      options: designers
    },
    {
      id: 'creature_type',
      title: "Naturaleza de Criatura",
      icon: <SentimentDissatisfied fontSize="small" />,
      options: creatureTypes
    },
    {
      id: 'weapon',
      title: "Arsenales (Armas)",
      icon: <Search fontSize="small" />,
      options: weapons
    },
  ];

  const toggleFilter = (type: 'category' | 'size' | 'designer' | 'creature_type', value: string) => {
    if (type === 'category') {
      setSelectedCategories(prev =>
        prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
      );
    } else if (type === 'size') {
      setSelectedSizes(prev =>
        prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
      );
    } else if (type === 'designer') {
      setSelectedDesigners(prev =>
        prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
      );
    } else if (type === 'creature_type') {
      setSelectedCreatureTypes(prev =>
        prev.includes(value) ? prev.filter(ct => ct !== value) : [...prev, value]
      );
    } else if (type === 'weapon') {
      setSelectedWeapons(prev =>
        prev.includes(value) ? prev.filter(w => w !== value) : [...prev, value]
      );
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedDesigners([]);
    setSelectedCreatureTypes([]);
    setSelectedWeapons([]);
    setSortOption('newest');
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    // Early return for empty search and no filters
    if (!searchQuery &&
      selectedCategories.length === 0 &&
      selectedSizes.length === 0 &&
      selectedDesigners.length === 0 &&
      selectedCreatureTypes.length === 0 &&
      selectedWeapons.length === 0) {
      return products.sort((a, b) => {
        switch (sortOption) {
          case 'price-asc': return a.price - b.price;
          case 'price-desc': return b.price - a.price;
          case 'newest':
          default: return Number(b.id) - Number(a.id);
        }
      });
    }

    const searchLower = searchQuery.toLowerCase();

    const baseFiltered = products.filter(product => {
      // Quick checks first
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }
      if (selectedSizes.length > 0 && product.size && !selectedSizes.includes(product.size)) {
        return false;
      }
      if (selectedDesigners.length > 0 && product.designer && !selectedDesigners.includes(product.designer)) {
        return false;
      }
      if (selectedCreatureTypes.length > 0 && product.creature_type && !selectedCreatureTypes.includes(product.creature_type)) {
        return false;
      }
      if (selectedWeapons.length > 0) {
        if (!product.weapon) return false;
        const productWeapons = product.weapon.split('/').map(w => w.trim());
        if (!selectedWeapons.some(sw => productWeapons.includes(sw))) {
          return false;
        }
      }

      // Search check only if there's a search query
      if (searchQuery) {
        return product.name.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          (product.designer && product.designer.toLowerCase().includes(searchLower)) ||
          (product.creature_type && product.creature_type.toLowerCase().includes(searchLower));
      }

      return true;
    });

    // Grouping Logic
    const groupedProducts: Product[] = [];
    const setsMap = new Map<string, { header?: Product; items: Product[] }>();

    baseFiltered.forEach(p => {
      if (p.set_name && p.set_name !== 'Sin set') {
        if (!setsMap.has(p.set_name)) {
          setsMap.set(p.set_name, { items: [] });
        }
        const set = setsMap.get(p.set_name)!;
        if (p.name.toLowerCase().includes('header')) {
          set.header = p;
        } else {
          set.items.push(p);
        }
      } else {
        groupedProducts.push(p);
      }
    });

    // Add sets to the list
    setsMap.forEach((set, setName) => {
      if (set.header) {
        groupedProducts.push({
          ...set.header,
          subItems: set.items.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image,
            description: item.description
          }))
        });
      } else if (set.items.length > 0) {
        // If no header found, but items exist, show them individually or just the first one?
        // User said "putting the image that indicates 'Header' as main image", 
        // which implies there should be one. If not, we fall back to showing them individually.
        groupedProducts.push(...set.items);
      }
    });

    return groupedProducts.sort((a, b) => {
      switch (sortOption) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest':
        default: return Number(b.id) - Number(a.id);
      }
    });
  }, [searchQuery, selectedCategories, selectedSizes, selectedDesigners, selectedCreatureTypes, selectedWeapons, sortOption, products]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const FilterContent = useMemo(() => (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', background: (theme) => `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.default})` }}>
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="secondary.main">Filtros</Typography>
          <IconButton onClick={() => setShowFilters(false)}><Close /></IconButton>
        </Box>
      )}

      <Box sx={{ position: 'relative', mb: 4 }}>
        <Typography variant="subtitle2" sx={{ color: 'secondary.main', textTransform: 'uppercase', letterSpacing: 1, mb: 1, pb: 1, borderBottom: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2) }}>
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
              startAdornment: <InputAdornment position="start"><Search color="secondary" /></InputAdornment>,
            }
          }}
        />
      </Box>

      <Stack spacing={4}>
        {FILTER_GROUPS.map(group => (
          <Box key={group.id}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'grey.300', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
              <Box component="span" sx={{ color: 'primary.main' }}>{group.icon}</Box> {group.title}
            </Typography>
            <List dense disablePadding sx={{ borderLeft: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1), pl: 1 }}>
              {group.options.map(opt => {
                let isSelected = false;
                if (group.id === 'category') isSelected = selectedCategories.includes(opt);
                else if (group.id === 'size') isSelected = selectedSizes.includes(opt);
                else if (group.id === 'designer') isSelected = selectedDesigners.includes(opt);
                else if (group.id === 'creature_type') isSelected = selectedCreatureTypes.includes(opt);
                else if (group.id === 'weapon') isSelected = selectedWeapons.includes(opt);

                return (
                  <ListItem
                    key={opt}
                    component="div"
                    disablePadding
                    onClick={() => toggleFilter(group.id as any, opt)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'transparent' } }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Checkbox
                        edge="start"
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                        sx={{ p: 0.5, color: 'grey.700', '&.Mui-checked': { color: 'primary.main' } }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={opt} primaryTypographyProps={{ variant: 'body2', color: isSelected ? 'common.white' : 'grey.500', fontWeight: isSelected ? 'bold' : 'normal' }} />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Stack>

      <Button
        fullWidth
        variant="outlined"
        color="secondary"
        onClick={handleReset}
        sx={{ mt: 4, letterSpacing: 2 }}
      >
        Reiniciar Índice
      </Button>
    </Box>
  ), [searchQuery, isMobile, selectedCategories, selectedSizes, selectedDesigners, selectedCreatureTypes, selectedWeapons, handleSearchChange, handleReset]);

  return (
    <Container maxWidth="xl" sx={{ py: 6, px: { xs: 2, lg: 8 } }}>
      <SectionHeader
        title="Los Archivos de Miniaturas"
        description="Donde las leyendas se forjan en resina."
        icon={<AutoStories />}
        rightElement={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>Mostrando {filteredProducts.length} Artefactos</Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                variant="outlined"
                sx={{
                  color: 'common.white',
                  bgcolor: 'rgba(0,0,0,0.2)',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: (theme) => alpha(theme.palette.secondary.main, 0.3) },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => alpha(theme.palette.secondary.main, 0.6) },
                  '.MuiSvgIcon-root': { color: 'secondary.main' }
                }}
              >
                <MenuItem value="newest">Ordenar por: Más reciente</MenuItem>
                <MenuItem value="price-asc">Precio: Menor a Mayor</MenuItem>
                <MenuItem value="price-desc">Precio: Mayor a Menor</MenuItem>
              </Select>
            </FormControl>
          </Box>
        }
      />

      <Grid container spacing={4}>
        {/* Sidebar - Desktop */}
        <Grid size={{ xs: 12, lg: 3 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Paper sx={{ border: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.3), bgcolor: 'background.paper', position: 'sticky', top: 100, boxShadow: (theme) => `0 0 40px ${alpha(theme.palette.common.black, 0.5)}, inset 0 0 30px ${alpha(theme.palette.common.black, 0.3)}` }}>
            {FilterContent}
          </Paper>
        </Grid>

        {/* Mobile Filter Button */}
        <Grid size={{ xs: 12 }} sx={{ display: { lg: 'none' } }}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(true)}
          >
            Index Search & Filtros
          </Button>
          <Drawer open={showFilters} onClose={() => setShowFilters(false)} PaperProps={{ sx: { width: 300, bgcolor: 'background.default' } }}>
            {FilterContent}
          </Drawer>
        </Grid>

        {/* Product Grid */}
        <Grid size={{ xs: 12, lg: 9 }}>
          {loading ? (
            <Box sx={{ py: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: (theme) => alpha(theme.palette.common.white, 0.02), borderRadius: 2, border: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1) }}>
              <ForgeLoader message="Invocando artefactos..." size="large" />
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, bgcolor: (theme) => alpha(theme.palette.common.white, 0.02), borderRadius: 2, border: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1) }}>
              <SentimentDissatisfied sx={{ fontSize: 60, color: 'secondary.main', mb: 2, opacity: 0.5 }} />
              <Typography variant="h5" color="common.white" gutterBottom>No se encontraron artefactos</Typography>
              <Typography color="grey.500" paragraph>Los archivos no contienen registros que coincidan con tu búsqueda.</Typography>
              <Button onClick={handleReset} sx={{ color: 'secondary.main', textDecoration: 'underline' }}>Limpiar Filtros</Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  color="secondary"
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': { color: 'grey.500', border: '1px solid transparent' },
                    '& .MuiPaginationItem-root.Mui-selected': { color: 'background.default', bgcolor: 'secondary.main', fontWeight: 'bold' },
                    '& .MuiPaginationItem-root:hover': { borderColor: 'secondary.main', color: 'common.white' }
                  }}
                />
              </Box>

              <Grid container spacing={3}>
                {currentProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  return (
                    <Grid key={product.id} size={{ xs: 12, md: 6, lg: 4 }}>
                      <Card
                        onClick={() => onProductClick(product.id)}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          background: (theme) => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.8)})`,
                          border: 1,
                          borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2),
                          transition: 'all 0.3s',
                          cursor: 'pointer',
                          boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.common.black, 0.4)}`,
                          '&:hover': { borderColor: 'secondary.main', transform: 'translateY(-4px)', boxShadow: (theme) => `0 8px 30px ${alpha(theme.palette.common.black, 0.6)}, 0 0 20px ${alpha(theme.palette.secondary.main, 0.2)}` }
                        }}
                      >
                        <Box sx={{ position: 'relative', pt: '100%', borderBottom: 1, borderColor: 'common.black' }}>
                          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `url("${product.image}")`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.5s', '&:hover': { transform: 'scale(1.05)' } }} />
                          <IconButton
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                            sx={{
                              position: 'absolute', top: 8, right: 8,
                              bgcolor: isWishlisted ? 'primary.main' : (theme) => alpha(theme.palette.common.black, 0.6),
                              color: isWishlisted ? 'white' : 'secondary.main',
                              '&:hover': { bgcolor: 'secondary.main', color: 'background.default' }
                            }}
                          >
                            {isWishlisted ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                          </IconButton>
                        </Box>

                        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                          <Typography variant="h6" gutterBottom noWrap sx={{ fontWeight: 'bold', fontFamily: 'Cinzel', color: 'common.white', mb: 0 }}>
                            {product.name.replace(/\s*Header\s*/gi, '').trim()}
                          </Typography>
                          <Typography variant="caption" color="primary.main" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.7rem' }}>
                            {product.designer ? `Diseñado por ${product.designer}` : 'Forja Original'}
                          </Typography>
                          <Typography variant="body2" color="grey.500" sx={{ fontStyle: 'italic' }}>
                            {product.size || 'Sin tamaño'} • {product.category}
                            {product.set_name && ` • ${product.set_name}`}
                          </Typography>
                        </CardContent>

                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pt: 0, pb: 2, borderTop: '1px dashed', borderColor: (theme) => alpha(theme.palette.common.white, 0.1), mt: 2 }}>
                          <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 'bold' }}>{formatCurrency(product.price)}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isAdmin && onDeleteProduct && (
                              <Tooltip title="Eliminar del Archivo" arrow>
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`¿Estás seguro de eliminar "${product.name}"? Esta acción es irreversible.`)) {
                                      onDeleteProduct(product.id);
                                    }
                                  }}
                                  sx={{
                                    color: 'error.main',
                                    bgcolor: (t) => alpha(t.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: 'error.main', color: 'white' }
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Añadir al Tesoro" arrow>
                              <IconButton
                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                color="primary"
                                sx={{
                                  bgcolor: 'primary.dark',
                                  color: 'white',
                                  width: 40, height: 40,
                                  boxShadow: 3,
                                  '&:hover': { bgcolor: 'primary.main', transform: 'scale(1.1)' }
                                }}
                              >
                                <Add />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  color="secondary"
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': { color: 'grey.500', border: '1px solid transparent' },
                    '& .MuiPaginationItem-root.Mui-selected': { color: 'background.default', bgcolor: 'secondary.main', fontWeight: 'bold' },
                    '& .MuiPaginationItem-root:hover': { borderColor: 'secondary.main', color: 'common.white' }
                  }}
                />
              </Box>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Catalog;