import React from "react";
import { Product } from "../types";
import { formatProductPrice } from "../utils/currency.tsx";
import { getOptimizedImageUrl } from "../utils/imageValidation";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Tooltip,
  Badge,
  alpha,
  Chip,
  useTheme,
  Skeleton,
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
  cartCount?: number;
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
  cartCount = 0,
}) => {
  const theme = useTheme();
  const hasSet = product.set_name && product.set_name !== "Sin set";
  const isSet = product.subItems && product.subItems.length > 0;
  // member_count comes from the RPC grouping query; fallback to subItems count
  const memberCount =
    product.member_count || (isSet ? product.subItems!.length + 1 : 1);

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
          component="img"
          src={getOptimizedImageUrl(product.image, 300)}
          alt={product.name}
          width="300"
          height="300"
          loading="lazy"
          decoding="async"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            backgroundColor: "#000",
            transition: "transform 0.5s",
            zIndex: 0,
            "&:hover":
              !isGroupingMode && !isUngroupingMode
                ? { transform: "scale(1.05)" }
                : {},
          }}
          />
        </Box>

        {/* Wishlist Button */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          disabled={isUngroupingMode}
          aria-label={isWishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
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

        {/* Set Badge - Show item count when product is grouped or has subItems */}
        {memberCount > 1 && (
          <Chip
            icon={<Layers sx={{ fontSize: 14 }} />}
            label={`${memberCount} items`}
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
            mb: 0.5,
          }}
        >
          {product.name.replace(/\s*Header\s*/gi, "").trim()}
        </Typography>
        {hasSet && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "secondary.main",
              fontWeight: 600,
              textTransform: "uppercase",
              fontSize: "0.65rem",
              letterSpacing: 1,
              mb: 1,
            }}
          >
            Set: {product.set_name}
          </Typography>
        )}
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
          {formatProductPrice(product)}
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
                aria-label={`Eliminar ${product.name} del archivo`}
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
                aria-label={`Añadir ${product.name} al carrito`}
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
                <Badge
                  badgeContent={cartCount}
                  color="secondary"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.65rem",
                      minWidth: 16,
                      height: 16,
                      p: 0,
                    },
                  }}
                >
                  <Add />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export const ProductCardSkeleton = () => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        sx={{ pt: "100%", bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
        animation="wave"
      />
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Skeleton
          variant="text"
          width="80%"
          height={32}
          sx={{ mb: 1 }}
          animation="wave"
        />
        <Skeleton variant="text" width="40%" height={20} animation="wave" />
        <Skeleton variant="text" width="60%" height={20} animation="wave" />
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, justifyContent: "space-between" }}>
        <Skeleton variant="text" width="30%" height={32} animation="wave" />
        <Skeleton variant="circular" width={40} height={40} animation="wave" />
      </CardActions>
    </Card>
  );
};
