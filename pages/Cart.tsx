import { useCart } from '../context/CartContext';
import { ViewState } from '../types';
import { formatCurrency, formatCurrencyDecimal } from '../utils/currency';
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
        title="Revisa tu Botín"
        description="El tesoro ha sido reunido. Asegúralo antes de que la mazmorra se colapse."
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
                El Botín
              </Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic', color: (theme) => alpha(theme.palette.secondary.main, 0.4) }}>
                {items.length} objetos encontrados
              </Typography>
            </Box>

            {items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, bgcolor: { xs: (theme) => alpha(theme.palette.common.black, 0.2), sm: 'transparent' }, borderRadius: 1 }}>
                <Typography color="grey.500" fontStyle="italic">Tu tesoro está vacío.</Typography>
                <Button onClick={() => setView(ViewState.CATALOG)} sx={{ mt: 2, textDecoration: 'underline', color: 'secondary.main', '&:hover': { color: 'common.white' } }}>
                  Volver a los Archivos
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
                            {formatCurrency(item.price * item.quantity)}
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
                          Descartar
                        </Button>
                      </Box>
                    </Box>

                    {!isMobile && (
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                          {formatCurrencyDecimal(item.price * item.quantity)}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}

            <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2), display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1, color: (theme) => alpha(theme.palette.secondary.main, 0.5), fontStyle: 'italic', textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="caption">Tu inventario está protegido por guardas mágicas.</Typography>
              <Typography variant="caption">Peso Total: 12.4 lbs</Typography>
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
                Resumen del Tesoro
              </Typography>

              <Stack spacing={2} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold', minWidth: '120px' }}>Subtotal</Typography>
                  <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrencyDecimal(totalPrice)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold', minWidth: '120px' }}>Tarifa Portal</Typography>
                  <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrencyDecimal(shipping)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 2, borderBottom: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1) }}>
                  <Typography variant="body2" sx={{ color: 'grey.500', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold', minWidth: '120px' }}>Impuestos</Typography>
                  <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrencyDecimal(taxes)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, mt: 1, borderTop: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2) }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontStyle: 'italic', color: 'common.white', textTransform: 'uppercase', letterSpacing: 2 }}>Total</Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main', lineHeight: 1 }}>{formatCurrencyDecimal(grandTotal)}</Typography>
                    <Typography variant="caption" sx={{ color: (theme) => alpha(theme.palette.secondary.main, 0.4), textTransform: 'uppercase', fontSize: '0.6rem', display: 'block', mt: 0.5 }}>Equivalente en Oro</Typography>
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
                Proceder al Pago Seguro
              </Button>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                <Divider flexItem sx={{ borderColor: (theme) => alpha(theme.palette.secondary.main, 0.3), width: '100%' }} />
                <Typography variant="caption" sx={{ color: 'grey.600', textTransform: 'uppercase', letterSpacing: 1 }}>Monedas Aceptadas</Typography>
                <Box sx={{ display: 'flex', gap: 2, opacity: 0.5, color: 'common.white' }}>
                  <Payments />
                  <AccountBalanceWallet />
                  <CreditCard />
                </Box>
              </Box>
            </Paper>

            <Typography variant="body2" sx={{ p: 2, border: 1, borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1), borderRadius: 1, fontStyle: 'italic', color: 'grey.600', textAlign: 'center', fontSize: '0.875rem' }}>
              "Un aventurero sabio sabe cuándo retirarse y cuándo reclamar el premio."
              <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: 1 }}>— El Dungeon Master</Box>
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;