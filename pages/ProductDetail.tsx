/// <reference lib="dom" />
import React, { useState, MouseEvent, useMemo, ChangeEvent, useEffect } from 'react';
import { ViewState, Product, SubItem } from '../types';
import { useCart } from '../context/CartContext';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Paper,
  Stack,
  Divider,
  TextField,
  Avatar,
  Chip,
  Rating,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  CardMedia,
  Skeleton
} from '@mui/material';
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ShoppingBag,
  Favorite,
  FavoriteBorder,
  Build,
  LocalShipping,
  Star,
  AddAPhoto,
  Close,
  AccountTree,
  Group,
  Grid4x4
} from '@mui/icons-material';

interface ProductDetailProps {
  products: Product[];
  productId: string | null;
  setView: (view: ViewState) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
}

// Mock initial reviews
const INITIAL_REVIEWS = [
  {
    id: 1,
    user: "Thrain Ironfoot",
    rating: 5,
    text: "The detail on the scales is maddeningly good. Painted up perfectly with Citadel contrast paints. A worthy addition to the hoard.",
    date: "2 days ago",
    image: null as string | null
  },
  {
    id: 2,
    user: "Elara Moonwhisper",
    rating: 4,
    text: "Slightly smaller than expected for 'Gargantuan', but fits the grid well. The resin quality is top tier, no bubbles at all.",
    date: "1 week ago",
    image: null as string | null
  }
];

// Helper for the tactical grid - using pure CSS/Box for grid
const BattlemapFootprint = ({ scale }: { scale: string }) => {
  const size = useMemo(() => {
    const s = scale.toLowerCase();
    if (s.includes('medium') || s.includes('small')) return 1;
    if (s.includes('large')) return 2;
    if (s.includes('huge')) return 3;
    if (s.includes('gargantuan')) return 4;
    if (s.includes('colossal')) return 5;
    return 1;
  }, [scale]);

  const totalSquares = size * size;

  return (
    <Box sx={{ mb: 5, p: 3, bgcolor: 'rgba(0,0,0,0.4)', border: 1, borderColor: 'rgba(197, 160, 89, 0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 3, position: 'relative', overflow: 'hidden' }}>
      {/* Visual Grid */}
      <Box sx={{ position: 'relative', width: 128, height: 128, bgcolor: 'background.paper', border: 1, borderColor: 'rgba(197, 160, 89, 0.1)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', flexShrink: 0 }}>
        {[...Array(25)].map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          // Center the footprint
          const offset = Math.floor((5 - size) / 2);
          const isActive = row >= offset && row < offset + size && col >= offset && col < offset + size;

          return (
            <Box
              key={i}
              sx={{
                border: '0.5px solid rgba(197, 160, 89, 0.05)',
                transition: 'background-color 0.7s',
                bgcolor: isActive ? 'rgba(var(--color-primary), 0.5)' : 'transparent', // Simulate primary/50
                boxShadow: isActive ? 'inset 0 0 10px var(--color-primary)' : 'none'
              }}
            />
          );
        })}
        {/* Footprint Indicator */}
        <Box
          sx={{
            position: 'absolute',
            border: 2,
            borderColor: 'primary.main',
            boxShadow: '0 0 15px var(--color-primary)',
            borderRadius: '2px',
            pointerEvents: 'none',
            transition: 'all 0.5s',
            width: `${(size / 5) * 100}%`,
            height: `${(size / 5) * 100}%`,
            top: `${(Math.floor((5 - size) / 2) / 5) * 100}%`,
            left: `${(Math.floor((5 - size) / 2) / 5) * 100}%`,
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'primary.main', opacity: 0.2, animation: 'pulse 2s infinite' }} />
        </Box>
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="overline" sx={{ color: 'grey.500', fontWeight: 'bold', letterSpacing: 2, mb: 0.5 }}>Tactical Footprint</Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'common.white' }}>{totalSquares}</Typography>
          <Typography variant="caption" sx={{ color: 'secondary.main', opacity: 0.6, fontWeight: 'bold', letterSpacing: 1 }}>SQUARES OCCUPIED</Typography>
        </Box>
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ color: 'grey.400', fontStyle: 'italic' }}>
            This {scale} artifact commands a <Box component="span" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{size}x{size}</Box> presence on a standard 1" tactical grid.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
            <Typography variant="caption" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 1, color: 'primary.main', fontWeight: 'bold' }}>In-Scale Accuracy Confirmed</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Texture Background */}
      <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, opacity: 0.05, pointerEvents: 'none' }}>
        <Grid4x4 sx={{ fontSize: 60 }} />
      </Box>
    </Box>
  );
};

// Skeleton Component
const ProductDetailSkeleton = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
      <Skeleton variant="rectangular" width={80} height={20} />
      <Skeleton variant="rectangular" width={20} height={20} />
      <Skeleton variant="rectangular" width={120} height={20} />
    </Box>
    <Grid container spacing={8}>
      <Grid size={{ xs: 12, lg: 6 }}>
        <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" width={80} height={80} sx={{ borderRadius: 1 }} />)}
        </Box>
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <Skeleton variant="text" height={40} width="60%" />
        <Skeleton variant="text" height={60} width="80%" />
        <Skeleton variant="rectangular" height={100} sx={{ my: 4 }} />
        <Skeleton variant="rectangular" height={50} width={200} />
      </Grid>
    </Grid>
  </Container>
);

const ProductDetail: React.FC<ProductDetailProps> = ({ products, productId, setView, wishlist, toggleWishlist }) => {
  const { addToCart } = useCart();
  const product = products.find(p => p.id === productId);
  const isWishlisted = product ? wishlist.includes(product.id) : false;

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // State for image gallery navigation
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [displayImageUrl, setDisplayImageUrl] = useState<string | null>(null);

  // State for zoom effect
  const [zoomProps, setZoomProps] = useState({ x: 0, y: 0, show: false });

  // State for Reviews
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [newReview, setNewReview] = useState({
    user: '',
    text: '',
    rating: 5,
    image: null as string | null
  });

  // Sync main image
  useEffect(() => {
    if (product) {
      setDisplayImageUrl(product.image);
    }
  }, [product]);

  // Simulate loading delay
  useEffect(() => {
    setIsLoading(true);
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 800ms simulated delay

    return () => clearTimeout(timer);
  }, [productId]);

  // Calculate dynamic rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  // Derived Related Products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product, products]);

  // Structured gallery data with names for the chips
  const galleryViews = useMemo(() => {
    if (!product) return [];
    const views = [
      { name: "Front View", url: product.image },
      { name: "Side Profile", url: product.image },
      { name: "Detail Shot", url: product.image }
    ];
    // Add sub-items if they have unique images
    if (product.subItems) {
      product.subItems.forEach(item => {
        if (item.image && item.image !== product.image) {
          views.push({ name: item.name, url: item.image });
        }
      });
    }
    return views;
  }, [product]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomProps({ x, y, show: true });
  };

  const handleMouseLeave = () => {
    setZoomProps({ ...zoomProps, show: false });
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextIdx = (activeImageIndex + 1) % galleryViews.length;
    setActiveImageIndex(nextIdx);
    setDisplayImageUrl(galleryViews[nextIdx].url);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const prevIdx = (activeImageIndex - 1 + galleryViews.length) % galleryViews.length;
    setActiveImageIndex(prevIdx);
    setDisplayImageUrl(galleryViews[prevIdx].url);
  };

  const selectView = (idx: number) => {
    setActiveImageIndex(idx);
    setDisplayImageUrl(galleryViews[idx].url);
  };

  // Review Handlers
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setNewReview(prev => ({ ...prev, image: ev.target!.result as string }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmitReview = () => {
    if (!newReview.user || !newReview.text) return;
    const review = {
      id: Date.now(),
      ...newReview,
      date: "Just now"
    };
    setReviews([review, ...reviews]);
    setNewReview({ user: '', text: '', rating: 5, image: null });
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <Box sx={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 3 }}>
        <Typography variant="h4" color="secondary.main" fontWeight="bold" gutterBottom>Artifact Lost</Typography>
        <Typography color="text.secondary" paragraph>The scrying orb cannot locate this item in the archives.</Typography>
        <Button onClick={() => setView(ViewState.CATALOG)} color="primary" sx={{ textDecoration: 'underline' }}>
          Return to Archives
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6, px: { xs: 2, lg: 8 } }}>
      {/* Breadcrumb / Back Navigation */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          onClick={() => setView(ViewState.CATALOG)}
          startIcon={<ArrowBack />}
          sx={{ color: 'text.secondary', '&:hover': { color: 'secondary.main' } }}
        >
          Catalog
        </Button>
        <Typography color="text.secondary">/</Typography>
        <Typography color="text.secondary">{product.category}</Typography>
        <Typography color="text.secondary">/</Typography>
        <Typography color="secondary.main" fontWeight="bold" noWrap>{product.name}</Typography>
      </Box>

      <Grid container spacing={8}>
        {/* Left Column: Image Gallery */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Main Image Container */}
            <Paper
              elevation={6}
              sx={{
                position: 'relative',
                aspectRatio: '1/1',
                bgcolor: 'black',
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'crosshair',
                border: 1,
                borderColor: 'secondary.main'
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Zoom Layer */}
              <Box
                sx={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url("${displayImageUrl}")`,
                  backgroundPosition: zoomProps.show ? `${zoomProps.x}% ${zoomProps.y}%` : 'center',
                  backgroundSize: zoomProps.show ? '200%' : 'cover',
                  backgroundRepeat: 'no-repeat',
                  transition: 'transform 0.1s ease-out'
                }}
              />

              {/* Navigation Arrows */}
              {galleryViews.length > 1 && (
                <>
                  <IconButton onClick={prevImage} sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}>
                    <ChevronLeft />
                  </IconButton>
                  <IconButton onClick={nextImage} sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}>
                    <ChevronRight />
                  </IconButton>
                </>
              )}

              {/* Badges and Hints */}
              {product.badge && !zoomProps.show && (
                <Chip label={product.badge} color="primary" sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 'bold', borderRadius: 0 }} />
              )}

              {!zoomProps.show && (
                <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', bgcolor: 'rgba(0,0,0,0.6)', borderRadius: 4, px: 2, py: 0.5, display: 'flex', alignItems: 'center', gap: 1, backdropFilter: 'blur(4px)', border: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <ZoomIn sx={{ fontSize: 16, color: 'white' }} />
                  <Typography variant="caption" sx={{ color: 'white', letterSpacing: 1, textTransform: 'uppercase' }}>Hover to Inspect</Typography>
                </Box>
              )}
            </Paper>

            {/* Thumbnails */}
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {galleryViews.map((view, i) => (
                <Box
                  key={i}
                  onClick={() => selectView(i)}
                  sx={{
                    width: 80, height: 80,
                    flexShrink: 0,
                    borderRadius: 1,
                    border: 1,
                    borderColor: i === activeImageIndex ? 'secondary.main' : 'transparent',
                    opacity: i === activeImageIndex ? 1 : 0.5,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    '&:hover': { opacity: 1, borderColor: 'secondary.main' }
                  }}
                >
                  <Box component="img" src={view.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Details */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ mb: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip label={`${product.scale} Scale`} variant="outlined" color="primary" size="small" sx={{ fontWeight: 'bold' }} />
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1 }}>
              REF: {product.category.toUpperCase()}-{product.id.padStart(3, '0')}
            </Typography>
          </Box>

          <Typography variant="h2" sx={{ fontWeight: 'bold', fontStyle: 'italic', mb: 2, color: 'common.white' }}>
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, pb: 4, borderBottom: 1, borderColor: 'rgba(197, 160, 89, 0.1)' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
              {product.price.toFixed(0)} GP
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'grey.800' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={averageRating} readOnly precision={0.5} emptyIcon={<Star style={{ opacity: 0.3, color: 'grey' }} fontSize="inherit" />} />
              <Typography variant="caption" color="text.secondary">({reviews.length} Reviews)</Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 5 }}>
            <Typography variant="overline" color="secondary.main" fontWeight="bold" letterSpacing={2} display="block" gutterBottom>Lore & Description</Typography>
            <Typography variant="body1" color="text.secondary" paragraph fontStyle="italic" sx={{ opacity: 0.9 }}>
              "{product.description || "A rare artifact retrieved from the deepest dungeons. Details of its origin are shrouded in mystery, but its craftsmanship is undeniable."}"
            </Typography>
          </Box>

          <BattlemapFootprint scale={product.scale} />

          {/* Unit Composition */}
          {product.subItems && product.subItems.length > 0 && (
            <Paper elevation={0} sx={{ mb: 5, p: 3, bgcolor: 'background.paper', border: 1, borderColor: 'rgba(197, 160, 89, 0.2)', position: 'relative' }}>
              <Typography variant="overline" color="common.white" fontWeight="bold" letterSpacing={2} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountTree fontSize="small" color="secondary" /> Unit Composition
              </Typography>
              <Grid container spacing={2}>
                {product.subItems.map((item) => (
                  <Grid key={item.id} size={{ xs: 3, sm: 2.4 }}>
                    <Box
                      onClick={() => item.image && setDisplayImageUrl(item.image)}
                      sx={{ cursor: 'pointer', textAlign: 'center', '&:hover img': { opacity: 1 }, '&:hover span': { color: 'secondary.main' } }}
                    >
                      <Box sx={{ aspectRatio: '1/1', borderRadius: 1, border: 1, borderColor: 'rgba(197, 160, 89, 0.2)', bgcolor: 'black', overflow: 'hidden', mb: 0.5 }}>
                        <Box component="img" src={item.image || product.image} sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, transition: 'opacity 0.2s' }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', lineHeight: 1, transition: 'color 0.2s' }}>
                        {item.name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 6 }}>
            <Button
              fullWidth
              onClick={() => addToCart(product)}
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ShoppingBag />}
              sx={{ py: 2, fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: 2 }}
            >
              Add to Hoard
            </Button>
            <Button
              onClick={() => toggleWishlist(product.id)}
              variant="outlined"
              color={isWishlisted ? "primary" : "secondary"}
              sx={{ minWidth: 64, borderColor: isWishlisted ? 'primary.main' : 'rgba(197, 160, 89, 0.3)' }}
            >
              {isWishlisted ? <Favorite /> : <FavoriteBorder />}
            </Button>
          </Stack>

          {/* Specs */}
          <Paper variant="outlined" sx={{ p: 3, bgcolor: 'transparent', borderColor: 'rgba(197, 160, 89, 0.1)' }}>
            <Typography variant="overline" color="common.white" fontWeight="bold" letterSpacing={2} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build fontSize="small" color="secondary" /> Technical Specifications
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography variant="caption" color="grey.600" display="block">Material</Typography>
                <Typography variant="body2" color="grey.400">High-Fidelity Grey Resin</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="grey.600" display="block">Base Size</Typography>
                <Typography variant="body2" color="grey.400">{product.scale === 'Gargantuan' ? '100mm' : product.scale === 'Large' ? '50mm' : '32mm'}</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="grey.600" display="block">Assembly</Typography>
                <Typography variant="body2" color="grey.400">Unassembled & Unpainted</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="grey.600" display="block">Layer Height</Typography>
                <Typography variant="body2" color="grey.400">0.03mm (30 microns)</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <LocalShipping fontSize="small" color="secondary" />
            <Typography variant="caption" color="text.secondary" fontStyle="italic">
              Ships within 3-5 business days. Packaged with protective enchantments (bubble wrap) to ensure safe arrival.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Related Artifacts */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mb: 10, mt: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Divider sx={{ flex: 1, borderColor: 'rgba(197, 160, 89, 0.2)' }} />
            <Typography variant="h5" sx={{ textTransform: 'uppercase', letterSpacing: 3, fontWeight: 'bold', fontStyle: 'italic', color: 'common.white' }}>
              Related Artifacts
            </Typography>
            <Divider sx={{ flex: 1, borderColor: 'rgba(197, 160, 89, 0.2)' }} />
          </Box>
          <Grid container spacing={4}>
            {relatedProducts.map(p => (
              <Grid key={p.id} size={{ xs: 12, md: 4 }}>
                <Card
                  onClick={() => { window.scrollTo(0, 0); setView(ViewState.PRODUCT_DETAIL); }}
                  sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'rgba(197, 160, 89, 0.2)', cursor: 'pointer', transition: 'all 0.3s', '&:hover': { borderColor: 'secondary.main', transform: 'translateY(-4px)' } }}
                >
                  <CardMedia component="img" height="250" image={p.image} alt={p.name} sx={{ opacity: 0.8 }} />
                  <CardContent>
                    <Typography variant="h6" color="common.white" fontWeight="bold">{p.name}</Typography>
                    <Typography variant="body2" color="secondary">{p.price.toFixed(0)} GP</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Reviews Section */}
      <Box sx={{ borderTop: 1, borderColor: 'rgba(197, 160, 89, 0.2)', pt: 6 }}>
        <Grid container spacing={8}>
          {/* Form */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Typography variant="h6" color="secondary.main" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold' }}>Inscribe a Chronicle</Typography>
            <Typography variant="body2" color="text.secondary" paragraph fontStyle="italic">Share your experience with this artifact. Your tales guide other adventurers.</Typography>

            <Stack spacing={3} sx={{ mt: 3 }}>
              <TextField
                label="Adventurer Name"
                variant="outlined"
                fullWidth
                value={newReview.user}
                onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}
              />

              <Box>
                <Typography component="legend" variant="caption" color="text.secondary">Rating</Typography>
                <Rating
                  value={newReview.rating}
                  onChange={(_, val) => setNewReview({ ...newReview, rating: val || 5 })}
                  emptyIcon={<Star style={{ opacity: 0.3, color: 'grey' }} fontSize="inherit" />}
                />
              </Box>

              <TextField
                label="Chronicle"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                value={newReview.text}
                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
              />

              <Box>
                <Typography variant="caption" display="block" color="text.secondary" gutterBottom>Visual Proof (Optional)</Typography>
                <Button variant="outlined" component="label" startIcon={<AddAPhoto />} color="secondary" sx={{ textTransform: 'none' }}>
                  Attach Image
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
                {newReview.image && (
                  <Box sx={{ mt: 1, position: 'relative', width: 80, height: 80, borderRadius: 1, overflow: 'hidden' }}>
                    <img src={newReview.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton size="small" onClick={() => setNewReview({ ...newReview, image: null })} sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Button
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                onClick={handleSubmitReview}
                disabled={!newReview.user || !newReview.text}
                sx={{ color: 'background.default', fontWeight: 'bold' }}
              >
                Post Chronicle
              </Button>
            </Stack>
          </Grid>

          {/* Log */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: 1, borderColor: 'rgba(197, 160, 89, 0.2)' }}>
              <Typography variant="h5" color="common.white" fontWeight="bold" sx={{ fontStyle: 'italic' }}>Scribe's Log</Typography>
              <Typography variant="caption" color="secondary.main">{reviews.length} Entries recorded</Typography>
            </Box>

            <Stack spacing={4}>
              {reviews.map(review => (
                <Paper key={review.id} elevation={0} sx={{ p: 3, bgcolor: 'background.paper', border: 1, borderColor: 'rgba(197, 160, 89, 0.1)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(197, 160, 89, 0.2)', color: 'secondary.main', fontWeight: 'bold' }}>{review.user.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="common.white" fontWeight="bold">{review.user}</Typography>
                        <Typography variant="caption" color="text.secondary">{review.date}</Typography>
                      </Box>
                    </Box>
                    <Rating value={review.rating} readOnly size="small" emptyIcon={<Star style={{ opacity: 0.3, color: 'grey' }} fontSize="inherit" />} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic" paragraph>"{review.text}"</Typography>
                  {review.image && (
                    <Box component="img" src={review.image} alt="User upload" sx={{ height: 100, borderRadius: 1, border: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                  )}
                </Paper>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProductDetail;