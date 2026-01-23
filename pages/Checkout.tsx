import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency, formatCurrencyDecimal } from '../utils/currency';
import { supabase } from '../src/supabase';
import { User } from '@supabase/supabase-js';
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
  useTheme,
  Chip,
  Collapse,
  IconButton
} from '@mui/material';
import { Pentagon, AutoFixHigh, Payments, CreditCard, Policy, LocationOn, Delete, Add, ExpandMore, ExpandLess } from '@mui/icons-material';
import { DecorativeCorners } from '../components/StyledComponents';
import { playSuccessSound } from '../utils/sounds';

interface SavedAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  realm: string;
  phone: string;
  is_default: boolean;
}

const Checkout: React.FC = () => {
  const theme = useTheme();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    realm: 'north',
    address: '',
    city: '',
    zip: '',
    phone: '',
    delivery: 'standard'
  });

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  const [addressName, setAddressName] = useState('');

  useEffect(() => {
    const initCheckout = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          name: session.user.user_metadata.full_name || '',
        }));

        // Load saved addresses
        const { data: addresses } = await supabase
          .from('saved_addresses')
          .select('*')
          .eq('user_id', session.user.id)
          .order('is_default', { ascending: false });

        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);
          // Auto-fill with default address
          const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
          if (defaultAddr) {
            setFormData(prev => ({
              ...prev,
              name: defaultAddr.name,
              address: defaultAddr.address,
              city: defaultAddr.city,
              zip: defaultAddr.zip,
              realm: defaultAddr.realm,
              phone: defaultAddr.phone,
            }));
          }
        }
      }
    };
    initCheckout();
  }, []);

  const selectSavedAddress = (addr: SavedAddress) => {
    setFormData(prev => ({
      ...prev,
      name: addr.name,
      address: addr.address,
      city: addr.city,
      zip: addr.zip,
      realm: addr.realm,
      phone: addr.phone,
    }));
    setShowSavedAddresses(false);
  };

  const deleteSavedAddress = async (id: string) => {
    await supabase.from('saved_addresses').delete().eq('id', id);
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
  };

  const saveCurrentAddress = async () => {
    if (!user || !addressName.trim()) return;

    const newAddress = {
      user_id: user.id,
      name: formData.name,
      address: formData.address,
      city: formData.city,
      zip: formData.zip,
      realm: formData.realm,
      phone: formData.phone,
      is_default: savedAddresses.length === 0,
      label: addressName.trim()
    };

    const { data, error } = await supabase
      .from('saved_addresses')
      .insert(newAddress)
      .select()
      .single();

    if (!error && data) {
      setSavedAddresses(prev => [...prev, data]);
      setSaveThisAddress(false);
      setAddressName('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, delivery: e.target.value }));
  };

  const shippingCost = formData.delivery === 'express' ? 25.00 : 5.00;
  const grandTotal = totalPrice + 12.50 + shippingCost;

  const handleWhatsAppCheckout = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      alert("Por favor completa los campos obligatorios para sellar el pacto.");
      return;
    }

    setLoading(true);
    try {
      // 1. Guardar el pedido en Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id,
          total_gp: grandTotal,
          total_ars: grandTotal * 1000,
          shipping_address: `${formData.address}, ${formData.city} (${formData.zip}), ${formData.realm}`,
          shipping_method: formData.delivery === 'express' ? 'Expreso Griffon' : 'Caravana Estándar',
          phone: formData.phone,
          status: 'Recibido'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Guardar los items del pedido
      const itemsToInsert = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price_gp: item.price,
        image: item.image
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Generar mensaje de WhatsApp
      const WHATSAPP_NUMBER = '543815621699';
      let message = `*📜 NUEVA REQUISICIÓN EN RESINFORGE*\n`;
      message += `ID DE PACTO: ${orderData.id.slice(0, 8)}\n\n`;
      message += `*I. DETALLES DEL AVENTURERO*\n`;
      message += `👤 Nombre: ${formData.name}\n`;
      message += `📍 Reino: ${formData.realm}\n`;
      message += `🏰 Dirección: ${formData.address}, ${formData.city} (${formData.zip})\n`;
      message += `📞 Contacto: ${formData.phone}\n`;
      message += `📦 Método: ${formData.delivery === 'express' ? 'Expreso Griffon' : 'Caravana Estándar'}\n\n`;

      message += `*II. DETALLE DEL BOTÍN*\n`;
      items.forEach(item => {
        message += `- ${item.quantity}x ${item.name} (${formatCurrency(item.price * item.quantity)})\n`;
      });

      message += `\n*III. TRIBUTO FINAL*\n`;
      message += `💰 *Total General: ${formatCurrencyDecimal(grandTotal)}*\n\n`;
      message += `_Este pacto ha sido sellado en los registros mágicos de ResinForge._`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

      // 4. Play success sound, limpiar y redirigir
      playSuccessSound();
      clearCart();
      window.open(whatsappUrl, '_blank');
    } catch (error: any) {
      console.error('Error al sellar el pacto:', error);
      alert(`Error al guardar el pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={6}>
        {/* Form Section */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={6}>
            {/* Header */}
            <Box sx={{ borderBottom: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.3), pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', fontStyle: 'italic', color: 'secondary.main' }}>El Pacto del Mercader</Typography>
              <Typography variant="caption" sx={{ color: (t) => alpha(t.palette.common.white, 0.5), textTransform: 'uppercase', letterSpacing: 3 }}>Contrato #RF-2024-0892</Typography>
            </Box>

            {/* Shipping Section */}
            <Box component="section">
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Pentagon sx={{ fontSize: 36, color: 'secondary.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'common.white' }}>I. Sigilo de Envío</Typography>
                </Stack>
                {user && savedAddresses.length > 0 && (
                  <Button
                    size="small"
                    startIcon={<LocationOn />}
                    endIcon={showSavedAddresses ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                    sx={{ color: 'secondary.main', textTransform: 'none' }}
                  >
                    Fortalezas Guardadas ({savedAddresses.length})
                  </Button>
                )}
              </Stack>

              {/* Saved Addresses Dropdown */}
              <Collapse in={showSavedAddresses}>
                <Paper sx={{ p: 2, mb: 3, bgcolor: (t) => alpha(t.palette.background.paper, 0.5), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2) }}>
                  <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 2 }}>
                    Selecciona una fortaleza guardada
                  </Typography>
                  <Stack spacing={1}>
                    {savedAddresses.map(addr => (
                      <Paper
                        key={addr.id}
                        onClick={() => selectSavedAddress(addr)}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          bgcolor: (t) => alpha(t.palette.common.black, 0.2),
                          border: 1,
                          borderColor: 'transparent',
                          '&:hover': { borderColor: 'secondary.main', bgcolor: (t) => alpha(t.palette.secondary.main, 0.1) },
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'common.white' }}>{addr.name}</Typography>
                            {addr.is_default && <Chip label="Principal" size="small" color="secondary" sx={{ height: 20, fontSize: '0.6rem' }} />}
                          </Stack>
                          <Typography variant="caption" color="grey.500">{addr.address}, {addr.city}</Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); deleteSavedAddress(addr.id); }}
                          sx={{ color: 'grey.600', '&:hover': { color: 'error.main' } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Collapse>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth name="name" value={formData.name} onChange={handleInputChange} label="Nombre del Destinatario" placeholder="Galdor el Veloz" required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth name="phone" value={formData.phone} onChange={handleInputChange} label="Contacto (Teléfono)" placeholder="+54 9 11 ..." required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <TextField select name="realm" value={formData.realm} onChange={handleInputChange} label="Reino / País">
                      <MenuItem value="north">Los Reinos del Norte</MenuItem>
                      <MenuItem value="shadow">Enclaves de Shadowfell</MenuItem>
                      <MenuItem value="iron">Imperio de las Colinas de Hierro</MenuItem>
                    </TextField>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth name="address" value={formData.address} onChange={handleInputChange} label="Dirección de la Fortaleza" placeholder="12 Citadel Row, Distrito de la Torre" required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth name="city" value={formData.city} onChange={handleInputChange} label="Ciudad / Ciudadela" placeholder="Waterdeep" required />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth name="zip" value={formData.zip} onChange={handleInputChange} label="Código de Cuervo (Zip)" placeholder="90210" required />
                </Grid>

                {/* Save Address Option */}
                {user && (
                  <Grid size={{ xs: 12 }}>
                    <Collapse in={!saveThisAddress}>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={() => setSaveThisAddress(true)}
                        sx={{ color: 'grey.500', textTransform: 'none', '&:hover': { color: 'secondary.main' } }}
                      >
                        Guardar esta fortaleza para futuras requisiciones
                      </Button>
                    </Collapse>
                    <Collapse in={saveThisAddress}>
                      <Paper sx={{ p: 2, bgcolor: (t) => alpha(t.palette.secondary.main, 0.05), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2) }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Nombre para esta fortaleza (ej: Casa, Trabajo)"
                            value={addressName}
                            onChange={(e) => setAddressName(e.target.value)}
                          />
                          <Button variant="contained" color="secondary" size="small" onClick={saveCurrentAddress} disabled={!addressName.trim()} sx={{ whiteSpace: 'nowrap' }}>
                            Guardar
                          </Button>
                          <IconButton size="small" onClick={() => setSaveThisAddress(false)} sx={{ color: 'grey.500' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    </Collapse>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Delivery Method */}
            <Box component="section">
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <AutoFixHigh sx={{ fontSize: 36, color: 'secondary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'common.white' }}>II. Ritual de Entrega</Typography>
              </Stack>
              <RadioGroup name="delivery" value={formData.delivery} onChange={handleDeliveryChange}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.3), bgcolor: (t) => alpha(t.palette.background.paper, 0.5), cursor: 'pointer', '&:has(input:checked)': { borderColor: 'secondary.main', bgcolor: (t) => alpha(t.palette.secondary.main, 0.1) } }}>
                      <FormControlLabel value="standard" control={<Radio sx={{ color: 'secondary.main', '&.Mui-checked': { color: 'secondary.main' } }} />} label={
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'common.white' }}>Caravana Estándar</Typography>
                            <Typography variant="body2" sx={{ color: 'secondary.main' }}>5 Oro</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: (t) => alpha(t.palette.common.white, 0.6), fontStyle: 'italic' }}>Llega en 7-10 ciclos lunares. Paso seguro garantizado.</Typography>
                        </Box>
                      } sx={{ m: 0, width: '100%', alignItems: 'flex-start' }} />
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.3), bgcolor: (t) => alpha(t.palette.background.paper, 0.5), cursor: 'pointer', '&:has(input:checked)': { borderColor: 'secondary.main', bgcolor: (t) => alpha(t.palette.secondary.main, 0.1) } }}>
                      <FormControlLabel value="express" control={<Radio sx={{ color: 'secondary.main', '&.Mui-checked': { color: 'secondary.main' } }} />} label={
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'common.white' }}>Expreso Griffon</Typography>
                            <Typography variant="body2" sx={{ color: 'secondary.main' }}>25 Oro</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ color: (t) => alpha(t.palette.common.white, 0.6), fontStyle: 'italic' }}>Entrega aérea en 2 ciclos. Manejo prioritario.</Typography>
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
                <Typography variant="h5" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'common.white' }}>III. Pago (Gestionado vía Chat)</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic' }}>
                Los rituales tradicionales de transferencia de oro se gestionan actualmente a través de un diálogo encriptado de WhatsApp. Por favor, procede al siguiente paso.
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Sidebar / Ledger */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            <Paper sx={{ p: 4, border: 2, borderColor: 'secondary.main', bgcolor: 'background.paper', position: 'relative', boxShadow: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 3, textAlign: 'center', borderBottom: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.3), pb: 2, mb: 4, color: 'common.white' }}>Libro de Inventario</Typography>

              <Stack spacing={3} sx={{ maxHeight: 400, overflowY: 'auto', pr: 1, mb: 4 }}>
                {items.map(item => (
                  <Stack key={item.id} direction="row" spacing={2}>
                    <Box sx={{ width: 64, height: 64, bgcolor: (t) => alpha(t.palette.common.black, 0.4), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2), borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
                      <Box component="img" src={item.image} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'common.white', lineHeight: 1.2 }}>{item.name}</Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: (t) => alpha(t.palette.common.white, 0.6) }}>Cant: {item.quantity}</Typography>
                        <Typography variant="body2" sx={{ color: 'secondary.main' }}>{formatCurrency(item.price * item.quantity)}</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ borderColor: (t) => alpha(t.palette.secondary.main, 0.3), my: 3 }} />

              <Stack spacing={1.5} sx={{ color: 'common.white' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="body2" sx={{ opacity: 0.6, fontStyle: 'italic', minWidth: '100px' }}>Subtotal</Typography>
                  <Typography variant="body2" sx={{ textAlign: 'right' }}>{formatCurrencyDecimal(totalPrice)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="body2" sx={{ opacity: 0.6, fontStyle: 'italic', minWidth: '100px' }}>Diezmos</Typography>
                  <Typography variant="body2" sx={{ textAlign: 'right' }}>{formatCurrencyDecimal(12.50)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="body2" sx={{ opacity: 0.6, fontStyle: 'italic', minWidth: '100px' }}>Sello de Envío</Typography>
                  <Typography variant="body2" sx={{ textAlign: 'right' }}>{formatCurrencyDecimal(shippingCost)}</Typography>
                </Stack>
                <Divider sx={{ borderColor: (t) => alpha(t.palette.secondary.main, 0.2), my: 1 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'secondary.main', textTransform: 'uppercase', letterSpacing: 2 }}>Total</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main', textAlign: 'right' }}>{formatCurrencyDecimal(grandTotal)}</Typography>
                </Stack>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleWhatsAppCheckout}
                disabled={loading || items.length === 0}
                startIcon={loading ? null : <AutoFixHigh sx={{ fontSize: 28 }} />}
                sx={{ mt: 5, py: 2, fontWeight: 'bold', letterSpacing: 4, boxShadow: 4, bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
              >
                {loading ? 'SELLANDO EL PACTO...' : 'ENVIAR PACTO VÍA WHATSAPP'}
              </Button>

              <Typography variant="caption" sx={{ display: 'block', mt: 3, textAlign: 'center', opacity: 0.4, textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1.6, color: 'common.white' }}>
                Al sellar este pacto, aceptas el pergamino de leyes del mercader y el arbitraje vinculante de sangre del Maestro de la Forja.
              </Typography>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;