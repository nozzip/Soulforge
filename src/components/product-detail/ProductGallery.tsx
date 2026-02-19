import React, { useRef, useEffect, MouseEvent } from "react";
import { Box, Paper, IconButton, Typography, Grid } from "@mui/material";
import { ChevronLeft, ChevronRight, ZoomIn, Close } from "@mui/icons-material";
import { getOptimizedImageUrl } from "../../../utils/imageValidation";
import { Product } from "../../../types";

export interface GalleryView {
  name: string;
  url: string;
  id?: string;
  isGallery?: boolean;
}

interface ProductGalleryProps {
  activeProduct: Product | null;
  displayImageUrl: string | null;
  galleryViews: GalleryView[];
  activeImageIndex: number;
  showZoom: boolean;
  isEditing: boolean;
  onNextImage: (e?: React.MouseEvent) => void;
  onPrevImage: (e?: React.MouseEvent) => void;
  onSelectView: (index: number) => void;
  onZoomStateChange: (show: boolean) => void;
  onRemoveGalleryImage: (url: string) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  activeProduct,
  displayImageUrl,
  galleryViews,
  activeImageIndex,
  showZoom,
  isEditing,
  onNextImage,
  onPrevImage,
  onSelectView,
  onZoomStateChange,
  onRemoveGalleryImage,
}) => {
  const mainImageRef = useRef<HTMLDivElement>(null);
  const zoomLayerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryViews.length <= 1) return;

      if (e.key === "ArrowLeft") {
        onPrevImage();
      } else if (e.key === "ArrowRight") {
        onNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryViews, onNextImage, onPrevImage]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Check if cursor is in navigation gutters (15% each side)
    const isInGutter = galleryViews.length > 1 && (x < 15 || x > 85);

    if (isInGutter) {
      onZoomStateChange(false);
      return;
    }

    if (!showZoom) onZoomStateChange(true);

    // Direct DOM manipulation for performance (avoids re-renders)
    if (zoomLayerRef.current) {
      zoomLayerRef.current.style.backgroundPosition = `${x}% ${y}%`;
    }
  };

  const handleMouseLeave = () => {
    onZoomStateChange(false);
  };

  if (!activeProduct) return null;

  return (
    <Grid size={{ xs: 12, lg: 6 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Main Image Container */}
        <Paper
          elevation={6}
          ref={mainImageRef}
          sx={{
            position: "relative",
            aspectRatio: "1/1",
            bgcolor: "black",
            borderRadius: 2,
            overflow: "hidden",
            cursor: "crosshair",
            border: 1,
            borderColor: "secondary.main",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Actual Image Element (Optimized) */}
          <Box
            component="img"
            src={getOptimizedImageUrl(displayImageUrl || "", 800)}
            alt={activeProduct?.name}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: showZoom ? 0 : 1, // Hide when zooming to show background layer
              transition: "opacity 0.2s",
            }}
          />
          {/* Zoom Layer */}
          <Box
            ref={zoomLayerRef}
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("${getOptimizedImageUrl(displayImageUrl || "", 1200)}")`,
              backgroundPosition: "center", // Initial position
              backgroundSize: showZoom ? "200%" : "contain",
              backgroundRepeat: "no-repeat",
              transition:
                "background-size 0.2s ease-out, background-position 0.1s ease-out",
            }}
          />

          {/* Navigation Gutters & Arrows */}
          {galleryViews.length > 1 && (
            <>
              {/* Left Gutter */}
              <Box
                onClick={onPrevImage}
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "15%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 2,
                  userSelect: "none",
                  "&:hover .nav-arrow": {
                    opacity: 1,
                    color: "primary.main",
                  },
                }}
              >
                <IconButton
                  className="nav-arrow"
                  disableRipple
                  sx={{
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "white",
                    opacity: 0.7,
                    transition: "none",
                    pointerEvents: "none", // Allow click to pass to gutter
                  }}
                >
                  <ChevronLeft />
                </IconButton>
              </Box>

              {/* Right Gutter */}
              <Box
                onClick={onNextImage}
                sx={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: "15%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 2,
                  userSelect: "none",
                  "&:hover .nav-arrow": {
                    opacity: 1,
                    color: "primary.main",
                  },
                }}
              >
                <IconButton
                  className="nav-arrow"
                  disableRipple
                  sx={{
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "white",
                    opacity: 0.7,
                    transition: "none",
                    pointerEvents: "none", // Allow click to pass to gutter
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>
            </>
          )}

          {/* Badges and Hints */}
          {!showZoom && (
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: "rgba(0,0,0,0.6)",
                borderRadius: 4,
                px: 2,
                py: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                backdropFilter: "blur(4px)",
                border: 1,
                borderColor: "rgba(255,255,255,0.1)",
                userSelect: "none",
                pointerEvents: "none",
                zIndex: 3,
              }}
            >
              <ZoomIn sx={{ fontSize: 16, color: "white" }} />
              <Typography
                variant="caption"
                sx={{
                  color: "white",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Mira de cerca para Inspeccionar
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Thumbnails */}
        <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
          {galleryViews.map((view, i) => (
            <Box
              key={i}
              onClick={() => onSelectView(i)}
              sx={{
                width: 80,
                height: 80,
                flexShrink: 0,
                borderRadius: 1,
                border: 1,
                borderColor:
                  i === activeImageIndex ? "secondary.main" : "transparent",
                opacity: i === activeImageIndex ? 1 : 0.5,
                cursor: "pointer",
                overflow: "hidden",
                position: "relative",
                transition: "all 0.2s",
                "&:hover": { opacity: 1, borderColor: "secondary.main" },
              }}
            >
              <Box
                component="img"
                src={getOptimizedImageUrl(view.url, 200)}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  bgcolor: "black",
                }}
              />
              {isEditing && view.isGallery && (
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveGalleryImage(view.url);
                  }}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bgcolor: "error.main", // Solid red
                    color: "white",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "0 0 0 4px",
                    zIndex: 10, // Ensure on top
                    boxShadow: 2,
                    "&:hover": {
                      bgcolor: "error.dark",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Close sx={{ fontSize: 16, fontWeight: "bold" }} />
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Grid>
  );
};
