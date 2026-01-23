/// <reference lib="dom" />
import React, { useState, ChangeEvent } from 'react';
import { formatCurrency, formatCurrencyDecimal } from '../utils/currency';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  Paper,
  Stack,
  Chip,
  FormControl,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import {
  AutoStories,
  Create,
  CheckCircle,
  Settings,
  Close,
  Delete,
  UploadFile,
  ImageNotSupported,
  AddAPhoto,
  Group,
  AutoFixHigh,
  ReceiptLong,
  Inventory,
  LocalShipping,
  HourglassEmpty,
  CleaningServices,
  Handyman
} from '@mui/icons-material';
import { SectionHeader } from '../components/StyledComponents';
import { supabase } from '../src/supabase';
import { ViewState, Product, SubItem } from '../types';

interface AdminProps {
  onAddProduct: (product: Product) => void;
  setView: (view: ViewState) => void;
  categories: string[];
  scales: string[];
  onAddCategory: (cat: string) => void;
  onAddScale: (scale: string) => void;
  onDeleteCategory: (cat: string) => void;
  onDeleteScale: (scale: string) => void;
}

const Admin: React.FC<AdminProps> = ({
  onAddProduct,
  setView,
  categories,
  scales,
  onAddCategory,
  onAddScale,
  onDeleteCategory,
  onDeleteScale
}) => {
  const theme = useTheme();

  const [formData, setFormData] = useState({
    name: '',
    category: categories[0] || '',
    scale: scales[0] || '',
    price: '',
    image: '',
    description: '',
    badge: ''
  });

  const [subItems, setSubItems] = useState<SubItem[]>([]);
  const [newSubItem, setNewSubItem] = useState({ name: '', image: '' });

  const [showManageCat, setShowManageCat] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [showManageScale, setShowManageScale] = useState(false);
  const [newScale, setNewScale] = useState('');

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Orders State
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching orders:', error);
    else setAllOrders(data || []);
    setOrdersLoading(false);
  };

  React.useEffect(() => {
    if (currentTab === 1) {
      fetchOrders();
    }
  }, [currentTab]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert("Error al actualizar estado: " + error.message);
    } else {
      setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'image' && value.startsWith('http')) {
      setPreviewImage(value);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, target: 'main' | 'sub') => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const base64 = ev.target.result as string;
          if (target === 'main') {
            setPreviewImage(base64);
            setFormData(prev => ({ ...prev, image: base64 }));
          } else {
            setNewSubItem(prev => ({ ...prev, image: base64 }));
          }
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCreateCategory = () => {
    if (newCat.trim()) {
      onAddCategory(newCat.trim());
      setFormData(prev => ({ ...prev, category: newCat.trim() }));
      setNewCat('');
    }
  };

  const handleCreateScale = () => {
    if (newScale.trim()) {
      onAddScale(newScale.trim());
      setFormData(prev => ({ ...prev, scale: newScale.trim() }));
      setNewScale('');
    }
  };

  const addSubItem = () => {
    if (!newSubItem.name) return;
    const sub: SubItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: newSubItem.name,
      image: newSubItem.image || formData.image
    };
    setSubItems(prev => [...prev, sub]);
    setNewSubItem({ name: '', image: '' });
  };

  const removeSubItem = (id: string) => {
    setSubItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productToInsert = {
      name: formData.name,
      category: formData.category,
      scale: formData.scale,
      price: parseFloat(formData.price) || 0,
      image: formData.image || 'https://via.placeholder.com/400?text=No+Image',
      description: formData.description,
      badge: formData.badge || null,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productToInsert])
      .select();

    if (error) {
      console.error('Error inserting product:', error);
      setLoading(false);
      return;
    }

    if (data && data[0]) {
      onAddProduct(data[0] as Product);
      setSuccess(true);
      setFormData({
        name: '',
        category: categories[0] || '',
        scale: scales[0] || '',
        price: '',
        image: '',
        description: '',
        badge: ''
      });
      setSubItems([]);
      setPreviewImage(null);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <SectionHeader
        title="El Libro del Alto Supervisor"
        description="Forja nuevas leyendas en los archivos"
        icon={<AutoStories />}
        rightElement={
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setView(ViewState.CATALOG)}
            startIcon={<AutoStories />}
            sx={{ borderColor: (t) => alpha(t.palette.secondary.main, 0.3), color: 'secondary.main', '&:hover': { borderColor: 'secondary.main', bgcolor: (t) => alpha(t.palette.secondary.main, 0.1) } }}
          >
            Ver Catálogo
          </Button>
        }
      />

      <Box sx={{ mb: 4, borderBottom: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2) }}>
        <Tabs value={currentTab} onChange={(_e, v) => setCurrentTab(v)} textColor="secondary" indicatorColor="secondary">
          <Tab icon={<Inventory />} label="Forjar Artefactos" sx={{ fontWeight: 'bold', letterSpacing: 1 }} />
          <Tab icon={<ReceiptLong />} label="Gestión de Requisiciones" sx={{ fontWeight: 'bold', letterSpacing: 1 }} />
        </Tabs>
      </Box>

      {currentTab === 0 ? (
        <Grid container spacing={6}>
          {/* Form Section */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={4}>
              <Paper sx={{ p: 4, background: (theme) => `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.9)})`, border: 2, borderColor: 'accent.main', borderRadius: 2, position: 'relative', overflow: 'hidden', boxShadow: (theme) => `0 0 50px ${alpha(theme.palette.common.black, 0.5)}, inset 0 0 30px ${alpha(theme.palette.common.black, 0.2)}` }}>
                <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.1, pointerEvents: 'none' }}>
                  <Create sx={{ fontSize: 80, color: 'accent.main' }} />
                </Box>

                <Collapse in={success}>
                  <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3, bgcolor: (t) => alpha(t.palette.success.main, 0.1), border: 1, borderColor: 'success.main' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>El plano ha sido inscrito en los archivos.</Typography>
                  </Alert>
                </Collapse>

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth label="Nombre del Artefacto" name="name" required value={formData.name} onChange={handleInputChange} placeholder="ej. Guiverno Acecha-Sombras" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth label="Precio (GP)" name="price" type="number" required value={formData.price} onChange={handleInputChange} placeholder="45" helperText={formData.price ? `Equivalente: ${formatCurrency(parseFloat(formData.price) || 0)}` : ''} />
                    </Grid>

                    {/* Category */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ position: 'relative' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'secondary.main', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold' }}>Origen del Mundo</Typography>
                          <IconButton size="small" onClick={() => setShowManageCat(!showManageCat)} sx={{ color: 'secondary.main' }}>
                            {showManageCat ? <Close fontSize="small" /> : <Settings fontSize="small" />}
                          </IconButton>
                        </Box>
                        {showManageCat ? (
                          <Paper sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'secondary.main' }}>
                            <Typography variant="caption" sx={{ color: 'secondary.main', display: 'block', mb: 1, borderBottom: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2), pb: 1 }}>Gestionar Orígenes</Typography>
                            <List dense sx={{ maxHeight: 150, overflowY: 'auto', mb: 2 }}>
                              {categories.map(c => (
                                <ListItem key={c} sx={{ bgcolor: (t) => alpha(t.palette.common.black, 0.3), borderRadius: 1, mb: 0.5 }}>
                                  <ListItemText primary={c} primaryTypographyProps={{ variant: 'body2', color: 'grey.300' }} />
                                  <ListItemSecondaryAction>
                                    <IconButton edge="end" size="small" onClick={() => onDeleteCategory(c)} sx={{ color: 'grey.600', '&:hover': { color: 'error.main' } }}>
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              ))}
                            </List>
                            <Stack direction="row" spacing={1}>
                              <TextField size="small" fullWidth value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Nuevo Origen..." />
                              <Button variant="contained" color="secondary" onClick={handleCreateCategory} sx={{ fontWeight: 'bold' }}>Añadir</Button>
                            </Stack>
                          </Paper>
                        ) : (
                          <FormControl fullWidth size="small">
                            <Select name="category" value={formData.category} onChange={handleInputChange as any} sx={{ bgcolor: 'background.default', color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: (t: typeof theme) => alpha(t.palette.secondary.main, 0.3) }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' }, '& .MuiSvgIcon-root': { color: 'secondary.main' } }}>
                              {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                          </FormControl>
                        )}
                      </Box>
                    </Grid>

                    {/* Scale */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box sx={{ position: 'relative' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'secondary.main', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold' }}>Clase de Escala</Typography>
                          <IconButton size="small" onClick={() => setShowManageScale(!showManageScale)} sx={{ color: 'secondary.main' }}>
                            {showManageScale ? <Close fontSize="small" /> : <Settings fontSize="small" />}
                          </IconButton>
                        </Box>
                        {showManageScale ? (
                          <Paper sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'secondary.main' }}>
                            <Typography variant="caption" sx={{ color: 'secondary.main', display: 'block', mb: 1, borderBottom: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2), pb: 1 }}>Gestionar Clases de Escala</Typography>
                            <List dense sx={{ maxHeight: 150, overflowY: 'auto', mb: 2 }}>
                              {scales.map(s => (
                                <ListItem key={s} sx={{ bgcolor: (t) => alpha(t.palette.common.black, 0.3), borderRadius: 1, mb: 0.5 }}>
                                  <ListItemText primary={s} primaryTypographyProps={{ variant: 'body2', color: 'grey.300' }} />
                                  <ListItemSecondaryAction>
                                    <IconButton edge="end" size="small" onClick={() => onDeleteScale(s)} sx={{ color: 'grey.600', '&:hover': { color: 'error.main' } }}>
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              ))}
                            </List>
                            <Stack direction="row" spacing={1}>
                              <TextField size="small" fullWidth value={newScale} onChange={(e) => setNewScale(e.target.value)} placeholder="Nueva Escala..." />
                              <Button variant="contained" color="secondary" onClick={handleCreateScale} sx={{ fontWeight: 'bold' }}>Añadir</Button>
                            </Stack>
                          </Paper>
                        ) : (
                          <FormControl fullWidth size="small">
                            <Select name="scale" value={formData.scale} onChange={handleInputChange as any} sx={{ bgcolor: 'background.default', color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: (t: typeof theme) => alpha(t.palette.secondary.main, 0.3) }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'secondary.main' }, '& .MuiSvgIcon-root': { color: 'secondary.main' } }}>
                              {scales.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </Select>
                          </FormControl>
                        )}
                      </Box>
                    </Grid>

                    {/* Image */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" sx={{ color: 'secondary.main', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold', display: 'block', mb: 1 }}>Esencia Visual (Imagen Principal)</Typography>
                      <TextField fullWidth name="image" value={formData.image} onChange={handleInputChange} placeholder="Pega la URL o usa la carga de abajo..." sx={{ mb: 2 }} />
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" color="grey.600">o</Typography>
                        <Button component="label" variant="outlined" startIcon={<UploadFile />} sx={{ flex: 1, borderStyle: 'dashed', borderColor: (t) => alpha(t.palette.secondary.main, 0.4), color: 'secondary.main', '&:hover': { bgcolor: (t) => alpha(t.palette.secondary.main, 0.05) } }}>
                          Transcribir Imagen Local
                          <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'main')} />
                        </Button>
                      </Stack>
                    </Grid>

                    {/* Description */}
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth multiline rows={3} label="Lore del Artefacto" name="description" required value={formData.description} onChange={handleInputChange} placeholder="Inscribe la historia de esta pieza..." />
                    </Grid>

                    {/* Submit */}
                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 2 }} />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        startIcon={<AutoFixHigh />}
                        sx={{ py: 2, fontWeight: 'bold', letterSpacing: 4, border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2) }}
                      >
                        {loading ? 'Forjando...' : 'Forjar Producto Final'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>

              {/* Sub-Items */}
              <Paper sx={{ p: 4, bgcolor: (t) => alpha(t.palette.background.default, 0.8), border: 1, borderColor: (t) => alpha(t.palette.accent.main, 0.3), borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                  <Group sx={{ color: 'accent.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'common.white', textTransform: 'uppercase', letterSpacing: 2 }}>Composición de la Unidad (El Conjunto)</Typography>
                </Stack>
                <Paper sx={{ p: 2, bgcolor: (t) => alpha(t.palette.common.black, 0.3), border: 1, borderColor: (t) => alpha(t.palette.accent.main, 0.1), mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField size="small" fullWidth label="Nombre de la Sub-Unidad" value={newSubItem.name} onChange={(e) => setNewSubItem(prev => ({ ...prev, name: e.target.value }))} placeholder="ej. Arquero #1" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack direction="row" spacing={1}>
                        <TextField size="small" fullWidth label="Imagen Específica (Opcional)" value={newSubItem.image} onChange={(e) => setNewSubItem(prev => ({ ...prev, image: e.target.value }))} placeholder="URL..." />
                        <IconButton component="label" sx={{ bgcolor: (t) => alpha(t.palette.secondary.main, 0.1), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2), '&:hover': { bgcolor: (t) => alpha(t.palette.secondary.main, 0.2) } }}>
                          <AddAPhoto sx={{ color: 'secondary.main' }} />
                          <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'sub')} />
                        </IconButton>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button fullWidth variant="outlined" color="secondary" onClick={addSubItem} disabled={!newSubItem.name} sx={{ fontWeight: 'bold', letterSpacing: 2 }}>Añadir a la Composición</Button>
                    </Grid>
                  </Grid>
                </Paper>
                {subItems.length > 0 && (
                  <Stack spacing={1}>
                    {subItems.map((item, idx) => (
                      <Paper key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: (t) => alpha(t.palette.common.black, 0.4), border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.1) }}>
                        <Typography variant="caption" sx={{ color: (t) => alpha(t.palette.secondary.main, 0.4), fontFamily: 'monospace' }}>#{idx + 1}</Typography>
                        <Box sx={{ width: 40, height: 40, borderRadius: 1, overflow: 'hidden', border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2), flexShrink: 0 }}>
                          <Box component="img" src={item.image || formData.image} alt={item.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                        <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: 'grey.300' }}>{item.name}</Typography>
                        <IconButton size="small" onClick={() => removeSubItem(item.id)} sx={{ color: 'grey.600', '&:hover': { color: 'error.main' } }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Grid>

          {/* Preview */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'grey.600', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 'bold', mb: 2 }}>Manifestación Espectral</Typography>
              <Paper sx={{ p: 4, bgcolor: 'background.default', border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2), borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {previewImage ? (
                  <Box sx={{ width: '100%', aspectRatio: '1', border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.1), borderRadius: 1, overflow: 'hidden', mb: 3, boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
                    <Box component="img" src={previewImage} alt="Preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', aspectRatio: '1', border: 2, borderStyle: 'dashed', borderColor: (t) => alpha(t.palette.secondary.main, 0.1), borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'grey.700', mb: 3, bgcolor: (t) => alpha(t.palette.common.black, 0.2) }}>
                    <ImageNotSupported sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 2 }}>Esperando Entrada Visual</Typography>
                  </Box>
                )}
                <Typography variant="h5" sx={{ fontWeight: 'bold', fontStyle: 'italic', color: 'common.white', mb: 0.5, textAlign: 'center' }}>{formData.name || "Artefacto sin Nombre"}</Typography>
                <Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 'bold', mb: 2 }}>{formatCurrency(parseFloat(formData.price) || 0)}</Typography>
                <Stack direction="row" spacing={2} sx={{ color: 'grey.500', mb: 3 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold' }}>{formData.category}</Typography>
                  <Typography variant="caption">•</Typography>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 'bold' }}>Escala {formData.scale}</Typography>
                </Stack>
                <Divider sx={{ width: '100%', borderColor: (t) => alpha(t.palette.secondary.main, 0.2), my: 2 }} />
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'grey.500', textAlign: 'center', px: 2 }}>
                  {formData.description || "La historia de esta pieza aún está por escribirse..."}
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Box>
          {ordersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: (t) => alpha(t.palette.secondary.main, 0.2), boxShadow: 6 }}>
              <Table>
                <TableHead sx={{ bgcolor: (t) => alpha(t.palette.common.black, 0.3) }}>
                  <TableRow>
                    <TableCell sx={{ color: 'secondary.main', fontWeight: 'bold' }}>Pacto</TableCell>
                    <TableCell sx={{ color: 'secondary.main', fontWeight: 'bold' }}>Aventurero</TableCell>
                    <TableCell sx={{ color: 'secondary.main', fontWeight: 'bold' }}>Items</TableCell>
                    <TableCell sx={{ color: 'secondary.main', fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell sx={{ color: 'secondary.main', fontWeight: 'bold' }}>Estado de la Forja</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allOrders.map((order) => (
                    <TableRow key={order.id} sx={{ '&:hover': { bgcolor: (t) => alpha(t.palette.common.white, 0.05) } }}>
                      <TableCell sx={{ color: 'grey.300', fontFamily: 'monospace' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>#{order.id.slice(0, 8)}</Typography>
                        <Typography variant="caption" sx={{ color: 'grey.600' }}>{new Date(order.created_at).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: 'grey.400' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'common.white' }}>{order.phone}</Typography>
                        <Typography variant="caption" sx={{ color: 'grey.600' }}>ID: {order.user_id?.slice(0, 8) || 'GUEST'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          {order.order_items?.map((item: any, i: number) => (
                            <Typography key={i} variant="caption" sx={{ color: 'grey.500', display: 'block' }}>
                              • {item.quantity}x {item.name}
                            </Typography>
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                        {formatCurrencyDecimal(order.total_gp)}
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            sx={{
                              height: 32,
                              fontSize: '0.75rem',
                              bgcolor: (theme) => {
                                switch (order.status) {
                                  case 'Enviado': return alpha(theme.palette.success.main, 0.1);
                                  case 'En la Forja': return alpha(theme.palette.warning.main, 0.1);
                                  case 'Limpieza y Curado': return alpha(theme.palette.info.main, 0.1);
                                  case 'Recibido': return alpha(theme.palette.grey[500], 0.1);
                                  case 'Cancelado': return alpha(theme.palette.error.main, 0.1);
                                  default: return 'transparent';
                                }
                              }
                            }}
                          >
                            <MenuItem value="Recibido"><HourglassEmpty sx={{ fontSize: 16, mr: 1 }} /> Recibido</MenuItem>
                            <MenuItem value="En la Forja"><Handyman sx={{ fontSize: 16, mr: 1 }} /> En la Forja</MenuItem>
                            <MenuItem value="Limpieza y Curado"><CleaningServices sx={{ fontSize: 16, mr: 1 }} /> Limpieza y Curado</MenuItem>
                            <MenuItem value="Enviado"><LocalShipping sx={{ fontSize: 16, mr: 1 }} /> Enviado</MenuItem>
                            <MenuItem value="Cancelado"><Close sx={{ fontSize: 16, mr: 1 }} /> Cancelado</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                  {allOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: 'grey.600', fontStyle: 'italic' }}>
                        No hay requisiciones inscritas en el libro.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Admin;