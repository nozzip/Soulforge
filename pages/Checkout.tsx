import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Paper,
  Stack,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  alpha,
  useTheme
} from '@mui/material';
import { Pentagon, AutoFixHigh, Payments, CreditCard, Policy } from '@mui/icons-material';
import { DecorativeCorners } from '../components/StyledComponents';

const Checkout: React.FC = () => {
  const theme = useTheme();
  const { items, totalPrice } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    realm: 'north',
    address: '',
    city: '',
    zip: '',
    delivery: 'standard'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, delivery: e.target.value }));
  };

  const shippingCost = formData.delivery === 'express' ? 25.00 : 5.00;
  const grandTotal = totalPrice + 12.50 + shippingCost;

  const handleWhatsAppCheckout = () => {
    const WHATSAPP_NUMBER = '543815621699';

    let message = `*📜 NEW REQUISITION AT RESINFORGE*\n\n`;
    message += `*I. ADVENTURER DETAILS*\n`;
    message += `👤 Name: ${formData.name || 'Anonymous'}\n`;
    message += `📍 Realm: ${formData.realm}\n`;
    message += `🏰 Address: ${formData.address}, ${formData.city} (${formData.zip})\n`;
    message += `📦 Method: ${formData.delivery === 'express' ? 'Griffon Express' : 'Standard Caravan'}\n\n`;

    message += `*II. INVENTORY LIST*\n`;
    items.forEach(item => {
      message += `- ${item.quantity}x ${item.name} [ID: ${item.id}] (${(item.price * item.quantity).toFixed(0)} GP)\n`;
    });

    message += `\n*III. FINAL TRIBUTE*\n`;
    message += `💰 *Grand Total: ${grandTotal.toFixed(2)} GP*\n\n`;
    message += `_This pact is awaiting your confirmation, Master Smith._`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={6}>
        {/* Form Section */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={6}>
            {/* Header */}
            <Box sx={{ borderBottom: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.3), pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', fontStyle: 'italic', color: 'secondary.main' }}>The Merchant's Pact</Typography>
              <Typography variant="caption" sx={{ color: (t) => alpha(t.palette.common.white, 0.5), textTransform: 'uppercase', letterSpacing: 3 }}>Contract #RF-2024-0892</Typography>
            </Box>

            {/* Shipping Section */}
            <Box component="section">
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Pentagon sx={{ fontSize: 36, color: 'secondary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'common.white' }}>I. Shipping Sigil</Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth name="name" value={formData.name} onChange={handleInputChange} label="Consignee Name" placeholder="Galdor the Swift" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <TextField select name="realm" value={formData.realm} onChange={handleInputChange} label="Realm / Country">
                      <MenuItem value="north">The Northern Realms</MenuItem>
                      <MenuItem value="shadow">Shadowfell Enclaves</MenuItem>
                      <MenuItem value="iron">Iron Hills Empire</MenuItem>
                    </TextField>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth name="address" value={formData.address} onChange={handleInputChange} label="Stronghold Address" placeholder="12 Citadel Row, Tower District" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth name="city" value={formData.city} onChange={handleInputChange} label="Citadel / City" placeholder="Waterdeep" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth name="zip" value={formData.zip} onChange={handleInputChange} label="Raven Code (Zip)" placeholder="90210" />
                </Grid>
              </Grid>
            </Box>

            {/* Delivery Method */}
            <Box component="section">
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <AutoFixHigh sx={{ fontSize: 36, color: 'secondary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'common.white' }}>II. Delivery Ritual</Typography>
              </Stack>
              <RadioGroup name="delivery" value={formData.delivery} onChange={handleDeliveryChange}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.3), bgcolor: (t) => alpha(t.palette.background.paper, 0.5), cursor: 'pointer', '&:has(input:checked)': { borderColor: 'secondary.main', bgcolor: (t) => alpha(t.palette.secondary.main, 0.1) } }}>
                      <FormControlLabel value="standard" control={<Radio sx={{ color: 'secondary.main', '&.Mui-checked': { color: 'secondary.main' } }} />} label={
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'common.white' }}>Standard Caravan</Typography>
                            <Typography variant="body2" sx={{ color: 'secondary.main' }}>5 Gold</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: (t) => alpha(t.palette.common.white, 0.6), fontStyle: 'italic' }}>Arrives in 7-10 lunar cycles. Safe passage guaranteed.</Typography>
                        </Box>
                      } sx={{ m: 0, width: '100%', alignItems: 'flex-start' }} />
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.3), bgcolor: (t) => alpha(t.palette.background.paper, 0.5), cursor: 'pointer', '&:has(input:checked)': { borderColor: 'secondary.main', bgcolor: (t) => alpha(t.palette.secondary.main, 0.1) } }}>
                      <FormControlLabel value="express" control={<Radio sx={{ color: 'secondary.main', '&.Mui-checked': { color: 'secondary.main' } }} />} label={
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'common.white' }}>Griffon Express</Typography>
                            <Typography variant="body2" sx={{ color: 'secondary.main' }}>25 Gold</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: (t) => alpha(t.palette.common.white, 0.6), fontStyle: 'italic' }}>Airborne delivery within 2 cycles. Priority handling.</Typography>
                        </Box>
                      } sx={{ m: 0, width: '100%', alignItems: 'flex-start' }} />
                    </Paper>
                  </Grid>
                </Grid>
              </RadioGroup>
            </Box>

            {/* Payment (Disabled/Informational for WhatsApp flow) */}
            <Box component="section" sx={{ opacity: 0.6 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Payments sx={{ fontSize: 36, color: 'secondary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'common.white' }}>III. Payment (Handled via Chat)</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic' }}>
                Traditional gold-transfer rituals are currently handled via encrypted WhatsApp dialogue. Please proceed to the next step.
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Sidebar / Ledger */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            <Paper sx={{ p: 4, border: 2, borderColor: 'secondary.main', bgcolor: 'background.paper', position: 'relative', boxShadow: 6 }}>
              <DecorativeCorners thickness={2} size={24} />

              <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 3, textAlign: 'center', borderBottom: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.3), pb: 2, mb: 4, color: 'common.white' }}>Inventory Ledger</Typography>

              <Stack spacing={3} sx={{ maxHeight: 400, overflowY: 'auto', pr: 1, mb: 4 }}>
                {items.map(item => (
                  <Stack key={item.id} direction="row" spacing={2}>
                    <Box sx={{ width: 64, height: 64, bgcolor: (t) => alpha(t.palette.common.black, 0.4), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2), borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
                      <Box component="img" src={item.image} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'common.white', lineHeight: 1.2 }}>{item.name}</Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: (t) => alpha(t.palette.common.white, 0.6) }}>Qty: {item.quantity}</Typography>
                        <Typography variant="body2" sx={{ color: 'secondary.main' }}>{(item.price * item.quantity).toFixed(0)} GP</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ borderColor: (t) => alpha(t.palette.secondary.main, 0.3), my: 3 }} />

              <Stack spacing={1.5} sx={{ color: 'common.white' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ opacity: 0.6, fontStyle: 'italic' }}>Subtotal</Typography>
                  <Typography variant="body2">{totalPrice.toFixed(2)} GP</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ opacity: 0.6, fontStyle: 'italic' }}>Taxes & Tithes</Typography>
                  <Typography variant="body2">12.50 GP</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ opacity: 0.6, fontStyle: 'italic' }}>Ritual Shipping</Typography>
                  <Typography variant="body2">{shippingCost.toFixed(2)} GP</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>Grand Tribute</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>{grandTotal.toFixed(2)} GP</Typography>
                </Stack>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleWhatsAppCheckout}
                startIcon={<AutoFixHigh sx={{ fontSize: 28 }} />}
                sx={{ mt: 5, py: 2, fontWeight: 'bold', letterSpacing: 4, boxShadow: 4, bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
              >
                Send via WhatsApp
              </Button>

              <Typography variant="caption" sx={{ display: 'block', mt: 3, textAlign: 'center', opacity: 0.4, textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1.6, color: 'common.white' }}>
                By sealing this pact, you agree to the merchant's scroll of laws and the blood-binding arbitration of the Forge-Master.
              </Typography>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;