import React, { useMemo } from 'react';
import { ViewState, Product } from '../types';
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
  Card,
  CardMedia,
  CardContent,
  CardActions,
  alpha,
  useTheme
} from '@mui/material';
import { Favorite, Delete, BookmarkRemove, Backpack } from '@mui/icons-material';
import { SectionHeader } from '../components/StyledComponents';

interface WishlistProps {
  products: Product[];
  setView: (view: ViewState) => void;
  onProductClick: (id: string) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
}

const Wishlist: React.FC<WishlistProps> = ({ products, setView, onProductClick, wishlist, toggleWishlist }) => {
  const theme = useTheme();
  const { addToCart } = useCart();

  const wishlistedProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [wishlist, products]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <SectionHeader
        title="My Wishlist"
        description="Artifacts marked for future acquisition"
        icon={<Favorite />}
        rightElement={
          <Button onClick={() => setView(ViewState.CATALOG)} sx={{ color: 'secondary.main', textDecoration: 'underline', textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.7rem', '&:hover': { color: 'common.white' } }}>
            Continue Exploring
          </Button>
        }
      />

      {wishlistedProducts.length === 0 ? (
        <Paper sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, textAlign: 'center', opacity: 0.8, bgcolor: (t) => alpha(t.palette.background.paper, 0.5), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.1), borderRadius: 2 }}>
          <BookmarkRemove sx={{ fontSize: 64, color: 'grey.600', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'common.white', mb: 1 }}>Your Wishlist is Empty</Typography>
          <Typography variant="body2" color="grey.500" sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
            You haven't marked any artifacts yet. Browse the archives to find miniatures worthy of your campaign.
          </Typography>
          <Button variant="outlined" color="secondary" onClick={() => setView(ViewState.CATALOG)} sx={{ fontWeight: 'bold', letterSpacing: 2, px: 4, py: 1.5, '&:hover': { bgcolor: 'secondary.main', color: 'background.default' } }}>
            Browse Archives
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {wishlistedProducts.map((product) => (
            <Grid key={product.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                onClick={() => onProductClick(product.id)}
                sx={{
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': { borderColor: (t) => alpha(t.palette.secondary.main, 0.6), transform: 'translateY(-4px)', boxShadow: 6 }
                }}
              >
                <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden', borderBottom: 1, borderColor: 'common.black' }}>
                  <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `url("${product.image}")`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.5s', '&:hover': { transform: 'scale(1.1)' } }} />
                  <IconButton
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: (t) => alpha(t.palette.common.black, 0.5), backdropFilter: 'blur(4px)', color: 'error.main', '&:hover': { bgcolor: 'error.dark', color: 'common.white' }, zIndex: 1 }}
                    title="Remove from Wishlist"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>

                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'grey.100', lineHeight: 1.2, '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }}>{product.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'grey.500', fontStyle: 'italic' }}>{product.scale} • {product.category}</Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, borderTop: '1px dashed', borderColor: (t) => alpha(t.palette.grey[800], 0.5) }}>
                  <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{product.price.toFixed(0)} GP</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<Backpack />}
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    sx={{ fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.65rem' }}
                  >
                    Add to Loot
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Wishlist;