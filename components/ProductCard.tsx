import React from "react";
import { Product } from "../types";
import { formatCurrency } from "../utils/currency.tsx";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Tooltip,
  alpha,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Add,
  Favorite,
  FavoriteBorder,
  Delete,
  LinkOff,
  Layers,
} from "@mui/icons-material";

export interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  isAdmin: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  isGroupingMode?: boolean;
  isUngroupingMode?: boolean;
  onProductClick: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onUngroup?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  isAdmin,
  isDragging = false,
  isDropTarget = false,
  isGroupingMode = false,
  isUngroupingMode = false,
  onProductClick,
  onToggleWishlist,
  onAddToCart,
  onDeleteProduct,
  onUngroup,
}) => {
  const theme = useTheme();
  const hasSet = product.set_name && product.set_name !== "Sin set";
  const isSet = product.subItems && product.subItems.length > 0; // Renamed from hasSubItems to isSet as per user's diff

  return (
    <Card
      onClick={() =>
        !isGroupingMode && !isUngroupingMode && onProductClick(product.id)
      }
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.8)})`,
        border: isDropTarget ? 3 : 1,
        borderStyle: isDropTarget ? "dashed" : "solid",
        borderColor: isDropTarget
          ? theme.palette.secondary.main
          : isDragging
            ? theme.palette.primary.main
            : isUngroupingMode && hasSet
              ? theme.palette.error.main
              : alpha(theme.palette.secondary.main, 0.2),
        transition: "all 0.3s",
        cursor: isGroupingMode
          ? "grab"
          : isUngroupingMode
            ? "default"
            : "pointer",
        boxShadow: isDragging
          ? `0 20px 40px ${alpha(theme.palette.primary.main, 0.4)}`
          : `0 4px 20px ${alpha(theme.palette.common.black, 0.4)}`,
        opacity: isDragging ? 0.6 : 1,
        transform: isDragging ? "scale(1.02) rotate(2deg)" : "none",
        backgroundColor: isDropTarget
          ? alpha(theme.palette.secondary.main, 0.05)
          : undefined,
        "&:hover":
          !isGroupingMode && !isUngroupingMode
            ? {
                borderColor: "secondary.main",
                transform: "translateY(-4px)",
                boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.6)}, 0 0 20px ${alpha(theme.palette.secondary.main, 0.2)}`,
              }
            : {},
      }}
    >
      <Box
        sx={{
          position: "relative",
          pt: "100%",
          borderBottom: 1,
          borderColor: "common.black",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${product.image}")`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundColor: "#000", // Ensure decent background for letterboxing
            transition: "transform 0.5s",
            "&:hover":
              !isGroupingMode && !isUngroupingMode
                ? { transform: "scale(1.05)" }
                : {},
          }}
        />

        {/* Wishlist Button */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          disabled={isUngroupingMode}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: isWishlisted
              ? "primary.main"
              : alpha(theme.palette.common.black, 0.6),
            color: isWishlisted ? "white" : "secondary.main",
            "&:hover": {
              bgcolor: "secondary.main",
              color: "background.default",
            },
            display: isUngroupingMode ? "none" : "flex",
          }}
        >
          {isWishlisted ? (
            <Favorite fontSize="small" />
          ) : (
            <FavoriteBorder fontSize="small" />
          )}
        </IconButton>

        {/* Ungroup Button - Admin only, when in Ungrouping Mode */}
        {isAdmin && hasSet && isUngroupingMode && (
          <Tooltip title="Desagrupar (Quitar del set)" arrow>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                if (
                  window.confirm(
                    `¿Quieres sacar a "${product.name}" del set "${product.set_name}"?`,
                  )
                ) {
                  onUngroup?.(product.id);
                }
              }}
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                bgcolor: alpha(theme.palette.error.main, 0.9),
                color: "white",
                width: 40,
                height: 40,
                zIndex: 10,
                boxShadow: 3,
                "&:hover": { bgcolor: "error.main", transform: "scale(1.1)" },
              }}
            >
              <LinkOff fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Set Badge - Show when product has subItems (is grouped) */}
        {isSet && (
          <Chip
            icon={<Layers sx={{ fontSize: 14 }} />}
            label={`${(product.subItems?.length || 0) + 1} items`}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(4px)",
              fontWeight: "bold",
              fontSize: "0.7rem",
              "& .MuiChip-icon": { color: "secondary.main" },
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography
          variant="h6"
          gutterBottom
          noWrap
          sx={{
            fontWeight: "bold",
            fontFamily: "Cinzel",
            color: "common.white",
            mb: 0,
          }}
        >
          {product.name.replace(/\s*Header\s*/gi, "").trim()}
        </Typography>
        <Typography
          variant="caption"
          color="primary.main"
          sx={{
            display: "block",
            mb: 1,
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: "0.7rem",
          }}
        >
          {product.designer
            ? `Diseñado por ${product.designer}`
            : "Forja Original"}
        </Typography>
        <Typography
          variant="body2"
          color="grey.500"
          sx={{ fontStyle: "italic" }}
        >
          {product.size || "Sin tamaño"} • {product.category}
          {hasSet && ` • ${product.set_name}`}
        </Typography>
      </CardContent>

      <CardActions
        sx={{
          justifyContent: "space-between",
          px: 2,
          pt: 0,
          pb: 2,
          borderTop: "1px dashed",
          borderColor: alpha(theme.palette.common.white, 0.1),
          mt: 2,
        }}
      >
        <Typography
          variant="h6"
          color="secondary.main"
          sx={{ fontWeight: "bold" }}
        >
          {formatCurrency(product.price)}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isAdmin && onDeleteProduct && !isGroupingMode && (
            <Tooltip title="Eliminar del Archivo" arrow>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      `¿Estás seguro de eliminar "${product.name}"? Esta acción es irreversible.`,
                    )
                  ) {
                    onDeleteProduct(product.id);
                  }
                }}
                sx={{
                  color: "error.main",
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  "&:hover": { bgcolor: "error.main", color: "white" },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {!isGroupingMode && (
            <Tooltip title="Añadir al Tesoro" arrow>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                color="primary"
                sx={{
                  bgcolor: "primary.dark",
                  color: "white",
                  width: 40,
                  height: 40,
                  boxShadow: 3,
                  "&:hover": {
                    bgcolor: "primary.main",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Add />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};
