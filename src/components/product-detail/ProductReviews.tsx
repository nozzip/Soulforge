import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Stack,
  Rating,
  TextField,
  Button,
  IconButton,
  Paper,
  Tooltip,
  Avatar,
  Dialog,
  DialogContent,
} from "@mui/material";
import { Brush, Star, AddAPhoto, Close, Delete } from "@mui/icons-material";
import { ViewState } from "../../../types";
import { formatRelativeDate } from "../../utils/date";
import { DEFAULT_AVATAR_URL } from "../../../constants";
import DOMPurify from "isomorphic-dompurify";
import { safeReadImageAsDataURL } from "../../../utils/imageValidation";

// Duplicate interface again or import from a shared location.
// I'll assume we will clean this up later.
interface Review {
  id: string;
  product_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  text: string;
  image: string | null;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string | null;
  user: { name: string; id: string; avatar?: string } | null;
  reviews: Review[];
  reviewsLoading: boolean;
  isAdmin: boolean;
  onAddReview: (review: {
    text: string;
    rating: number;
    image: string | null;
  }) => Promise<void>;
  onDeleteReview: (id: string) => Promise<void>;
  setView: (view: ViewState) => void;
  showToast: (
    message: string,
    severity: "success" | "error" | "info" | "warning",
  ) => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  user,
  reviews,
  reviewsLoading,
  isAdmin,
  onAddReview,
  onDeleteReview,
  setView,
  showToast,
}) => {
  const [newReview, setNewReview] = useState({
    text: "",
    rating: 5,
    image: null as string | null,
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<
    string | null
  >(null);

  // Community Gallery Images (derived from reviews with images)
  const communityImages = useMemo(() => {
    return reviews
      .filter((r) => r.image)
      .map((r) => ({
        url: r.image!,
        user: r.user_name,
        reviewId: r.id,
      }));
  }, [reviews]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      try {
        const imageData = await safeReadImageAsDataURL(file, 5); // 5MB max
        setNewReview((prev) => ({ ...prev, image: imageData }));
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : "Error al cargar la imagen",
          "error",
        );
        // Reset file input
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    if (!user || !newReview.text || !productId) return;
    setSubmittingReview(true);

    try {
      // Sanitize logic could be here or in parent. Parent is cleaner for API calls,
      // but sanitization is UI concern too.
      // I will sanitize here to be safe before passing data.
      const sanitizedText = DOMPurify.sanitize(newReview.text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });

      await onAddReview({
        text: sanitizedText,
        rating: newReview.rating,
        image: newReview.image,
      });

      setNewReview({
        text: "",
        rating: 5,
        image: null,
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      {/* Community Gallery */}
      {communityImages.length > 0 && (
        <Box sx={{ mb: 10 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <Divider sx={{ flex: 1, borderColor: "rgba(197, 160, 89, 0.2)" }} />
            <Typography
              variant="h5"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                textTransform: "uppercase",
                letterSpacing: 3,
                fontWeight: "bold",
                fontStyle: "italic",
                color: "common.white",
              }}
            >
              <Brush /> Galería de Aventureros
            </Typography>
            <Divider sx={{ flex: 1, borderColor: "rgba(197, 160, 89, 0.2)" }} />
          </Box>
          <Typography
            variant="body2"
            color="grey.500"
            sx={{ textAlign: "center", mb: 3, fontStyle: "italic" }}
          >
            Obras de arte pintadas por nuestra comunidad de aventureros
          </Typography>
          <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 2 }}>
            {communityImages.map((img, i) => (
              <Box
                key={i}
                onClick={() => {
                  setSelectedGalleryImage(img.url);
                  setGalleryOpen(true);
                }}
                sx={{
                  minWidth: 200,
                  maxWidth: 200,
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: 1,
                  borderColor: "rgba(197, 160, 89, 0.1)",
                  cursor: "pointer",
                  "&:hover img": { transform: "scale(1.1)" },
                }}
              >
                <Box
                  component="img"
                  src={img.url}
                  sx={{
                    width: "100%",
                    height: 260,
                    objectFit: "cover",
                    transition: "transform 0.5s",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1.5,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    {img.user}
                  </Typography>
                  {isAdmin && (
                    <Tooltip title="Eliminar imagen (Admin)" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteReview(img.reviewId);
                        }}
                        sx={{
                          color: "grey.400",
                          p: 0.5,
                          "&:hover": { color: "error.main" },
                        }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Image Lightbox Dialog */}
      <Dialog
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        maxWidth="lg"
        PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none" } }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <IconButton
            onClick={() => setGalleryOpen(false)}
            sx={{ position: "absolute", top: -40, right: 0, color: "white" }}
          >
            <Close />
          </IconButton>
          {selectedGalleryImage && (
            <Box
              component="img"
              src={selectedGalleryImage}
              sx={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reviews Section */}
      <Box sx={{ borderTop: 1, borderColor: "rgba(197, 160, 89, 0.2)", pt: 6 }}>
        <Grid container spacing={6}>
          {/* Form */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Typography
              variant="h6"
              color="secondary.main"
              gutterBottom
              sx={{
                textTransform: "uppercase",
                letterSpacing: 2,
                fontWeight: "bold",
              }}
            >
              Inscribe una Crónica
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              paragraph
              fontStyle="italic"
            >
              Comparte tu experiencia con este artefacto. Tus relatos guían a
              otros aventureros.
            </Typography>

            {user ? (
              <Stack spacing={3} sx={{ mt: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "rgba(197, 160, 89, 0.1)",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "rgba(197, 160, 89, 0.2)",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Publicando como
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="secondary.main"
                    fontWeight="bold"
                  >
                    {user.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    component="legend"
                    variant="caption"
                    color="text.secondary"
                  >
                    Rating
                  </Typography>
                  <Rating
                    value={newReview.rating}
                    onChange={(_, val) =>
                      setNewReview({ ...newReview, rating: val || 5 })
                    }
                    emptyIcon={
                      <Star
                        style={{ opacity: 0.3, color: "grey" }}
                        fontSize="inherit"
                      />
                    }
                  />
                </Box>

                <TextField
                  label="Crónica"
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  value={newReview.text}
                  onChange={(e) =>
                    setNewReview({ ...newReview, text: e.target.value })
                  }
                />

                <Box>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    gutterBottom
                  >
                    Prueba Visual (Opcional)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddAPhoto />}
                    color="secondary"
                    sx={{ textTransform: "none" }}
                  >
                    Adjuntar Imagen
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {newReview.image && (
                    <Box
                      sx={{
                        mt: 1,
                        position: "relative",
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={newReview.image}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setNewReview({ ...newReview, image: null })
                        }
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "white",
                        }}
                      >
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
                  onClick={handleSubmit}
                  disabled={!newReview.text || submittingReview}
                  sx={{ color: "background.default", fontWeight: "bold" }}
                >
                  {submittingReview ? "Inscribiendo..." : "Publicar Crónica"}
                </Button>
              </Stack>
            ) : (
              <Box
                sx={{
                  mt: 3,
                  p: 4,
                  textAlign: "center",
                  bgcolor: "rgba(0,0,0,0.3)",
                  borderRadius: 2,
                  border: 1,
                  borderColor: "rgba(197, 160, 89, 0.2)",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  paragraph
                  fontStyle="italic"
                >
                  Debes iniciar sesión para dejar una crónica.
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setView(ViewState.LOGIN)}
                  sx={{ fontWeight: "bold" }}
                >
                  Iniciar Sesión
                </Button>
              </Box>
            )}
          </Grid>

          {/* Log */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
                pb: 2,
                borderBottom: 1,
                borderColor: "rgba(197, 160, 89, 0.2)",
              }}
            >
              <Typography
                variant="h5"
                color="common.white"
                fontWeight="bold"
                sx={{ fontStyle: "italic" }}
              >
                Registro del Escriba
              </Typography>
              <Typography variant="caption" color="secondary.main">
                {reviews.length} Entradas registradas
              </Typography>
            </Box>

            <Stack spacing={4}>
              {reviewsLoading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography
                    variant="body2"
                    color="grey.500"
                    fontStyle="italic"
                  >
                    Consultando los archivos...
                  </Typography>
                </Box>
              ) : reviews.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography
                    variant="body2"
                    color="grey.500"
                    fontStyle="italic"
                  >
                    Aún no hay crónicas inscritas. ¡Sé el primero en compartir
                    tu experiencia!
                  </Typography>
                </Box>
              ) : (
                reviews.map((review) => (
                  <Paper
                    key={review.id}
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: "background.paper",
                      border: 1,
                      borderColor: "rgba(197, 160, 89, 0.1)",
                      position: "relative",
                    }}
                  >
                    {isAdmin && (
                      <Tooltip title="Eliminar crónica (Admin)" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onDeleteReview(review.id)}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "grey.600",
                            "&:hover": { color: "error.main" },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Avatar
                          src={
                            review.user_avatar?.includes("images/avatars/")
                              ? DEFAULT_AVATAR_URL
                              : review.user_avatar
                          }
                          alt={review.user_name}
                          sx={{
                            bgcolor: "rgba(197, 160, 89, 0.2)",
                            color: "secondary.main",
                            fontWeight: "bold",
                            border: 1,
                            borderColor: "rgba(197, 160, 89, 0.3)",
                          }}
                        >
                          {review.user_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="common.white"
                            fontWeight="bold"
                          >
                            {review.user_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatRelativeDate(review.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Rating
                        value={review.rating}
                        readOnly
                        size="small"
                        emptyIcon={
                          <Star
                            style={{ opacity: 0.3, color: "grey" }}
                            fontSize="inherit"
                          />
                        }
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontStyle="italic"
                      paragraph
                    >
                      "{review.text}"
                    </Typography>
                    {review.image && (
                      <Box
                        component="img"
                        src={review.image}
                        alt="User upload"
                        onClick={() => {
                          setSelectedGalleryImage(review.image);
                          setGalleryOpen(true);
                        }}
                        sx={{
                          height: 100,
                          borderRadius: 1,
                          border: 1,
                          borderColor: "rgba(255,255,255,0.1)",
                          cursor: "pointer",
                          "&:hover": { opacity: 0.8 },
                        }}
                      />
                    )}
                  </Paper>
                ))
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
