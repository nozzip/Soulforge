import React from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import { Product } from "../../../types";
import { formatProductPrice } from "../../../utils/currency";

interface RelatedProductsProps {
  relatedProducts: Product[];
  onProductClick: (id: string) => void;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  relatedProducts,
  onProductClick,
}) => {
  if (relatedProducts.length === 0) return null;

  return (
    <Box sx={{ mb: 10, mt: 8 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Divider sx={{ flex: 1, borderColor: "rgba(197, 160, 89, 0.2)" }} />
        <Typography
          variant="h5"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 3,
            fontWeight: "bold",
            fontStyle: "italic",
            color: "common.white",
          }}
        >
          Artefactos Relacionados
        </Typography>
        <Divider sx={{ flex: 1, borderColor: "rgba(197, 160, 89, 0.2)" }} />
      </Box>
      <Grid container spacing={3}>
        {relatedProducts.map((p) => (
          <Grid key={p.id} size={{ xs: 12, md: 4 }}>
            <Card
              onClick={() => onProductClick(p.id)}
              sx={{
                bgcolor: "background.paper",
                border: 1,
                borderColor: "rgba(197, 160, 89, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "secondary.main",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="250"
                image={p.image}
                alt={p.name}
                sx={{
                  opacity: 0.8,
                  objectFit: "contain",
                  bgcolor: "black",
                }}
              />
              <CardContent>
                <Typography variant="h6" color="common.white" fontWeight="bold">
                  {p.name}
                </Typography>
                <Typography variant="body2" color="secondary">
                  {formatProductPrice(p)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
