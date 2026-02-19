import React from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  alpha,
} from "@mui/material";

interface CatalogHeaderProps {
  count: number;
  sortOption: string;
  onSortChange: (value: string) => void;
  isAdmin?: boolean;
  isUngroupingMode?: boolean;
  onToggleUngroupingMode?: () => void;
}

export const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  count,
  sortOption,
  onSortChange,
  isAdmin,
  isUngroupingMode,
  onToggleUngroupingMode,
}) => {
  return (
    <Box
      sx={{
        mb: 4,
        pb: 2,
        borderBottom: 1,
        borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {isAdmin && onToggleUngroupingMode && (
          <Box sx={{ mr: 2 }}>
            <FormControl size="small">
              {/* Simple toggle/button for ungrouping mode */}
              {/* Using a Button for clarity */}
              <Typography
                variant="button"
                onClick={onToggleUngroupingMode}
                sx={{
                  cursor: "pointer",
                  color: isUngroupingMode ? "error.main" : "text.secondary",
                  border: 1,
                  borderColor: isUngroupingMode
                    ? "error.main"
                    : "text.secondary",
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  "&:hover": {
                    bgcolor: (t) =>
                      alpha(
                        isUngroupingMode
                          ? t.palette.error.main
                          : t.palette.text.secondary,
                        0.1,
                      ),
                  },
                }}
              >
                {isUngroupingMode
                  ? "Modo Desagrupar: ACTIVO"
                  : "Modo Desagrupar"}
              </Typography>
            </FormControl>
          </Box>
        )}
        <Typography variant="body2" sx={{ color: "grey.500" }}>
          Mostrando {count} Artefactos
        </Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            variant="outlined"
            sx={{
              color: "common.white",
              bgcolor: "rgba(0,0,0,0.2)",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: (theme) =>
                  alpha(theme.palette.secondary.main, 0.3),
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: (theme) =>
                  alpha(theme.palette.secondary.main, 0.6),
              },
              ".MuiSvgIcon-root": { color: "secondary.main" },
            }}
          >
            <MenuItem value="newest">Ordenar por: Más reciente</MenuItem>
            <MenuItem value="price-asc">Precio: Menor a Mayor</MenuItem>
            <MenuItem value="price-desc">Precio: Mayor a Menor</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};
