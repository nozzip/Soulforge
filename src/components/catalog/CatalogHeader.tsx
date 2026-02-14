import React from "react";
import { Box, Typography, FormControl, Select, MenuItem, alpha } from "@mui/material";

interface CatalogHeaderProps {
    count: number;
    sortOption: string;
    onSortChange: (value: string) => void;
}

export const CatalogHeader: React.FC<CatalogHeaderProps> = ({
    count,
    sortOption,
    onSortChange,
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
