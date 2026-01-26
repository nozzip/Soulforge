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
  alpha
} from '@mui/material';
import { Search, FilterList, Add, Favorite, FavoriteBorder, Public, Straighten, AutoStories, SentimentDissatisfied, Close } from '@mui/icons-material';

import { SectionHeader } from '../components/StyledComponents';
import ForgeLoader from '../components/ForgeLoader';

interface CatalogProps {
  products: Product[];
  categories: string[];
  scales: string[];
  onProductClick: (id: string) => void;
  initialSearchQuery?: string;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  loading?: boolean;
}

const ITEMS_PER_PAGE = 9;

const Catalog: React.FC<CatalogProps> = ({
  products,
  categories,
  scales,
  onProductClick,
  initialSearchQuery,
  wishlist,
  toggleWishlist,
  loading = false
}) => {
  const { addToCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedScales, setSelectedScales] = useState<string[]>([]);
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
  }, [searchQuery, selectedCategories, selectedScales, sortOption]);

  const FILTER_GROUPS = [
    {
      id: 'category',
      title: "Origen del Mundo",
      icon: <Public fontSize="small" />,
      options: categories
    },
    {
      id: 'scale',
      title: "Clase de Escala",
      icon: <Straighten fontSize="small" />,
      options: scales
    },
  ];

  const toggleFilter = (type: 'category' | 'scale', value: string) => {
    if (type === 'category') {
      setSelectedCategories(prev =>
        prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
      );
    } else {
      setSelectedScales(prev =>
        prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
      );
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedScales([]);
    setSortOption('newest');
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    // Early return for empty search and no filters
    if (!searchQuery && selectedCategories.length === 0 && selectedScales.length === 0) {
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
    
    return products.filter(product => {
      // Quick checks first
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }
      if (selectedScales.length > 0 && !selectedScales.includes(product.scale)) {
        return false;
      }
      
      // Search check only if there's a search query
      if (searchQuery) {
        return product.name.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower);
      }
      
      return true;
    }).sort((a, b) => {
      switch (sortOption) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest':
        default: return Number(b.id) - Number(a.id);
      }
    });
  }, [searchQuery, selectedCategories, selectedScales, sortOption, products]);

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
                const isSelected = group.id === 'category' ? selectedCategories.includes(opt) : selectedScales.includes(opt);
                return (
                  <ListItem
                    key={opt}
                    component="div"
                    disablePadding
                    onClick={() => toggleFilter(group.id as 'category' | 'scale', opt)}
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
  ), [searchQuery, isMobile, selectedCategories, selectedScales, handleSearchChange, handleReset]);

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
                          {product.badge && (
                            <Chip
                              label={product.badge}
                              size="small"
                              color="primary"
                              sx={{ position: 'absolute', top: 8, left: 8, borderRadius: 0, fontWeight: 'bold', letterSpacing: 1 }}
                            />
                          )}
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
                          <Typography variant="h6" gutterBottom noWrap sx={{ fontWeight: 'bold', fontFamily: 'Cinzel', color: 'common.white' }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="grey.500" sx={{ fontStyle: 'italic' }}>
                            {product.scale} • {product.category}
                          </Typography>
                        </CardContent>

                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pt: 0, pb: 2, borderTop: '1px dashed', borderColor: (theme) => alpha(theme.palette.common.white, 0.1), mt: 2 }}>
                          <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 'bold' }}>{formatCurrency(product.price)}</Typography>
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
                            title="Añadir al Tesoro"
                          >
                            <Add />
                          </IconButton>
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