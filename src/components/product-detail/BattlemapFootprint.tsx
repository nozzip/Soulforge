import React, { useMemo } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Grid4x4 } from "@mui/icons-material";

export const BattlemapFootprint = ({ size }: { size: string }) => {
  const footprintSize = useMemo(() => {
    const s = size.toLowerCase();
    if (
      s.includes("mediano") ||
      s.includes("pequeño") ||
      s.includes("medium") ||
      s.includes("small")
    )
      return 1;
    if (s.includes("grande") || s.includes("large")) return 2;
    if (s.includes("enorme") || s.includes("huge")) return 3;
    if (s.includes("gargantuesco") || s.includes("gargantuan")) return 4;
    if (s.includes("colosal") || s.includes("colossal")) return 5;
    return 1;
  }, [size]);

  const totalSquares = footprintSize * footprintSize;

  return (
    <Box
      sx={{
        mb: 5,
        p: 3,
        bgcolor: "rgba(0,0,0,0.4)",
        border: 1,
        borderColor: "rgba(197, 160, 89, 0.2)",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        gap: 3,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Visual Grid */}
      <Box
        sx={{
          position: "relative",
          width: 128,
          height: 128,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "rgba(197, 160, 89, 0.1)",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gridTemplateRows: "repeat(5, 1fr)",
          flexShrink: 0,
        }}
      >
        {[...Array(25)].map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          // Center the footprint
          const offset = Math.floor((5 - footprintSize) / 2);
          const isActive =
            row >= offset &&
            row < offset + footprintSize &&
            col >= offset &&
            col < offset + footprintSize;

          return (
            <Box
              key={i}
              sx={{
                border: "0.5px solid rgba(197, 160, 89, 0.05)",
                transition: "background-color 0.7s",
                bgcolor: isActive
                  ? "rgba(var(--color-primary), 0.5)"
                  : "transparent", // Simulate primary/50
                boxShadow: isActive
                  ? "inset 0 0 10px var(--color-primary)"
                  : "none",
              }}
            />
          );
        })}
        {/* Footprint Indicator */}
        <Box
          sx={{
            position: "absolute",
            border: 2,
            borderColor: "primary.main",
            boxShadow: "0 0 15px var(--color-primary)",
            borderRadius: "2px",
            pointerEvents: "none",
            transition: "all 0.5s",
            width: `${(footprintSize / 5) * 100}%`,
            height: `${(footprintSize / 5) * 100}%`,
            top: `${(Math.floor((5 - footprintSize) / 2) / 5) * 100}%`,
            left: `${(Math.floor((5 - footprintSize) / 2) / 5) * 100}%`,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "primary.main",
              opacity: 0.2,
              animation: "pulse 2s infinite",
            }}
          />
        </Box>
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: "grey.500",
            fontWeight: "bold",
            letterSpacing: 2,
            mb: 0.5,
          }}
        >
          Huella Táctica
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: "common.white" }}
          >
            {totalSquares}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "secondary.main",
              opacity: 0.6,
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            CUADRADOS OCUPADOS
          </Typography>
        </Box>
        <Stack spacing={0.5}>
          <Typography
            variant="caption"
            sx={{ color: "grey.400", fontStyle: "italic" }}
          >
            Este artefacto de escala {size} ocupa una presencia de{" "}
            <Box
              component="span"
              sx={{ color: "secondary.main", fontWeight: "bold" }}
            >
              {footprintSize}x{footprintSize}
            </Box>{" "}
            en una cuadrícula táctica estándar de 1".
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "primary.main",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "primary.main",
                fontWeight: "bold",
              }}
            >
              Precisión de Escala Confirmada
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Texture Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          p: 2,
          opacity: 0.05,
          pointerEvents: "none",
        }}
      >
        <Grid4x4 sx={{ fontSize: 60 }} />
      </Box>
    </Box>
  );
};
