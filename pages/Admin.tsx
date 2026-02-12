/// <reference lib="dom" />
import React, { useState, ChangeEvent } from "react";
import { formatCurrency, formatCurrencyDecimal } from "../utils/currency.tsx";
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
  CircularProgress,
} from "@mui/material";
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
  Handyman,
  RateReview,
  DeleteForever,
  Search,
  FilterList,
  ContentCopy,
  SentimentVerySatisfied,
  WhatsApp,
  Print,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { SectionHeader } from "../components/StyledComponents";
import { supabase } from "../src/supabase";
import { ViewState, Product, SubItem } from "../types";

interface AdminProps {
  onAddProduct: (product: Product) => void;
  setView: (view: ViewState) => void;
  categories: string[];
  sizes: string[];
  onAddCategory: (cat: string) => void;
  onAddSize: (size: string) => void;
  onDeleteCategory: (cat: string) => void;
  onDeleteSize: (size: string) => void;
}

const Admin: React.FC<AdminProps> = ({
  onAddProduct,
  setView,
  categories,
  sizes,
  onAddCategory,
  onAddSize,
  onDeleteCategory,
  onDeleteSize,
}) => {
  const theme = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    category: categories[0] || "",
    size: sizes[0] || "",
    price: "",
    image: "",
    description: "",
  });

  const [subItems, setSubItems] = useState<SubItem[]>([]);
  const [newSubItem, setNewSubItem] = useState({ name: "", image: "" });

  const [showManageCat, setShowManageCat] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [showManageSize, setShowManageSize] = useState(false);
  const [newSize, setNewSize] = useState("");

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Orders State
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Reviews State
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [generatedLink, setGeneratedLink] = useState("");

  const handleGenerateLink = async () => {
    try {
      const { data, error } = await supabase.rpc("generate_review_link");
      if (error) throw error;
      if (data) {
        setGeneratedLink(`${window.location.origin}/feedback?token=${data}`);
      }
    } catch (e: any) {
      console.error(e);
      alert("Error al generar enlace: " + e.message);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Enlace copiado al portapapeles");
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (
      !confirm(
        "¿Estás seguro de romper este pacto? Esta acción es irreversible y eliminará todos los registros asociados.",
      )
    )
      return;

    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      console.error("Error deleting order:", error);
      alert("Error al romper el pacto: " + error.message);
    } else {
      setAllOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching orders:", error);
    else setAllOrders(data || []);
    setOrdersLoading(false);
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*, products(name, category)")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching reviews:", error);
    else setAllReviews(data || []);
    setReviewsLoading(false);
  };

  React.useEffect(() => {
    if (currentTab === 1) {
      fetchOrders();
    } else if (currentTab === 2) {
      fetchReviews();
    }
  }, [currentTab]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Error al actualizar estado: " + error.message);
    } else {
      setAllOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    }
  };

  const handleUpdateAdminNotes = async (orderId: string, notes: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ admin_notes: notes })
      .eq("id", orderId);

    if (error) {
      alert("Error al guardar notas: " + error.message);
    } else {
      setAllOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, admin_notes: notes } : o)),
      );
    }
  };

  const handleSendWhatsApp = (order: any) => {
    const itemsList = order.order_items
      ?.map((item: any) => `${item.quantity}x ${item.name}`)
      .join("\n");

    const message =
      `*Pedido #${order.contract_number || order.id.slice(0, 8)}*\n\n` +
      `*Cliente:* ${order.customer_name}\n` +
      `*Total:* ${formatCurrencyDecimal(order.total_gp)}\n` +
      `*Estado:* ${order.status}\n\n` +
      `*Items:*\n${itemsList}\n\n` +
      `*Dirección:* ${order.shipping_address}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${order.customer_phone?.replace(/\D/g, "")}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePrintOrder = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const itemsHtml = order.order_items
      ?.map(
        (item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
          <img src="${item.image_url || "https://via.placeholder.com/50"}" style="width: 50px; height: 50px; object-fit: cover;" />
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrencyDecimal(item.unit_price || 0)}</td>
      </tr>
    `,
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Pedido #${order.contract_number || order.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f5f5f5; padding: 10px; text-align: left; }
            .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Pedido #${order.contract_number || order.id.slice(0, 8)}</h1>

          <div class="section">
            <p><span class="label">Cliente:</span> ${order.customer_name}</p>
            <p><span class="label">Email:</span> ${order.customer_email}</p>
            <p><span class="label">Teléfono:</span> ${order.customer_phone}</p>
            <p><span class="label">DNI:</span> ${order.customer_dni || "N/A"}</p>
          </div>

          <div class="section">
            <p><span class="label">Dirección de envío:</span></p>
            <p>${order.shipping_address}</p>
          </div>

          <div class="section">
            <p><span class="label">Fecha:</span> ${new Date(order.created_at).toLocaleString()}</p>
            <p><span class="label">Estado:</span> ${order.status}</p>
          </div>

          <div class="section">
            <p><span class="label">Items:</span></p>
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: right;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="total">
            Total: ${formatCurrencyDecimal(order.total_gp)}
          </div>

          ${
            order.admin_notes
              ? `
            <div class="section" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
              <p><span class="label">Notas Admin:</span></p>
              <p>${order.admin_notes}</p>
            </div>
          `
              : ""
          }
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar esta crónica? Esta acción es permanente.",
      )
    )
      return;

    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("Error deleting review:", error);
      alert("Error al eliminar la crónica.");
    } else {
      setAllReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  };

  const handleRemoveReviewImage = async (reviewId: string) => {
    if (!confirm("¿Estás seguro de eliminar la imagen de esta crónica?"))
      return;

    const { error } = await supabase
      .from("product_reviews")
      .update({ image: null })
      .eq("id", reviewId);

    if (error) {
      console.error("Error removing review image:", error);
      alert("Error al eliminar la imagen.");
    } else {
      setAllReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, image: null } : r)),
      );
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "image" && value.startsWith("http")) {
      setPreviewImage(value);
    }
  };

  const handleFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    target: "main" | "sub",
  ) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const base64 = ev.target.result as string;
          if (target === "main") {
            setPreviewImage(base64);
            setFormData((prev) => ({ ...prev, image: base64 }));
          } else {
            setNewSubItem((prev) => ({ ...prev, image: base64 }));
          }
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCreateCategory = () => {
    if (newCat.trim()) {
      onAddCategory(newCat.trim());
      setFormData((prev) => ({ ...prev, category: newCat.trim() }));
      setNewCat("");
    }
  };

  const handleCreateSize = () => {
    if (newSize.trim()) {
      onAddSize(newSize.trim());
      setFormData((prev) => ({ ...prev, size: newSize.trim() }));
      setNewSize("");
    }
  };

  const addSubItem = () => {
    if (!newSubItem.name) return;
    const sub: SubItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: newSubItem.name,
      image: newSubItem.image || formData.image,
    };
    setSubItems((prev) => [...prev, sub]);
    setNewSubItem({ name: "", image: "" });
  };

  const removeSubItem = (id: string) => {
    setSubItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productToInsert = {
      name: formData.name,
      category: formData.category,
      size: formData.size,
      price: parseFloat(formData.price) || 0,
      image: formData.image || "https://via.placeholder.com/400?text=No+Image",
      description: formData.description,
    };

    const { data, error } = await supabase
      .from("products")
      .insert([productToInsert])
      .select();

    if (error) {
      console.error("Error inserting product:", error);
      setLoading(false);
      return;
    }

    if (data && data[0]) {
      onAddProduct(data[0] as Product);
      setSuccess(true);
      setFormData({
        name: "",
        category: categories[0] || "",
        size: sizes[0] || "",
        price: "",
        image: "",
        description: "",
      });
      setSubItems([]);
      setPreviewImage(null);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
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
            sx={{
              borderColor: (t) => alpha(t.palette.secondary.main, 0.3),
              color: "secondary.main",
              "&:hover": {
                borderColor: "secondary.main",
                bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
              },
            }}
          >
            Ver Catálogo
          </Button>
        }
      />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 3, lg: 2 }}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: (t) => alpha(t.palette.background.paper, 0.5),
              border: 1,
              borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
              borderRadius: 2,
              overflow: "hidden",
              position: "sticky",
              top: 100,
            }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={currentTab}
              onChange={(_e, v) => setCurrentTab(v)}
              sx={{
                "& .MuiTab-root": {
                  alignItems: "flex-start",
                  textAlign: "left",
                  py: 3,
                  px: 3,
                  borderLeft: 3,
                  borderColor: "transparent",
                  justifyContent: "flex-start",
                  transition: "all 0.2s",
                  "&.Mui-selected": {
                    bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
                    borderLeftColor: "secondary.main",
                    color: "secondary.main",
                  },
                  "&:hover": {
                    bgcolor: (t) => alpha(t.palette.common.white, 0.05),
                  },
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              <Tab
                icon={<Inventory sx={{ mb: 0, mr: 2 }} />}
                iconPosition="start"
                label="Forjar Artefactos"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              />
              <Tab
                icon={<ReceiptLong sx={{ mb: 0, mr: 2 }} />}
                iconPosition="start"
                label="Gestión de Requisiciones"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              />
              <Tab
                icon={<RateReview sx={{ mb: 0, mr: 2 }} />}
                iconPosition="start"
                label="Crónicas de Aventureros"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              />
            </Tabs>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 9, lg: 10 }}>
          {currentTab === 0 && (
            <Grid container spacing={6}>
              {/* Form Section */}
              <Grid size={{ xs: 12, lg: 7 }}>
                <Stack spacing={4}>
                  <Paper
                    sx={{
                      p: 4,
                      background: (theme) =>
                        `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.9)})`,
                      border: 2,
                      borderColor: "accent.main",
                      borderRadius: 2,
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: (theme) =>
                        `0 0 50px ${alpha(theme.palette.common.black, 0.5)}, inset 0 0 30px ${alpha(theme.palette.common.black, 0.2)}`,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        opacity: 0.1,
                        pointerEvents: "none",
                      }}
                    >
                      <Create sx={{ fontSize: 80, color: "accent.main" }} />
                    </Box>

                    <Collapse in={success}>
                      <Alert
                        severity="success"
                        icon={<CheckCircle />}
                        sx={{
                          mb: 3,
                          bgcolor: (t) => alpha(t.palette.success.main, 0.1),
                          border: 1,
                          borderColor: "success.main",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          El plano ha sido inscrito en los archivos.
                        </Typography>
                      </Alert>
                    </Collapse>

                    <Box component="form" onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Nombre del Artefacto"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="ej. Guiverno Acecha-Sombras"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Precio (GP)"
                            name="price"
                            type="number"
                            required
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="45"
                            helperText={
                              formData.price
                                ? `Equivalente: ${formatCurrency(parseFloat(formData.price) || 0)}`
                                : ""
                            }
                          />
                        </Grid>

                        {/* Category */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ position: "relative" }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "secondary.main",
                                  textTransform: "uppercase",
                                  letterSpacing: 2,
                                  fontWeight: "bold",
                                }}
                              >
                                Origen del Mundo
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => setShowManageCat(!showManageCat)}
                                sx={{ color: "secondary.main" }}
                              >
                                {showManageCat ? (
                                  <Close fontSize="small" />
                                ) : (
                                  <Settings fontSize="small" />
                                )}
                              </IconButton>
                            </Box>
                            {showManageCat ? (
                              <Paper
                                sx={{
                                  p: 2,
                                  bgcolor: "background.paper",
                                  border: 1,
                                  borderColor: "secondary.main",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "secondary.main",
                                    display: "block",
                                    mb: 1,
                                    borderBottom: 1,
                                    borderColor: (t) =>
                                      alpha(t.palette.secondary.main, 0.2),
                                    pb: 1,
                                  }}
                                >
                                  Gestionar Orígenes
                                </Typography>
                                <List
                                  dense
                                  sx={{
                                    maxHeight: 150,
                                    overflowY: "auto",
                                    mb: 2,
                                  }}
                                >
                                  {categories.map((c) => (
                                    <ListItem
                                      key={c}
                                      sx={{
                                        bgcolor: (t) =>
                                          alpha(t.palette.common.black, 0.3),
                                        borderRadius: 1,
                                        mb: 0.5,
                                      }}
                                    >
                                      <ListItemText
                                        primary={c}
                                        primaryTypographyProps={{
                                          variant: "body2",
                                          color: "grey.300",
                                        }}
                                      />
                                      <ListItemSecondaryAction>
                                        <IconButton
                                          edge="end"
                                          size="small"
                                          onClick={() => onDeleteCategory(c)}
                                          sx={{
                                            color: "grey.600",
                                            "&:hover": { color: "error.main" },
                                          }}
                                        >
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                  ))}
                                </List>
                                <Stack direction="row" spacing={1}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    value={newCat}
                                    onChange={(e) => setNewCat(e.target.value)}
                                    placeholder="Nuevo Origen..."
                                  />
                                  <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleCreateCategory}
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    Añadir
                                  </Button>
                                </Stack>
                              </Paper>
                            ) : (
                              <FormControl fullWidth size="small">
                                <Select
                                  name="category"
                                  value={formData.category}
                                  onChange={handleInputChange as any}
                                  sx={{
                                    bgcolor: "background.default",
                                    color: "white",
                                    "& .MuiOutlinedInput-notchedOutline": {
                                      borderColor: (t: typeof theme) =>
                                        alpha(t.palette.secondary.main, 0.3),
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline":
                                      {
                                        borderColor: "secondary.main",
                                      },
                                    "& .MuiSvgIcon-root": {
                                      color: "secondary.main",
                                    },
                                  }}
                                >
                                  {categories.map((c) => (
                                    <MenuItem key={c} value={c}>
                                      {c}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          </Box>
                        </Grid>

                        {/* Size */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box sx={{ position: "relative" }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "secondary.main",
                                  textTransform: "uppercase",
                                  letterSpacing: 2,
                                  fontWeight: "bold",
                                }}
                              >
                                Clase de Escala
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setShowManageSize(!showManageSize)
                                }
                                sx={{ color: "secondary.main" }}
                              >
                                {showManageSize ? (
                                  <Close fontSize="small" />
                                ) : (
                                  <Settings fontSize="small" />
                                )}
                              </IconButton>
                            </Box>
                            {showManageSize ? (
                              <Paper
                                sx={{
                                  p: 2,
                                  bgcolor: "background.paper",
                                  border: 1,
                                  borderColor: "secondary.main",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "secondary.main",
                                    display: "block",
                                    mb: 1,
                                    borderBottom: 1,
                                    borderColor: (t) =>
                                      alpha(t.palette.secondary.main, 0.2),
                                    pb: 1,
                                  }}
                                >
                                  Gestionar Clases de Escala
                                </Typography>
                                <List
                                  dense
                                  sx={{
                                    maxHeight: 150,
                                    overflowY: "auto",
                                    mb: 2,
                                  }}
                                >
                                  {sizes.map((s) => (
                                    <ListItem
                                      key={s}
                                      sx={{
                                        bgcolor: (t) =>
                                          alpha(t.palette.common.black, 0.3),
                                        borderRadius: 1,
                                        mb: 0.5,
                                      }}
                                    >
                                      <ListItemText
                                        primary={s}
                                        primaryTypographyProps={{
                                          variant: "body2",
                                          color: "grey.300",
                                        }}
                                      />
                                      <ListItemSecondaryAction>
                                        <IconButton
                                          edge="end"
                                          size="small"
                                          onClick={() => onDeleteSize(s)}
                                          sx={{
                                            color: "grey.600",
                                            "&:hover": { color: "error.main" },
                                          }}
                                        >
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                  ))}
                                </List>
                                <Stack direction="row" spacing={1}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    value={newSize}
                                    onChange={(e) => setNewSize(e.target.value)}
                                    placeholder="Nueva Escala..."
                                  />
                                  <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleCreateSize}
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    Añadir
                                  </Button>
                                </Stack>
                              </Paper>
                            ) : (
                              <FormControl fullWidth size="small">
                                <Select
                                  name="size"
                                  value={formData.size}
                                  onChange={handleInputChange as any}
                                  sx={{
                                    bgcolor: "background.default",
                                    color: "white",
                                    "& .MuiOutlinedInput-notchedOutline": {
                                      borderColor: (t: typeof theme) =>
                                        alpha(t.palette.secondary.main, 0.3),
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline":
                                      {
                                        borderColor: "secondary.main",
                                      },
                                    "& .MuiSvgIcon-root": {
                                      color: "secondary.main",
                                    },
                                  }}
                                >
                                  {sizes.map((s) => (
                                    <MenuItem key={s} value={s}>
                                      {s}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          </Box>
                        </Grid>

                        {/* Image */}
                        <Grid size={{ xs: 12 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "secondary.main",
                              textTransform: "uppercase",
                              letterSpacing: 2,
                              fontWeight: "bold",
                              display: "block",
                              mb: 1,
                            }}
                          >
                            Esencia Visual (Imagen Principal)
                          </Typography>
                          <TextField
                            fullWidth
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            placeholder="Pega la URL o usa la carga de abajo..."
                            sx={{ mb: 2 }}
                          />
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Typography variant="caption" color="grey.600">
                              o
                            </Typography>
                            <Button
                              component="label"
                              variant="outlined"
                              startIcon={<UploadFile />}
                              sx={{
                                flex: 1,
                                borderStyle: "dashed",
                                borderColor: (t) =>
                                  alpha(t.palette.secondary.main, 0.4),
                                color: "secondary.main",
                                "&:hover": {
                                  bgcolor: (t) =>
                                    alpha(t.palette.secondary.main, 0.05),
                                },
                              }}
                            >
                              Transcribir Imagen Local
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "main")}
                              />
                            </Button>
                          </Stack>
                        </Grid>

                        {/* Description */}
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Lore del Artefacto"
                            name="description"
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Inscribe la historia de esta pieza..."
                          />
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
                            sx={{
                              py: 2,
                              fontWeight: "bold",
                              letterSpacing: 4,
                              border: 1,
                              borderColor: (t) =>
                                alpha(t.palette.secondary.main, 0.2),
                            }}
                          >
                            {loading ? "Forjando..." : "Forjar Producto Final"}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>

                  {/* Sub-Items */}
                  <Paper
                    sx={{
                      p: 4,
                      bgcolor: (t) => alpha(t.palette.background.default, 0.8),
                      border: 1,
                      borderColor: (t) => alpha(t.palette.accent.main, 0.3),
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 3 }}
                    >
                      <Group sx={{ color: "accent.main" }} />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          textTransform: "uppercase",
                          letterSpacing: 2,
                        }}
                      >
                        Composición de la Unidad (El Conjunto)
                      </Typography>
                    </Stack>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: (t) => alpha(t.palette.common.black, 0.3),
                        border: 1,
                        borderColor: (t) => alpha(t.palette.accent.main, 0.1),
                        mb: 3,
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Nombre de la Sub-Unidad"
                            value={newSubItem.name}
                            onChange={(e) =>
                              setNewSubItem((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="ej. Arquero #1"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Stack direction="row" spacing={1}>
                            <TextField
                              size="small"
                              fullWidth
                              label="Imagen Específica (Opcional)"
                              value={newSubItem.image}
                              onChange={(e) =>
                                setNewSubItem((prev) => ({
                                  ...prev,
                                  image: e.target.value,
                                }))
                              }
                              placeholder="URL..."
                            />
                            <IconButton
                              component="label"
                              sx={{
                                bgcolor: (t) =>
                                  alpha(t.palette.secondary.main, 0.1),
                                border: 1,
                                borderColor: (t) =>
                                  alpha(t.palette.secondary.main, 0.2),
                                "&:hover": {
                                  bgcolor: (t) =>
                                    alpha(t.palette.secondary.main, 0.2),
                                },
                              }}
                            >
                              <AddAPhoto sx={{ color: "secondary.main" }} />
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "sub")}
                              />
                            </IconButton>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="secondary"
                            onClick={addSubItem}
                            disabled={!newSubItem.name}
                            sx={{ fontWeight: "bold", letterSpacing: 2 }}
                          >
                            Añadir a la Composición
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                    {subItems.length > 0 && (
                      <Stack spacing={1}>
                        {subItems.map((item, idx) => (
                          <Paper
                            key={item.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              p: 1.5,
                              bgcolor: (t) =>
                                alpha(t.palette.common.black, 0.4),
                              border: 1,
                              borderColor: (t) =>
                                alpha(t.palette.secondary.main, 0.1),
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: (t) =>
                                  alpha(t.palette.secondary.main, 0.4),
                                fontFamily: "monospace",
                              }}
                            >
                              #{idx + 1}
                            </Typography>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                overflow: "hidden",
                                border: 1,
                                borderColor: (t) =>
                                  alpha(t.palette.secondary.main, 0.2),
                                flexShrink: 0,
                              }}
                            >
                              <Box
                                component="img"
                                src={item.image || formData.image}
                                alt={item.name}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                flex: 1,
                                fontWeight: "bold",
                                color: "grey.300",
                              }}
                            >
                              {item.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => removeSubItem(item.id)}
                              sx={{
                                color: "grey.600",
                                "&:hover": { color: "error.main" },
                              }}
                            >
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
                <Box sx={{ position: "sticky", top: 100 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      color: "grey.600",
                      textTransform: "uppercase",
                      letterSpacing: 3,
                      fontWeight: "bold",
                      mb: 2,
                    }}
                  >
                    Manifestación Espectral
                  </Typography>
                  <Paper
                    sx={{
                      p: 4,
                      bgcolor: "background.default",
                      border: 1,
                      borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {previewImage ? (
                      <Box
                        sx={{
                          width: "100%",
                          aspectRatio: "1",
                          border: 1,
                          borderColor: (t) =>
                            alpha(t.palette.secondary.main, 0.1),
                          borderRadius: 1,
                          overflow: "hidden",
                          mb: 3,
                          boxShadow: "0 0 30px rgba(0,0,0,0.5)",
                        }}
                      >
                        <Box
                          component="img"
                          src={previewImage}
                          alt="Preview"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          aspectRatio: "1",
                          border: 2,
                          borderStyle: "dashed",
                          borderColor: (t) =>
                            alpha(t.palette.secondary.main, 0.1),
                          borderRadius: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "grey.700",
                          mb: 3,
                          bgcolor: (t) => alpha(t.palette.common.black, 0.2),
                        }}
                      >
                        <ImageNotSupported sx={{ fontSize: 48, mb: 1 }} />
                        <Typography
                          variant="caption"
                          sx={{
                            textTransform: "uppercase",
                            fontWeight: "bold",
                            letterSpacing: 2,
                          }}
                        >
                          Esperando Entrada Visual
                        </Typography>
                      </Box>
                    )}
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        fontStyle: "italic",
                        color: "common.white",
                        mb: 0.5,
                        textAlign: "center",
                      }}
                    >
                      {formData.name || "Artefacto sin Nombre"}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "secondary.main",
                        fontWeight: "bold",
                        mb: 2,
                      }}
                    >
                      {formatCurrency(parseFloat(formData.price) || 0)}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ color: "grey.500", mb: 3 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          fontWeight: "bold",
                        }}
                      >
                        {formData.category}
                      </Typography>
                      <Typography variant="caption">•</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          fontWeight: "bold",
                        }}
                      >
                        Escala {formData.size}
                      </Typography>
                    </Stack>
                    <Divider
                      sx={{
                        width: "100%",
                        borderColor: (t) =>
                          alpha(t.palette.secondary.main, 0.2),
                        my: 2,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: "italic",
                        color: "grey.500",
                        textAlign: "center",
                        px: 2,
                      }}
                    >
                      {formData.description ||
                        "La historia de esta pieza aún está por escribirse..."}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          )}

          {currentTab === 1 && (
            <Box>
              {ordersLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                  <CircularProgress color="secondary" />
                </Box>
              ) : (
                <TableContainer
                  component={Paper}
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    border: 1,
                    borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
                    boxShadow: 6,
                  }}
                >
                  <Table>
                    <TableHead
                      sx={{
                        bgcolor: (t) => alpha(t.palette.common.black, 0.3),
                      }}
                    >
                      <TableRow>
                        <TableCell
                          sx={{ color: "secondary.main", fontWeight: "bold" }}
                        >
                          Pacto
                        </TableCell>
                        <TableCell
                          sx={{ color: "secondary.main", fontWeight: "bold" }}
                        >
                          Fecha del Pacto
                        </TableCell>
                        <TableCell
                          sx={{ color: "secondary.main", fontWeight: "bold" }}
                        >
                          Aventurero
                        </TableCell>
                        <TableCell
                          sx={{ color: "secondary.main", fontWeight: "bold" }}
                        >
                          Items
                        </TableCell>
                        <TableCell
                          sx={{ color: "secondary.main", fontWeight: "bold" }}
                        >
                          Total
                        </TableCell>
                        <TableCell
                          sx={{ color: "secondary.main", fontWeight: "bold" }}
                        >
                          Estado de la Forja
                        </TableCell>
                        <TableCell
                          sx={{ color: "secondary.main", fontWeight: "bold" }}
                        ></TableCell>
                        <TableCell
                          sx={{ color: "secondary.main", fontWeight: "bold" }}
                        ></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <TableRow
                            onClick={() =>
                              setExpandedOrderId(
                                expandedOrderId === order.id ? null : order.id,
                              )
                            }
                            sx={{
                              cursor: "pointer",
                              "&:hover": {
                                bgcolor: (t) =>
                                  alpha(t.palette.common.white, 0.05),
                              },
                              bgcolor:
                                expandedOrderId === order.id
                                  ? (t) => alpha(t.palette.secondary.main, 0.05)
                                  : "inherit",
                            }}
                          >
                            <TableCell
                              sx={{
                                color: "grey.300",
                                fontFamily: "monospace",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "bold" }}
                              >
                                #{order.contract_number || order.id.slice(0, 8)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ color: "grey.400" }}>
                              <Typography variant="body2">
                                {new Date(
                                  order.created_at,
                                ).toLocaleDateString()}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "grey.600" }}
                              >
                                {new Date(
                                  order.created_at,
                                ).toLocaleTimeString()}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ color: "grey.400" }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "bold",
                                  color: "common.white",
                                }}
                              >
                                {order.customer_name || order.phone}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "grey.600" }}
                              >
                                {order.customer_phone}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                {order.order_items
                                  ?.slice(0, 2)
                                  .map((item: any, i: number) => (
                                    <Typography
                                      key={i}
                                      variant="caption"
                                      sx={{
                                        color: "grey.500",
                                        display: "block",
                                      }}
                                    >
                                      • {item.quantity}x {item.name}
                                    </Typography>
                                  ))}
                                {order.order_items?.length > 2 && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "grey.600",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    +{order.order_items.length - 2} más...
                                  </Typography>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell
                              sx={{
                                color: "secondary.main",
                                fontWeight: "bold",
                              }}
                            >
                              {formatCurrencyDecimal(order.total_gp)}
                            </TableCell>
                            <TableCell>
                              <FormControl size="small" fullWidth>
                                <Select
                                  value={order.status}
                                  onChange={(e) =>
                                    handleUpdateStatus(order.id, e.target.value)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{
                                    height: 32,
                                    fontSize: "0.75rem",
                                    bgcolor: (theme) => {
                                      switch (order.status) {
                                        case "Enviado":
                                          return alpha(
                                            theme.palette.success.main,
                                            0.1,
                                          );
                                        case "En la Forja":
                                          return alpha(
                                            theme.palette.warning.main,
                                            0.1,
                                          );
                                        case "Limpieza y Curado":
                                          return alpha(
                                            theme.palette.info.main,
                                            0.1,
                                          );
                                        case "Recibido":
                                          return alpha(
                                            theme.palette.grey[500],
                                            0.1,
                                          );
                                        case "Cancelado":
                                          return alpha(
                                            theme.palette.error.main,
                                            0.1,
                                          );
                                        default:
                                          return "transparent";
                                      }
                                    },
                                  }}
                                >
                                  <MenuItem value="Recibido">
                                    <HourglassEmpty
                                      sx={{ fontSize: 16, mr: 1 }}
                                    />{" "}
                                    Recibido
                                  </MenuItem>
                                  <MenuItem value="En la Forja">
                                    <Handyman sx={{ fontSize: 16, mr: 1 }} /> En
                                    la Forja
                                  </MenuItem>
                                  <MenuItem value="Limpieza y Curado">
                                    <CleaningServices
                                      sx={{ fontSize: 16, mr: 1 }}
                                    />{" "}
                                    Limpieza y Curado
                                  </MenuItem>
                                  <MenuItem value="Enviado">
                                    <LocalShipping
                                      sx={{ fontSize: 16, mr: 1 }}
                                    />{" "}
                                    Enviado
                                  </MenuItem>
                                  <MenuItem value="Cancelado">
                                    <Close sx={{ fontSize: 16, mr: 1 }} />{" "}
                                    Cancelado
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedOrderId(
                                    expandedOrderId === order.id
                                      ? null
                                      : order.id,
                                  );
                                }}
                                sx={{ color: "secondary.main" }}
                              >
                                {expandedOrderId === order.id ? (
                                  <KeyboardArrowUp />
                                ) : (
                                  <KeyboardArrowDown />
                                )}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteOrder(order.id);
                                }}
                                sx={{
                                  color: "error.main",
                                  "&:hover": {
                                    bgcolor: (t) =>
                                      alpha(t.palette.error.main, 0.1),
                                  },
                                }}
                                title="Romper Pacto (Eliminar)"
                              >
                                <DeleteForever />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                              <Collapse
                                in={expandedOrderId === order.id}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Paper
                                  sx={{
                                    m: 2,
                                    p: 3,
                                    bgcolor: (t) =>
                                      alpha(t.palette.background.default, 0.8),
                                    border: 1,
                                    borderColor: (t) =>
                                      alpha(t.palette.secondary.main, 0.2),
                                    borderRadius: 2,
                                  }}
                                >
                                  <Grid container spacing={3}>
                                    {/* Customer Info */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          color: "secondary.main",
                                          fontWeight: "bold",
                                          mb: 2,
                                          textTransform: "uppercase",
                                          letterSpacing: 1,
                                        }}
                                      >
                                        Información del Aventurero
                                      </Typography>
                                      <Stack spacing={2}>
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              color: "grey.500",
                                              textTransform: "uppercase",
                                              letterSpacing: 1,
                                            }}
                                          >
                                            Número de Pacto
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            sx={{
                                              color: "common.white",
                                              fontWeight: "bold",
                                              fontFamily: "monospace",
                                            }}
                                          >
                                            #
                                            {order.contract_number ||
                                              order.id.slice(0, 8)}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              color: "grey.500",
                                              textTransform: "uppercase",
                                              letterSpacing: 1,
                                            }}
                                          >
                                            Nombre
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            sx={{ color: "common.white" }}
                                          >
                                            {order.customer_name || "N/A"}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              color: "grey.500",
                                              textTransform: "uppercase",
                                              letterSpacing: 1,
                                            }}
                                          >
                                            Email
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            sx={{ color: "common.white" }}
                                          >
                                            {order.customer_email || "N/A"}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              color: "grey.500",
                                              textTransform: "uppercase",
                                              letterSpacing: 1,
                                            }}
                                          >
                                            Teléfono
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            sx={{ color: "common.white" }}
                                          >
                                            {order.customer_phone ||
                                              order.phone ||
                                              "N/A"}
                                          </Typography>
                                        </Box>
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              color: "grey.500",
                                              textTransform: "uppercase",
                                              letterSpacing: 1,
                                            }}
                                          >
                                            DNI
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            sx={{ color: "common.white" }}
                                          >
                                            {order.customer_dni || "N/A"}
                                          </Typography>
                                        </Box>
                                      </Stack>
                                    </Grid>

                                    {/* Shipping Info */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          color: "secondary.main",
                                          fontWeight: "bold",
                                          mb: 2,
                                          textTransform: "uppercase",
                                          letterSpacing: 1,
                                        }}
                                      >
                                        Dirección de Envío
                                      </Typography>
                                      <Paper
                                        sx={{
                                          p: 2,
                                          bgcolor: (t) =>
                                            alpha(t.palette.common.black, 0.3),
                                          border: 1,
                                          borderColor: (t) =>
                                            alpha(
                                              t.palette.secondary.main,
                                              0.1,
                                            ),
                                          borderRadius: 1,
                                        }}
                                      >
                                        <Typography
                                          variant="body1"
                                          sx={{
                                            color: "common.white",
                                            whiteSpace: "pre-wrap",
                                          }}
                                        >
                                          {order.shipping_address ||
                                            "Sin dirección registrada"}
                                        </Typography>
                                      </Paper>

                                      <Box sx={{ mt: 3 }}>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "grey.500",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                          }}
                                        >
                                          Fecha del Pedido
                                        </Typography>
                                        <Typography
                                          variant="body1"
                                          sx={{ color: "common.white" }}
                                        >
                                          {new Date(
                                            order.created_at,
                                          ).toLocaleString("es-ES", {
                                            dateStyle: "full",
                                            timeStyle: "short",
                                          })}
                                        </Typography>
                                      </Box>

                                      <Box sx={{ mt: 2 }}>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "grey.500",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                          }}
                                        >
                                          Total
                                        </Typography>
                                        <Typography
                                          variant="h5"
                                          sx={{
                                            color: "secondary.main",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {formatCurrencyDecimal(
                                            order.total_gp,
                                          )}
                                        </Typography>
                                      </Box>

                                      <Box sx={{ mt: 2 }}>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "grey.500",
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                          }}
                                        >
                                          Estado Actual
                                        </Typography>
                                        <Chip
                                          label={order.status}
                                          size="small"
                                          sx={{
                                            ml: 1,
                                            bgcolor: (theme) => {
                                              switch (order.status) {
                                                case "Enviado":
                                                  return alpha(
                                                    theme.palette.success.main,
                                                    0.2,
                                                  );
                                                case "En la Forja":
                                                  return alpha(
                                                    theme.palette.warning.main,
                                                    0.2,
                                                  );
                                                case "Limpieza y Curado":
                                                  return alpha(
                                                    theme.palette.info.main,
                                                    0.2,
                                                  );
                                                case "Recibido":
                                                  return alpha(
                                                    theme.palette.grey[500],
                                                    0.2,
                                                  );
                                                case "Cancelado":
                                                  return alpha(
                                                    theme.palette.error.main,
                                                    0.2,
                                                  );
                                                default:
                                                  return "transparent";
                                              }
                                            },
                                            color: (theme) => {
                                              switch (order.status) {
                                                case "Enviado":
                                                  return theme.palette.success
                                                    .main;
                                                case "En la Forja":
                                                  return theme.palette.warning
                                                    .main;
                                                case "Limpieza y Curado":
                                                  return theme.palette.info
                                                    .main;
                                                case "Recibido":
                                                  return theme.palette
                                                    .grey[400];
                                                case "Cancelado":
                                                  return theme.palette.error
                                                    .main;
                                                default:
                                                  return "inherit";
                                              }
                                            },
                                            fontWeight: "bold",
                                          }}
                                        />
                                      </Box>
                                    </Grid>

                                    {/* Items List */}
                                    <Grid size={{ xs: 12 }}>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          color: "secondary.main",
                                          fontWeight: "bold",
                                          mb: 2,
                                          textTransform: "uppercase",
                                          letterSpacing: 1,
                                        }}
                                      >
                                        Items del Pedido
                                      </Typography>
                                      <Stack spacing={2}>
                                        {order.order_items?.map(
                                          (item: any, i: number) => (
                                            <Paper
                                              key={i}
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                p: 2,
                                                bgcolor: (t) =>
                                                  alpha(
                                                    t.palette.common.black,
                                                    0.2,
                                                  ),
                                                border: 1,
                                                borderColor: (t) =>
                                                  alpha(
                                                    t.palette.secondary.main,
                                                    0.1,
                                                  ),
                                                borderRadius: 1,
                                              }}
                                            >
                                              <Box
                                                component="img"
                                                src={
                                                  item.image_url ||
                                                  "https://via.placeholder.com/80?text=No+Img"
                                                }
                                                alt={item.name}
                                                sx={{
                                                  width: 80,
                                                  height: 80,
                                                  objectFit: "cover",
                                                  borderRadius: 1,
                                                  border: 1,
                                                  borderColor: (t) =>
                                                    alpha(
                                                      t.palette.secondary.main,
                                                      0.2,
                                                    ),
                                                }}
                                              />
                                              <Box sx={{ flex: 1 }}>
                                                <Typography
                                                  variant="body1"
                                                  sx={{
                                                    color: "common.white",
                                                    fontWeight: "bold",
                                                  }}
                                                >
                                                  {item.name}
                                                </Typography>
                                                <Typography
                                                  variant="caption"
                                                  sx={{ color: "grey.500" }}
                                                >
                                                  Cantidad: {item.quantity}
                                                </Typography>
                                              </Box>
                                              <Typography
                                                variant="body1"
                                                sx={{
                                                  color: "secondary.main",
                                                  fontWeight: "bold",
                                                }}
                                              >
                                                {formatCurrencyDecimal(
                                                  (item.unit_price || 0) *
                                                    item.quantity,
                                                )}
                                              </Typography>
                                            </Paper>
                                          ),
                                        )}
                                      </Stack>
                                    </Grid>

                                    {/* Admin Notes */}
                                    <Grid size={{ xs: 12 }}>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          color: "secondary.main",
                                          fontWeight: "bold",
                                          mb: 2,
                                          textTransform: "uppercase",
                                          letterSpacing: 1,
                                        }}
                                      >
                                        Notas del Administrador
                                      </Typography>
                                      <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Añade notas internas sobre este pedido..."
                                        defaultValue={order.admin_notes || ""}
                                        onBlur={(e) =>
                                          handleUpdateAdminNotes(
                                            order.id,
                                            e.target.value,
                                          )
                                        }
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            bgcolor: (t) =>
                                              alpha(
                                                t.palette.common.black,
                                                0.2,
                                              ),
                                            "& fieldset": {
                                              borderColor: (t) =>
                                                alpha(
                                                  t.palette.secondary.main,
                                                  0.2,
                                                ),
                                            },
                                            "&:hover fieldset": {
                                              borderColor: "secondary.main",
                                            },
                                          },
                                        }}
                                      />
                                    </Grid>

                                    {/* Action Buttons */}
                                    <Grid size={{ xs: 12 }}>
                                      <Stack
                                        direction="row"
                                        spacing={2}
                                        justifyContent="flex-end"
                                      >
                                        <Button
                                          variant="outlined"
                                          color="success"
                                          startIcon={<WhatsApp />}
                                          onClick={() =>
                                            handleSendWhatsApp(order)
                                          }
                                          sx={{
                                            borderColor: (t) =>
                                              alpha(
                                                t.palette.success.main,
                                                0.4,
                                              ),
                                            "&:hover": {
                                              bgcolor: (t) =>
                                                alpha(
                                                  t.palette.success.main,
                                                  0.1,
                                                ),
                                            },
                                          }}
                                        >
                                          Enviar WhatsApp
                                        </Button>
                                        <Button
                                          variant="outlined"
                                          color="secondary"
                                          startIcon={<Print />}
                                          onClick={() =>
                                            handlePrintOrder(order)
                                          }
                                        >
                                          Imprimir
                                        </Button>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </Paper>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))}
                      {allOrders.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            sx={{
                              textAlign: "center",
                              py: 6,
                              color: "grey.600",
                              fontStyle: "italic",
                            }}
                          >
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

          {currentTab === 2 && (
            <Box>
              {reviewsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                  <CircularProgress color="secondary" />
                </Box>
              ) : (
                <Box>
                  {/* Search and Filter Controls */}
                  <Paper
                    sx={{
                      p: 3,
                      mb: 3,
                      bgcolor: "background.paper",
                      border: 1,
                      borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
                      borderRadius: 2,
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Buscar crónicas por usuario, texto o producto..."
                          value={reviewSearch}
                          onChange={(e) => setReviewSearch(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <Search sx={{ color: "secondary.main", mr: 1 }} />
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: (t) =>
                                alpha(t.palette.secondary.main, 0.3),
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "secondary.main",
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={reviewFilter}
                            onChange={(e) => setReviewFilter(e.target.value)}
                            displayEmpty
                            startAdornment={
                              <FilterList
                                sx={{ color: "secondary.main", mr: 1 }}
                              />
                            }
                            sx={{
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: (t) =>
                                  alpha(t.palette.secondary.main, 0.3),
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "secondary.main",
                              },
                            }}
                          >
                            <MenuItem value="all">Todas las Crónicas</MenuItem>
                            <MenuItem value="withImage">Con Imágenes</MenuItem>
                            <MenuItem value="withoutImage">
                              Sin Imágenes
                            </MenuItem>
                            <MenuItem value="lowRating">
                              Baja Calificación (≤2)
                            </MenuItem>
                            <MenuItem value="highRating">
                              Alta Calificación (≥4)
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "grey.500",
                            display: "block",
                            textAlign: "center",
                          }}
                        >
                          {allReviews.length} crónicas encontradas
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Reviews Table */}
                  <Box
                    sx={{
                      p: 3,
                      mb: 4,
                      bgcolor: (t) => alpha(t.palette.success.main, 0.1),
                      border: 1,
                      borderColor: (t) => alpha(t.palette.success.main, 0.3),
                      borderRadius: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{ mb: 2 }}
                    >
                      <SentimentVerySatisfied color="success" />
                      <Typography variant="h6" color="success.main">
                        Invitar a Aventurero
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, color: "grey.500" }}
                    >
                      Genera un enlace único para que un cliente deje una reseña
                      y reciba su recompensa.
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleGenerateLink}
                        startIcon={<AutoFixHigh />}
                      >
                        Generar Enlace Mágico
                      </Button>
                      {generatedLink && (
                        <Paper
                          sx={{
                            p: 1,
                            px: 2,
                            bgcolor: "background.paper",
                            border: 1,
                            borderColor: "grey.700",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace" }}
                          >
                            {generatedLink}
                          </Typography>
                          <IconButton size="small" onClick={copyLink}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Paper>
                      )}
                    </Stack>
                  </Box>

                  <TableContainer
                    component={Paper}
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      border: 1,
                      borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
                      boxShadow: 6,
                    }}
                  >
                    <Table>
                      <TableHead
                        sx={{
                          bgcolor: (t) => alpha(t.palette.common.black, 0.3),
                        }}
                      >
                        <TableRow>
                          <TableCell
                            sx={{ color: "secondary.main", fontWeight: "bold" }}
                          >
                            ID
                          </TableCell>
                          <TableCell
                            sx={{ color: "secondary.main", fontWeight: "bold" }}
                          >
                            Aventurero
                          </TableCell>
                          <TableCell
                            sx={{ color: "secondary.main", fontWeight: "bold" }}
                          >
                            Artefacto
                          </TableCell>
                          <TableCell
                            sx={{ color: "secondary.main", fontWeight: "bold" }}
                          >
                            Calificación
                          </TableCell>
                          <TableCell
                            sx={{ color: "secondary.main", fontWeight: "bold" }}
                          >
                            Crónica
                          </TableCell>
                          <TableCell
                            sx={{ color: "secondary.main", fontWeight: "bold" }}
                          >
                            Imagen
                          </TableCell>
                          <TableCell
                            sx={{ color: "secondary.main", fontWeight: "bold" }}
                          >
                            Fecha
                          </TableCell>
                          <TableCell
                            sx={{ color: "secondary.main", fontWeight: "bold" }}
                          >
                            Acciones
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allReviews
                          .filter((review) => {
                            // Apply search filter
                            const searchMatch =
                              reviewSearch === "" ||
                              review.user_name
                                ?.toLowerCase()
                                .includes(reviewSearch.toLowerCase()) ||
                              review.text
                                ?.toLowerCase()
                                .includes(reviewSearch.toLowerCase()) ||
                              review.products?.name
                                ?.toLowerCase()
                                .includes(reviewSearch.toLowerCase());

                            // Apply category filter
                            let filterMatch = true;
                            switch (reviewFilter) {
                              case "withImage":
                                filterMatch = !!review.image;
                                break;
                              case "withoutImage":
                                filterMatch = !review.image;
                                break;
                              case "lowRating":
                                filterMatch = review.rating <= 2;
                                break;
                              case "highRating":
                                filterMatch = review.rating >= 4;
                                break;
                              default:
                                filterMatch = true;
                            }

                            return searchMatch && filterMatch;
                          })
                          .map((review) => (
                            <TableRow
                              key={review.id}
                              sx={{
                                "&:hover": {
                                  bgcolor: (t) =>
                                    alpha(t.palette.common.white, 0.05),
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  color: "grey.300",
                                  fontFamily: "monospace",
                                }}
                              >
                                <Typography variant="caption">
                                  #{review.id.slice(0, 8)}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ color: "grey.400" }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "common.white",
                                  }}
                                >
                                  {review.user_name}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ color: "grey.400" }}>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "common.white" }}
                                >
                                  {review.products?.name ||
                                    "Producto desconocido"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "grey.600" }}
                                >
                                  {review.products?.category || "Sin categoría"}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ color: "grey.400" }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {[...Array(5)].map((_, i) => (
                                    <Box
                                      key={i}
                                      sx={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        bgcolor:
                                          i < review.rating
                                            ? "warning.main"
                                            : "grey.700",
                                        border: 1,
                                        borderColor:
                                          i < review.rating
                                            ? "warning.dark"
                                            : "grey.600",
                                      }}
                                    />
                                  ))}
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "grey.600", ml: 0.5 }}
                                  >
                                    {review.rating}/5
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell
                                sx={{ color: "grey.400", maxWidth: 300 }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    display: "block",
                                  }}
                                  title={review.text}
                                >
                                  {review.text}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ color: "grey.400" }}>
                                {review.image ? (
                                  <Box sx={{ position: "relative" }}>
                                    <Box
                                      component="img"
                                      src={review.image}
                                      alt="Review"
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1,
                                        objectFit: "cover",
                                        border: 1,
                                        borderColor: (t) =>
                                          alpha(t.palette.secondary.main, 0.2),
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleRemoveReviewImage(review.id)
                                      }
                                      sx={{
                                        position: "absolute",
                                        top: -8,
                                        right: -8,
                                        bgcolor: "error.main",
                                        color: "white",
                                        width: 20,
                                        height: 20,
                                        "&:hover": { bgcolor: "error.dark" },
                                      }}
                                    >
                                      <Close sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Box>
                                ) : (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "grey.600" }}
                                  >
                                    Sin imagen
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ color: "grey.400" }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "grey.500" }}
                                >
                                  {new Date(
                                    review.created_at,
                                  ).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={() => handleDeleteReview(review.id)}
                                  sx={{
                                    color: "error.main",
                                    "&:hover": {
                                      bgcolor: (t) =>
                                        alpha(t.palette.error.main, 0.1),
                                    },
                                  }}
                                >
                                  <DeleteForever />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        {allReviews.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              sx={{
                                textAlign: "center",
                                py: 6,
                                color: "grey.600",
                                fontStyle: "italic",
                              }}
                            >
                              No hay crónicas inscritas en los archivos.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Admin;
