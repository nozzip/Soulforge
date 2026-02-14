import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    IconButton,
    CircularProgress,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    FormControl,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    Avatar,
    Rating,
    alpha,
    useTheme,
    Stack,
    Tooltip,
    Divider,
} from "@mui/material";
import {
    Search,
    Delete,
    BrokenImage,
    ContentCopy,
    Link,
    FilterList,
    Star,
    Image,
    Close,
    ImageNotSupported,
} from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import { DEFAULT_AVATAR_URL } from "@/constants";

export const AdminReviews: React.FC = () => {
    const [allReviews, setAllReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewSearch, setReviewSearch] = useState("");
    const [reviewFilter, setReviewFilter] = useState("all");
    const [generatedLink, setGeneratedLink] = useState("");
    const [linkLoading, setLinkLoading] = useState(false);

    const fetchReviews = async () => {
        setReviewsLoading(true);
        const { data, error } = await supabase
            .from("product_reviews")
            .select("*, products(name, category, image)")
            .order("created_at", { ascending: false });

        if (error) console.error("Error fetching reviews:", error);
        else setAllReviews(data || []);
        setReviewsLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleGenerateLink = async () => {
        setLinkLoading(true);
        const { data, error } = await supabase.rpc("generate_review_token");

        if (error) {
            console.error("Error generating token:", error);
            alert("Error al generar el enlace mágico");
        } else {
            const link = `${window.location.origin}/review?token=${data}`;
            setGeneratedLink(link);
        }
        setLinkLoading(false);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(generatedLink);
        alert("Enlace copiado al portapapeles");
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (
            !confirm(
                "¿Estás seguro de silenciar esta voz? La crónica se perderá para siempre.",
            )
        )
            return;

        const { error } = await supabase
            .from("product_reviews")
            .delete()
            .eq("id", reviewId);

        if (error) {
            alert("Error al eliminar la reseña");
        } else {
            setAllReviews((prev) => prev.filter((r) => r.id !== reviewId));
        }
    };

    const handleRemoveReviewImage = async (reviewId: string) => {
        if (!confirm("¿Deseas purgar la imagen de esta reseña?")) return;

        const { error } = await supabase
            .from("product_reviews")
            .update({ image: null })
            .eq("id", reviewId);

        if (error) {
            alert("Error al eliminar la imagen");
        } else {
            setAllReviews((prev) =>
                prev.map((r) => (r.id === reviewId ? { ...r, image: null } : r)),
            );
        }
    };

    const filteredReviews = allReviews.filter((review) => {
        const matchesSearch =
            review.user_name?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
            review.comment?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
            review.products?.name?.toLowerCase().includes(reviewSearch.toLowerCase());

        if (reviewFilter === "all") return matchesSearch;
        if (reviewFilter === "with_image") return matchesSearch && review.image;
        if (reviewFilter === "high_rating") return matchesSearch && review.rating >= 4;
        if (reviewFilter === "low_rating") return matchesSearch && review.rating <= 2;
        return matchesSearch;
    });

    return (
        <Box>
            <Paper
                sx={{
                    p: 3,
                    mb: 4,
                    bgcolor: (t) => alpha(t.palette.background.default, 0.6),
                    border: 1,
                    borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
                    borderRadius: 2,
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                color: "secondary.main",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                letterSpacing: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Link /> Convocar Reseñas
                        </Typography>
                        <Typography
                            variant="body2"
                            color="grey.500"
                            sx={{ mb: 2, maxWidth: "80%" }}
                        >
                            Genera un enlace mágico único para invitar a los aventureros a dejar
                            su testimonio en los archivos.
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleGenerateLink}
                                disabled={linkLoading}
                                startIcon={<Link />}
                                sx={{
                                    fontWeight: "bold",
                                    bgcolor: (t) => alpha(t.palette.secondary.main, 0.8),
                                    "&:hover": { bgcolor: "secondary.main" },
                                }}
                            >
                                {linkLoading ? "Tejiendo..." : "Generar Enlace Mágico"}
                            </Button>
                            {generatedLink && (
                                <Paper
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: "4px 8px 4px 16px",
                                        bgcolor: (t) => alpha(t.palette.common.black, 0.3),
                                        border: 1,
                                        borderColor: (t) => alpha(t.palette.secondary.main, 0.3),
                                        borderRadius: 1,
                                        maxWidth: 400,
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            mr: 1,
                                            fontFamily: "monospace",
                                            color: "grey.300",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {generatedLink}
                                    </Typography>
                                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                                    <Tooltip title="Copiar al portapapeles">
                                        <IconButton size="small" onClick={copyLink}>
                                            <ContentCopy fontSize="small" sx={{ color: "success.light" }} />
                                        </IconButton>
                                    </Tooltip>
                                </Paper>
                            )}
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            sx={{
                                p: 2,
                                bgcolor: (t) => alpha(t.palette.secondary.main, 0.05),
                                border: 1,
                                borderStyle: "dashed",
                                borderColor: (t) => alpha(t.palette.secondary.main, 0.3),
                                borderRadius: 2,
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        p: 1.5,
                                        bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
                                        borderRadius: "50%",
                                    }}
                                >
                                    <Star sx={{ color: "secondary.main", fontSize: 30 }} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                        Sabiduría de los Archivos
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Total de Reseñas: {allReviews.length}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            {/* Filters */}
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{ mb: 3 }}
            >
                <TextField
                    size="small"
                    placeholder="Buscar en las crónicas..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                            bgcolor: (t) => alpha(t.palette.background.paper, 0.5),
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: "text.secondary" }} />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl
                    size="small"
                    sx={{ minWidth: 200, bgcolor: (t) => alpha(t.palette.background.paper, 0.5) }}
                >
                    <Select
                        value={reviewFilter}
                        onChange={(e) => setReviewFilter(e.target.value)}
                        displayEmpty
                        startAdornment={
                            <InputAdornment position="start">
                                <FilterList sx={{ color: "text.secondary" }} />
                            </InputAdornment>
                        }
                    >
                        <MenuItem value="all">Todas las Crónicas</MenuItem>
                        <MenuItem value="with_image">Con Evidencia Visual</MenuItem>
                        <MenuItem value="high_rating">Alta Valoración (4+)</MenuItem>
                        <MenuItem value="low_rating">Baja Valoración (2-)</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {reviewsLoading ? (
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
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}>
                                    Aventurero
                                </TableCell>
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}>
                                    Artefacto
                                </TableCell>
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}>
                                    Valoración
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "secondary.main",
                                        fontWeight: "bold",
                                        width: "40%",
                                    }}
                                >
                                    Crónica
                                </TableCell>
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}>
                                    Evidencia Visual
                                </TableCell>
                                <TableCell align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredReviews.map((review) => (
                                <TableRow
                                    key={review.id}
                                    sx={{
                                        "&:hover": {
                                            bgcolor: (t) => alpha(t.palette.common.white, 0.05),
                                        },
                                    }}
                                >
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar
                                                src={review.user_avatar?.includes('images/avatars/') ? DEFAULT_AVATAR_URL : review.user_avatar}
                                                alt={review.user_name}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    border: 1,
                                                    borderColor: (t) => alpha(t.palette.secondary.main, 0.5),
                                                }}
                                            >
                                                {review.user_name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                    {review.user_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {review.products ? (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Box
                                                    component="img"
                                                    src={
                                                        review.products.image ||
                                                        "https://via.placeholder.com/40"
                                                    }
                                                    sx={{
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: 0.5,
                                                        objectFit: "cover",
                                                    }}
                                                />
                                                <Typography variant="body2">
                                                    {review.products.name}
                                                </Typography>
                                            </Stack>
                                        ) : (
                                            <Typography
                                                variant="caption"
                                                sx={{ fontStyle: "italic", color: "text.disabled" }}
                                            >
                                                Artefacto Desconocido
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Rating
                                            value={review.rating}
                                            readOnly
                                            size="small"
                                            emptyIcon={
                                                <Star style={{ opacity: 0.3 }} fontSize="inherit" />
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "grey.300",
                                                fontStyle: "italic",
                                            }}
                                        >
                                            "{review.comment}"
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {review.image ? (
                                            <Box
                                                sx={{
                                                    position: "relative",
                                                    width: 60,
                                                    height: 60,
                                                    "&:hover .remove-btn": { opacity: 1 },
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={review.image}
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        borderRadius: 1,
                                                        border: 1,
                                                        borderColor: "grey.800",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() => window.open(review.image, "_blank")}
                                                />
                                                <IconButton
                                                    className="remove-btn"
                                                    size="small"
                                                    onClick={() => handleRemoveReviewImage(review.id)}
                                                    sx={{
                                                        position: "absolute",
                                                        top: -8,
                                                        right: -8,
                                                        bgcolor: "error.main",
                                                        color: "white",
                                                        width: 20,
                                                        height: 20,
                                                        opacity: 0,
                                                        transition: "opacity 0.2s",
                                                        "&:hover": { bgcolor: "error.dark" },
                                                    }}
                                                >
                                                    <Close style={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                sx={{ opacity: 0.3 }}
                                            >
                                                <ImageNotSupported fontSize="small" />
                                                <Typography variant="caption">N/A</Typography>
                                            </Stack>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Eliminar Reseña">
                                            <IconButton
                                                onClick={() => handleDeleteReview(review.id)}
                                                sx={{
                                                    color: "grey.600",
                                                    "&:hover": {
                                                        color: "error.main",
                                                        bgcolor: (t) => alpha(t.palette.error.main, 0.1),
                                                    },
                                                }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredReviews.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        sx={{
                                            textAlign: "center",
                                            py: 6,
                                            color: "grey.600",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        No se han encontrado crónicas que coincidan con la búsqueda.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};
