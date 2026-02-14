import React, { useState, ChangeEvent, FormEvent } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    Stack,
    Collapse,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    FormControl,
    Select,
    MenuItem,
    alpha,
    useTheme,
    Divider,
} from "@mui/material";
import {
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
} from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import { Product, SubItem } from "@/types";
import { formatCurrency } from "@/src/utils/currency";
import { useQueryClient } from "@tanstack/react-query";

interface AdminProductsProps {
    categories: string[];
    sizes: string[];
    onAddCategory: (cat: string) => void;
    onAddSize: (size: string) => void;
    onDeleteCategory: (cat: string) => void;
    onDeleteSize: (size: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
    categories,
    sizes,
    onAddCategory,
    onAddSize,
    onDeleteCategory,
    onDeleteSize,
}) => {
    const theme = useTheme();
    const queryClient = useQueryClient();

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

    const handleSubmit = async (e: FormEvent) => {
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
            alert(`Error al forjar: ${error.message} (Verifica tus permisos de Supervisor)`);
            setLoading(false);
            return;
        }

        if (data && data[0]) {
            await queryClient.invalidateQueries({ queryKey: ["products"] });
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
                                                        "&:hover .MuiOutlinedInput-notchedOutline": {
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
                                                onClick={() => setShowManageSize(!showManageSize)}
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
                                                        "&:hover .MuiOutlinedInput-notchedOutline": {
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
                                    <Stack direction="row" spacing={2} alignItems="center">
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
                                                borderColor: (t) => alpha(t.palette.secondary.main, 0.4),
                                                color: "secondary.main",
                                                "&:hover": {
                                                    bgcolor: (t) => alpha(t.palette.secondary.main, 0.05),
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
                                            borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
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
                                                bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
                                                border: 1,
                                                borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
                                                "&:hover": {
                                                    bgcolor: (t) => alpha(t.palette.secondary.main, 0.2),
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
                                            bgcolor: (t) => alpha(t.palette.common.black, 0.4),
                                            border: 1,
                                            borderColor: (t) => alpha(t.palette.secondary.main, 0.1),
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            onClick={() => {
                                                if (confirm(`¿Destruir el artefacto "${item.name}"? Esta acción es irreversible.`)) {
                                                    removeSubItem(item.id);
                                                }
                                            }}
                                            sx={{
                                                color: (t) => alpha(t.palette.secondary.main, 0.4),
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
                                                borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
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

            {/* Preview Section */}
            <Grid size={{ xs: 12, lg: 5 }}>
                <Stack spacing={4}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "secondary.main",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: 2,
                            textAlign: "center",
                        }}
                    >
                        Visión del Artefacto
                    </Typography>
                    <Box
                        sx={{
                            position: "sticky",
                            top: 24,
                        }}
                    >
                        <Paper
                            elevation={10}
                            sx={{
                                overflow: "hidden",
                                borderRadius: 4,
                                bgcolor: "background.paper",
                                border: 1,
                                borderColor: "secondary.main",
                            }}
                        >
                            <Box sx={{ position: "relative" }}>
                                <Box
                                    component="img"
                                    src={
                                        previewImage ||
                                        "https://via.placeholder.com/400?text=Sin+Imagen"
                                    }
                                    alt="Preview"
                                    sx={{
                                        width: "100%",
                                        height: 400,
                                        objectFit: "cover",
                                        filter: !previewImage ? "grayscale(100%) opacity(0.3)" : "none",
                                        transition: "all 0.3s",
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                                        p: 3,
                                        pt: 8,
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: "common.white",
                                            fontFamily: "Cinzel, serif",
                                            fontWeight: "bold",
                                            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                                        }}
                                    >
                                        {formData.name || "Nombre del Artefacto"}
                                    </Typography>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                        sx={{ mt: 1 }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ color: "secondary.main", fontWeight: "bold" }}
                                        >
                                            {formatCurrency(parseFloat(formData.price) || 0)}
                                        </Typography>
                                        {formData.category && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    bgcolor: "secondary.main",
                                                    color: "common.black",
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 0.5,
                                                    fontWeight: "bold",
                                                    textTransform: "uppercase",
                                                }}
                                            >
                                                {formData.category}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Stack>
            </Grid>
        </Grid >
    );
};
