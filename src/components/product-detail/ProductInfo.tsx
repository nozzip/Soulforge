import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Stack,
  Button,
  TextField,
  Divider,
  Rating,
  Grid,
  alpha,
  Autocomplete,
  IconButton,
} from "@mui/material";
import {
  Brush,
  AddAPhoto,
  Star,
  Collections,
  Close,
  Build,
  VpnKey,
  Category,
  Person,
  BugReport,
  Gavel,
  Straighten,
  LocalShipping,
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import { Product } from "../../../types";
import { formatProductPrice } from "../../../utils/currency";
import RichTextEditor from "../../../components/Editor/RichTextEditor";
import RichTextDisplay from "../../../components/Editor/RichTextDisplay";
import { BattlemapFootprint } from "./BattlemapFootprint";

// Interface for Review to calculate rating (copied from ProductDetail, consider moving to types)
interface Review {
  id: string;
  rating: number;
}

interface ProductInfoProps {
  activeProduct: Product;
  product: Product | null; // The parent product context (for sets)
  isAdmin: boolean;
  isEditing: boolean;
  editForm: Partial<Product>;
  isSaving: boolean;
  wishlist: string[];
  reviews: Review[];
  averageRating: number;
  onEditToggle: () => void;
  onSave: () => void;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMainImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGalleryImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGalleryImage: (url: string) => void;
  onSetDescription: (content: string) => void; // New prop for RichTextEditor
  onSetCurrentProductId: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (id: string) => void;
  // Specific for Autocomplete updates
  onUpdateEditForm: (field: string, value: any) => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  activeProduct,
  product,
  isAdmin,
  isEditing,
  editForm,
  isSaving,
  wishlist,
  reviews,
  averageRating,
  onEditToggle,
  onSave,
  onEditChange,
  onMainImageUpload,
  onGalleryImageUpload,
  onRemoveGalleryImage,
  onSetDescription,
  onSetCurrentProductId,
  onAddToCart,
  onToggleWishlist,
  onUpdateEditForm,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const isWishlisted = wishlist.includes(activeProduct.id);

  const isValidSet = (name?: string | null): boolean => {
    if (!name) return false;
    const excluded = ["sin set", "s/d", ""];
    return !excluded.includes(name.trim().toLowerCase());
  };

  const handleAddToCartClick = async () => {
    setIsAdding(true);
    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    onAddToCart(activeProduct);
    setIsAdding(false);
  };

  return (
    <Grid size={{ xs: 12, lg: 6 }}>
      <Box sx={{ mb: 1, display: "flex", gap: 2, alignItems: "center" }}>
        <Chip
          label={`Escala ${activeProduct.size || "M"}`}
          variant="outlined"
          color="primary"
          size="small"
          sx={{ fontWeight: "bold" }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ letterSpacing: 1 }}
        >
          REF: {activeProduct.category.toUpperCase()}-
          {activeProduct.id.slice(0, 8).toUpperCase()}
        </Typography>
      </Box>

      {isAdmin && (
        <Paper
          sx={{
            mb: 3,
            p: 2,
            bgcolor: (t) => alpha(t.palette.secondary.main, 0.05),
            border: 1,
            borderStyle: "dashed",
            borderColor: "secondary.main",
            borderRadius: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              variant="caption"
              sx={{
                color: "secondary.main",
                fontWeight: "bold",
                letterSpacing: 1,
              }}
            >
              CONTROLES DEL ALTO SUPERVISOR
            </Typography>
            <Stack direction="row" spacing={1}>
              {!isEditing ? (
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<Brush />}
                  onClick={onEditToggle}
                >
                  Editar Pergamino
                </Button>
              ) : (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={onSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    onClick={onEditToggle}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Paper>
      )}

      {isEditing ? (
        <Stack spacing={2} sx={{ mb: 2 }}>
          {/* Image Upload Input */}
          <Box
            sx={{
              p: 2,
              border: "1px dashed grey",
              borderRadius: 1,
              textAlign: "center",
            }}
          >
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="product-image-upload"
              type="file"
              onChange={onMainImageUpload}
              disabled={isSaving}
            />
            <label htmlFor="product-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AddAPhoto />}
                disabled={isSaving}
              >
                Cambiar Imagen del Artefacto
              </Button>
            </label>
            {editForm.image && (
              <Typography
                variant="caption"
                display="block"
                sx={{ mt: 1, color: "success.main" }}
              >
                Nueva imagen cargada y lista para guardar.
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            name="name"
            label="Nombre del Artefacto (Individual)"
            value={editForm.name}
            onChange={onEditChange}
          />
          <TextField
            fullWidth
            name="set_name"
            label="Nombre del Set (Grupo)"
            value={editForm.set_name || ""}
            onChange={onEditChange}
            placeholder="Ej: Warriors of the North"
            helperText="Si asignas un nombre aquí, este producto se agrupará con otros que tengan el mismo nombre de set."
          />
        </Stack>
      ) : (
        <Box sx={{ mb: 2, minHeight: "6rem" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              fontStyle: "italic",
              color: "common.white",
              lineHeight: 1.2,
            }}
          >
            {activeProduct.name.replace(/\s*Header\s*/gi, "").trim()}
          </Typography>
          {isValidSet(activeProduct.set_name) && (
            <Typography
              variant="subtitle1"
              sx={{
                color: "secondary.main",
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
                mt: 1,
                opacity: 0.8,
              }}
            >
              Explorando el Set: {activeProduct.set_name}
            </Typography>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          mb: 4,
          pb: 4,
          borderBottom: 1,
          borderColor: "rgba(197, 160, 89, 0.1)",
        }}
      >
        {isEditing ? (
          <TextField
            name="price"
            type="number"
            label="Precio (GP)"
            value={editForm.price}
            onChange={onEditChange}
            size="small"
            sx={{ width: 120 }}
          />
        ) : (
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "secondary.main" }}
          >
            {formatProductPrice(activeProduct)}
          </Typography>
        )}
        <Divider orientation="vertical" flexItem sx={{ bgcolor: "grey.800" }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Rating
            value={averageRating}
            readOnly
            precision={0.5}
            emptyIcon={
              <Star
                style={{ opacity: 0.3, color: "grey" }}
                fontSize="inherit"
              />
            }
          />
          <Typography variant="caption" color="text.secondary">
            ({reviews.length} Reviews)
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 5 }}>
        <Typography
          variant="overline"
          color="secondary.main"
          fontWeight="bold"
          letterSpacing={2}
          display="block"
          gutterBottom
        >
          Lore y Descripción
        </Typography>
        {isEditing ? (
          <Box sx={{ mt: 1 }}>
            <RichTextEditor
              content={editForm.description || ""}
              onChange={onSetDescription}
              placeholder="Escribe el lore de este artefacto..."
            />
          </Box>
        ) : (
          <Box
            sx={{
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3),
              p: 3,
              borderRadius: 2,
              border: 1,
              borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
            }}
          >
            <RichTextDisplay
              content={
                activeProduct.description ||
                "Un raro artefacto recuperado de las mazmorras más profundas. Los detalles de su origen están envueltos en misterio, pero su artesanía es innegable."
              }
              sx={{
                opacity: 0.9,
                minHeight: "100px",
                textAlign: "justify",
                lineHeight: 2,
                fontFamily: '"Newsreader", serif',
                "& p": { margin: 0, mb: 2 },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Gallery Images Management (Admin) */}
      {isEditing && (
        <Box sx={{ mb: 4, p: 2, border: "1px dashed grey", borderRadius: 1 }}>
          <Typography variant="subtitle2" color="secondary" gutterBottom>
            Galería de Vistas Adicionales
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            {editForm.gallery_images?.map((url, index) => (
              <Box
                key={index}
                sx={{ position: "relative", width: 80, height: 80 }}
              >
                <img
                  src={url}
                  alt={`Gallery ${index}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    bgcolor: "error.main",
                    color: "white",
                    "&:hover": { bgcolor: "error.dark" },
                  }}
                  onClick={() => onRemoveGalleryImage(url)}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <input
            accept="image/*"
            style={{ display: "none" }}
            id="gallery-image-upload"
            type="file"
            onChange={onGalleryImageUpload}
            disabled={isSaving}
          />
          <label htmlFor="gallery-image-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<Collections />}
              size="small"
              disabled={isSaving}
            >
              Agregar Vista Adicional
            </Button>
          </label>
        </Box>
      )}

      {/* Unit Composition as Chips */}
      {product?.subItems && product.subItems.length > 0 && (
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {/* Header Chip (Principal) */}
          <Chip
            label={product.name.replace(/\s*Header\s*/gi, "").trim()}
            onClick={() => onSetCurrentProductId(product.id)}
            variant={activeProduct.id === product.id ? "filled" : "outlined"}
            color="secondary"
            sx={{
              fontFamily: "Cinzel",
              fontWeight: "bold",
              boxShadow:
                activeProduct.id === product.id
                  ? (theme) =>
                    `0 0 15px ${alpha(theme.palette.secondary.main, 0.3)}`
                  : "none",
            }}
          />
          {/* Other Set Members */}
          {product.subItems.map((item) => (
            <Chip
              key={item.id}
              label={item.name}
              onClick={() => onSetCurrentProductId(item.id)}
              variant={activeProduct.id === item.id ? "filled" : "outlined"}
              color="secondary"
              sx={{
                fontFamily: "Cinzel",
                fontWeight: 600,
                boxShadow:
                  activeProduct.id === item.id
                    ? (theme) =>
                      `0 0 15px ${alpha(theme.palette.secondary.main, 0.3)}`
                    : "none",
              }}
            />
          ))}
        </Box>
      )}

      <BattlemapFootprint size={activeProduct.size || "Medium"} />
      {isEditing && (
        <Box sx={{ mt: 3, mb: 3 }}>
          <TextField
            fullWidth
            name="designer"
            label="Gran Maestro (Diseñador)"
            value={editForm.designer}
            onChange={onEditChange}
            size="small"
          />
        </Box>
      )}

      {/* Specs */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          bgcolor: "transparent",
          borderColor: "rgba(197, 160, 89, 0.1)",
        }}
      >
        <Typography
          variant="overline"
          color="common.white"
          fontWeight="bold"
          letterSpacing={2}
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Build fontSize="small" color="secondary" /> Especificaciones Técnicas
        </Typography>
        <Grid container spacing={2}>
          {[
            {
              label: "Identificador",
              value: `#${activeProduct.id.slice(0, 8)}`,
              icon: <VpnKey fontSize="small" />,
              editableField: null,
            },
            {
              label: "Categoría",
              value: activeProduct.category,
              icon: <Category fontSize="small" />,
              editableField: "category",
            },
            {
              label: "Gran Maestro",
              value: activeProduct.designer,
              icon: <Person fontSize="small" />,
              editableField: "designer",
            },
            {
              label: "Especie",
              value: activeProduct.creature_type,
              icon: <BugReport fontSize="small" />,
              editableField: "creature_type",
            },
            {
              label: "Arsenales",
              value: activeProduct.weapon,
              icon: <Gavel fontSize="small" />,
              editableField: "weapon",
            },
            {
              label: "Universo",
              value: activeProduct.universe,
              icon: <Collections fontSize="small" />,
              editableField: "universe",
            },
            {
              label: "Escala Comandante",
              value: activeProduct.size,
              icon: <Straighten fontSize="small" />,
              editableField: "size",
            },
          ].map((spec, i) => {
            const isEditable = isEditing && spec.editableField;

            // Get unique options for this field if it's editable
            // Performance: Disable client-side autocomplete from full product list
            const options: string[] = [];

            return (
              <Grid key={i} size={{ xs: 6, sm: 4 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      color: "secondary.main",
                      display: "flex",
                      mt: isEditable ? 1 : 0,
                    }}
                  >
                    {spec.icon}
                  </Box>
                  <Box sx={{ width: "100%" }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                    >
                      {spec.label}
                    </Typography>

                    {isEditable ? (
                      <Autocomplete
                        freeSolo
                        options={options}
                        value={
                          editForm[spec.editableField as keyof Product] || ""
                        }
                        onChange={(event, newValue) => {
                          onUpdateEditForm(spec.editableField!, newValue);
                        }}
                        onInputChange={(event, newInputValue) => {
                          onUpdateEditForm(spec.editableField!, newInputValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            variant="standard"
                            size="small"
                            sx={{
                              input: {
                                color: "common.white",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                              },
                            }}
                          />
                        )}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "common.white" }}
                      >
                        {spec.value || "Desconocido"}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "flex-start" }}>
        <LocalShipping fontSize="small" color="secondary" />
        <Typography variant="caption" color="text.secondary" fontStyle="italic">
          Embalado con encantamientos protectores (plástico de burbujas) para
          asegurar su llegada a salvo.
        </Typography>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          size="large"
          fullWidth
          disabled={isAdding}
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCartClick}
          sx={{ py: 2, fontSize: "1.1rem", mb: 2 }}
        >
          {isAdding ? "Añadiendo..." : "Añadir al Carrito"}
        </Button>
        <Button
          variant="text"
          fullWidth
          startIcon={
            isWishlisted ? (
              <Favorite sx={{ color: "primary.main" }} />
            ) : (
              <FavoriteBorder />
            )
          }
          onClick={() => onToggleWishlist(activeProduct.id)}
          sx={{ py: 1 }}
        >
          {isWishlisted ? "En Lista de Deseos" : "Añadir a Deseos"}
        </Button>
      </Box>
    </Grid>
  );
};
