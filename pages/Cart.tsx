import React from 'react';
import { useCart } from '../context/CartContext';
import { ViewState } from '../types';
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
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Inventory2,
  Add,
  Remove,
  LinkOff,
  MonetizationOn,
  Lock,
  Payments,
  AccountBalanceWallet,
  CreditCard
} from '@mui/icons-material';
import { SectionHeader } from '../components/StyledComponents';

interface CartProps {
  setView: (view: ViewState) => void;
}

const Cart: React.FC<CartProps> = ({ setView }) => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const taxes = 0;
  const shipping = 12.50;
  const grandTotal = totalPrice + shipping + taxes;

  return (
    <Container maxWidth="lg" sx={{ py: 6, px: { xs: 2, lg: 4 } }}>
      <SectionHeader
        title="Review Your Loot"
        description="The hoard has been gathered. Secure it before the dungeon collapses."
        icon={<Inventory2 />}
      />

      <Grid container spacing={6}>
        {/* Cart Items */}
        <Grid size={{ xs: 12, lg: 8 }} sx={{ position: 'relative' }}>
          {/* Decorative Background for Desktop */}
          <Box sx={{
            display: { xs: 'none', sm: 'block' },
            position: 'absolute', inset: 0,
            borderRadius: 2,
            border: '8px solid', borderColor: 'common.black',
            background: (theme) => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
            zIndex: 0
          }} />

          {/* Content Layer */}
          <Box sx={{ position: 'relative', zIndex: 1, p: { sm: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2), pb: 2, mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, color: 'secondary.main' }}>
                The Loot
              </Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic', color: (theme) => alpha(theme.palette.secondary.main, 0.4) }}>
                {items.length} items found
              </Typography>
            </Box>

            {items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, bgcolor: { xs: (theme) => alpha(theme.palette.common.black, 0.2), sm: 'transparent' }, borderRadius: 1 }}>
                <Typography color="grey.500" fontStyle="italic">Your hoard is empty.</Typography>
                <Button onClick={() => setView(ViewState.CATALOG)} sx={{ mt: 2, textDecoration: 'underline', color: 'secondary.main', '&:hover': { color: 'common.white' } }}>
                  Return to Archives
                </Button>
              </Box>
            ) : (
              <Stack spacing={3}>
                {items.map(item => (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 3,
                      p: { xs: 2, sm: 0 },
                      bgcolor: { xs: 'rgba(0,0,0,0.2)', sm: 'transparent' },
                      border: { xs: 1, sm: 0 },
                      borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1)
                    }}
                  >
                    <Box sx={{
                      width: { xs: 80, sm: 96 },
                      height: { xs: 80, sm: 96 },
                      borderRadius: 1,
                      border: 1,
                      borderColor: (theme) => alpha(theme.palette.secondary.main, 0.3),
                      bgcolor: 'common.black',
                      overflow: 'hidden',
                      flexShrink: 0,
                      boxShadow: (theme) => `0 0 10px ${alpha(theme.palette.secondary.main, 0.3)}`
                    }}>
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, transition: 'opacity 0.3s', '&:hover': { opacity: 1 } }}
                      />
                    </Box>

                    <Box sx={{ flex: 1, width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ pr: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'common.white', fontStyle: 'italic', lineHeight: 1.2 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mt: 0.5, mb: 1 }}>
                            {item.scale} • {item.category}
                          </Typography>
                        </Box>
                        {isMobile && (
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'secondary.main', whiteSpace: 'nowrap' }}>
                            {(item.price * item.quantity).toFixed(0)} GP
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-start' }, gap: 3, mt: { xs: 1, sm: 0 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2), borderRadius: 1, bgcolor: (theme) => alpha(theme.palette.common.black, 0.5) }}>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, -1)} sx={{ color: 'secondary.main', '&:hover': { color: 'common.white' } }}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography sx={{ px: 1, minWidth: 24, textAlign: 'center', fontWeight: 'bold', color: 'common.white', fontSize: '0.875rem' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, 1)} sx={{ color: 'secondary.main', '&:hover': { color: 'common.white' } }}>
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                        <Button
                          startIcon={<LinkOff />}
                          onClick={() => removeFromCart(item.id)}
                          size="small"
                          sx={{ color: 'grey.500', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.75rem', '&:hover': { color: 'primary.main' } }}
                        >
                          Discard
                        </Button>
                      </Box>
                    </Box>

                    {!isMobile && (
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                          {(item.price * item.quantity).toFixed(2)} GP
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}

            <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2), display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1, color: (theme) => alpha(theme.palette.secondary.main, 0.5), fontStyle: 'italic', textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="caption">Your inventory is protected by magical wards.</Typography>
              <Typography variant="caption">Total Weight: 12.4 lbs</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Summary */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Paper sx={{
              p: 3,
              bgcolor: 'background.paper',
              border: 2,
              borderColor: 'secondary.main',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 6
            }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: 'secondary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontStyle: 'italic', mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'common.white' }}>
                <MonetizationOn sx={{ color: 'secondary.main' }} />
                Treasure Summary
              </Typography>

              <Stack spacing={2} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 1 }}>Hoard Subtotal</Typography>
                  <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{totalPrice.toFixed(2)} GP</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 1 }}>Carriage & Portal Fee</Typography>
                  <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{shipping.toFixed(2)} GP</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 2, borderBottom: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1) }}>
                  <Typography variant="body2" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 1 }}>Taxation of the Realm</Typography>
                  <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{taxes.toFixed(2)} GP</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontStyle: 'italic', color: 'common.white' }}>Grand Total</Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main', lineHeight: 1 }}>{grandTotal.toFixed(2)} GP</Typography>
                    <Typography variant="caption" sx={{ color: (theme) => alpha(theme.palette.secondary.main, 0.4), textTransform: 'uppercase', fontSize: '0.65rem' }}>Gold Pieces equivalent</Typography>
                  </Box>
                </Box>
              </Stack>

              <Button
                fullWidth
                onClick={() => setView(ViewState.CHECKOUT)}
                disabled={items.length === 0}
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Lock />}
                sx={{
                  py: 2,
                  fontWeight: 'bold',
                  letterSpacing: 2,
                  border: 1,
                  borderColor: 'secondary.main',
                  boxShadow: '0 0 15px rgba(150,0,24,0.4), inset 0 0 10px rgba(255,255,255,0.1)'
                }}
              >
                Proceed to Secure
              </Button>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                <Divider flexItem sx={{ borderColor: (theme) => alpha(theme.palette.secondary.main, 0.3), width: '100%' }} />
                <Typography variant="caption" sx={{ color: 'grey.600', textTransform: 'uppercase', letterSpacing: 1 }}>Accepted Currencies</Typography>
                <Box sx={{ display: 'flex', gap: 2, opacity: 0.5, color: 'common.white' }}>
                  <Payments />
                  <AccountBalanceWallet />
                  <CreditCard />
                </Box>
              </Box>
            </Paper>

            <Typography variant="body2" sx={{ p: 2, border: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1), borderRadius: 1, fontStyle: 'italic', color: 'grey.600', textAlign: 'center', fontSize: '0.875rem' }}>
              "A wise adventurer knows when to retreat and when to claim the prize."
              <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: 1 }}>— The Dungeon Master</Box>
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;