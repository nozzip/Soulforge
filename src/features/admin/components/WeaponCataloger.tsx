import React, { useState, useEffect, useMemo, KeyboardEvent } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Chip,
  TextField,
  Stack,
  alpha,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
} from "@mui/material";
import {
  CheckCircle,
  SkipNext,
  Save,
  Hardware,
  ImageNotSupported,
  Add,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import { Product } from "@/types";
import { useCatalogMetadata } from "@/src/hooks/useCatalogMetadata";
import { calculateDynamicPrice } from "@/utils/pricing";
import { useTheme } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";

export const WeaponCataloger: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: metadata } = useCatalogMetadata();
  const existingWeapons = useMemo(() => metadata?.weapons || [], [metadata]);

  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customWeapon, setCustomWeapon] = useState("");

  // Local state for the current product's fields
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);
  const [grade, setGrade] = useState("C");
  const [size, setSize] = useState("Medium");
  const [name, setName] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    // Fetch products missing basic info, excluding statues
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .not("creature_type", "ilike", "%Statue%")
      .or(
        'weapon.is.null,weapon.eq."",grade.is.null,grade.eq."",size.is.null,size.eq.""',
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products for cataloger:", error);
    } else if (data) {
      // Filter out Terrains that already have Grade and Size (they don't need weapons)
      const filtered = data.filter((p) => {
        const isTerrain = p.creature_type?.toLowerCase().includes("terrain");
        if (isTerrain) {
          // If it's terrain, we only care if grade or size is missing
          return !p.grade || p.grade === "" || !p.size || p.size === "";
        }
        // For others, keep the original "any missing" logic
        return true;
      });
      setProducts(filtered);
    }
    setLoading(false);
  };

  const currentProduct = products[currentIndex];

  useEffect(() => {
    if (currentProduct) {
      const initialWeapons = currentProduct.weapon
        ? currentProduct.weapon
            .split(",")
            .map((w) => w.trim())
            .filter(Boolean)
        : [];
      setSelectedWeapons(initialWeapons);

      // Terrain Rule: Auto-assign M-G and Grade C
      const isTerrain = currentProduct.creature_type
        ?.toLowerCase()
        .includes("terrain");

      if (isTerrain && (!currentProduct.grade || !currentProduct.size)) {
        setGrade("C");
        setSize("Medium - Gargantuan");
      } else {
        setGrade(currentProduct.grade || "C");
        setSize(currentProduct.size || "Medium");
      }
      setName(currentProduct.name || "");
    }
  }, [currentProduct]);

  // All unique weapons available to click (combining existing + whatever is selected)
  const availableChips = useMemo(() => {
    const combined = new Set([...existingWeapons, ...selectedWeapons]);
    return Array.from(combined).sort();
  }, [existingWeapons, selectedWeapons]);

  const toggleWeapon = (weapon: string) => {
    setSelectedWeapons((prev) =>
      prev.includes(weapon)
        ? prev.filter((w) => w !== weapon)
        : [...prev, weapon],
    );
  };

  const handleAddCustomWeapon = () => {
    const val = customWeapon.trim();
    if (val && !selectedWeapons.includes(val)) {
      setSelectedWeapons((prev) => [...prev, val]);
      setCustomWeapon("");
    }
  };

  const handleCustomWeaponKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomWeapon();
    }
  };

  const handleSaveAndNext = async () => {
    if (!currentProduct) return;

    setSaving(true);
    const weaponString = selectedWeapons.join(", ");

    // Calculate final price for persistence
    const finalPrice = calculateDynamicPrice(
      size,
      grade,
      currentProduct.creature_type || "",
    );

    const isTerrain = currentProduct.creature_type
      ?.toLowerCase()
      .includes("terrain");

    // For Terrains, if no weapons selected, mark as "N/A" so it's considered cataloged in DB
    const finalWeaponString =
      isTerrain && weaponString === "" ? "N/A" : weaponString;

    const { error } = await supabase
      .from("products")
      .update({
        name: name,
        weapon: finalWeaponString,
        grade: grade,
        size: size,
        price: finalPrice,
        min_price: finalPrice,
        max_price: finalPrice,
      })
      .eq("id", currentProduct.id);

    if (error) {
      console.error("Error updating product:", error);
      alert("Error al guardar: " + error.message);
      setSaving(false);
      return;
    }

    // Invalidate catalog metadata to pick up potentially new weapons
    await queryClient.invalidateQueries({ queryKey: ["catalog-metadata"] });

    // Move to next
    if (currentIndex < products.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Re-fetch if we reached the end
      await fetchProducts();
      setCurrentIndex(0);
    }
    setSaving(false);
  };

  const handleSkip = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleDelete = async () => {
    if (!currentProduct) return;

    if (
      !window.confirm(
        `¿Estás seguro de eliminar "${currentProduct.name}"? Esta acción es irreversible.`,
      )
    ) {
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", currentProduct.id);

    if (error) {
      console.error("Error deleting product:", error);
      alert("Error al eliminar: " + error.message);
      setSaving(false);
      return;
    }

    // Remove from local state
    const newProducts = products.filter((p) => p.id !== currentProduct.id);
    setProducts(newProducts);

    // Stay at same index unless we were at the last one
    if (currentIndex >= newProducts.length && currentIndex > 0) {
      setCurrentIndex(newProducts.length - 1);
    } else if (newProducts.length === 0) {
      // If none left, fetch new
      await fetchProducts();
      setCurrentIndex(0);
    }

    setSaving(false);
  };

  const handlePurgeWeapon = async (weapon: string) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar el arsenal "${weapon}" de TODA la base de datos? Esta acción es irreversible.`,
      )
    ) {
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("purge_weapon", {
      target_weapon: weapon,
    });

    if (error) {
      console.error("Error purging weapon:", error);
      alert("Error al purgar arsenal: " + error.message);
    } else {
      // Refresh metadata and clean local state
      await queryClient.invalidateQueries({ queryKey: ["catalog-metadata"] });
      setSelectedWeapons((prev) => prev.filter((w) => w !== weapon));
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6" color="text.secondary">
          No se encontraron productos para catalogar.
        </Typography>
      </Box>
    );
  }

  const progress = Math.round((currentIndex / products.length) * 100);
  const currentPrice = calculateDynamicPrice(
    size,
    grade,
    currentProduct.creature_type || "",
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h6"
          color="secondary.main"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Hardware /> Maestría de Forja (Catalogador)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Producto {currentIndex + 1} de {products.length} ({progress}%)
        </Typography>
      </Box>

      <Paper
        sx={{
          p: 0,
          border: 1,
          borderColor: (theme) => alpha(theme.palette.secondary.main, 0.3),
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          bgcolor: "background.paper",
        }}
      >
        {/* Left: Image */}
        <Box
          sx={{
            width: { xs: "100%", md: "40%" },
            minHeight: 300,
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.4),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {currentProduct.image ? (
            <Box
              component="img"
              src={currentProduct.image}
              alt={currentProduct.name}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                maxHeight: 500,
              }}
              onError={(e: any) => {
                e.target.src =
                  "https://dummyimage.com/600x400/222/fff&text=Imagen+No+Disponible";
              }}
            />
          ) : (
            <ImageNotSupported sx={{ fontSize: 60, color: "text.secondary" }} />
          )}
        </Box>

        {/* Right: Controls */}
        <Box
          sx={{
            p: 4,
            width: { xs: "100%", md: "60%" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box mb={3}>
            <TextField
              fullWidth
              variant="standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del producto"
              InputProps={{
                disableUnderline: false,
                sx: {
                  fontSize: "2.125rem",
                  fontWeight: "bold",
                  color: "white",
                  mb: 1,
                  "& input": {
                    padding: 0,
                  },
                },
              }}
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle1" color="text.secondary">
                Tipo: {currentProduct.creature_type || "Desconocido"}
              </Typography>
              <Chip
                label={`Precio sugerido: ${currentPrice} GP`}
                color="secondary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            </Stack>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="grade-label">Grado (Rareza)</InputLabel>
                  <Select
                    labelId="grade-label"
                    label="Grado (Rareza)"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    <MenuItem value="C">Común (C)</MenuItem>
                    <MenuItem value="R">Raro (R)</MenuItem>
                    <MenuItem value="L">Legendario (L)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="size-label">Tamaño / Escala</InputLabel>
                  <Select
                    labelId="size-label"
                    label="Tamaño / Escala"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  >
                    <MenuItem value="Small">Small</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Large">Large</MenuItem>
                    <MenuItem value="Huge">Huge</MenuItem>
                    <MenuItem value="Gargantuan">Gargantuan</MenuItem>
                    <MenuItem value="Medium - Gargantuan">
                      Medium - Gargantuan (Terrain)
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 3, opacity: 0.1 }} />

          {!currentProduct.creature_type?.toLowerCase().includes("terrain") && (
            <>
              <Typography
                variant="subtitle2"
                color="secondary.main"
                gutterBottom
                sx={{ textTransform: "uppercase", letterSpacing: 1 }}
              >
                Armas & Equipo (Arsenal)
              </Typography>

              <Box
                sx={{
                  mb: 4,
                  border: 1,
                  borderColor: (theme) => alpha(theme.palette.divider, 0.2),
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.common.black, 0.3),
                  overflow: "hidden",
                }}
              >
                <Box
                  onWheel={(e) => e.stopPropagation()}
                  sx={{
                    maxHeight: 240,
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    p: 2,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    alignContent: "flex-start",
                    /* Custom Scrollbar for visibility */
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      bgcolor: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.secondary.main, 0.3),
                      borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      bgcolor: "secondary.main",
                    },
                  }}
                >
                  {availableChips.length > 0 ? (
                    availableChips.map((weapon) => {
                      const isSelected = selectedWeapons.includes(weapon);
                      // Only show delete icon for weapons that actually exist in the DB (metadata)
                      const isPersisted = existingWeapons.includes(weapon);

                      return (
                        <Chip
                          key={weapon}
                          label={weapon}
                          onClick={() => toggleWeapon(weapon)}
                          onDelete={
                            isPersisted
                              ? () => handlePurgeWeapon(weapon)
                              : undefined
                          }
                          deleteIcon={<DeleteIcon />}
                          color={isSelected ? "secondary" : "default"}
                          variant={isSelected ? "filled" : "outlined"}
                          sx={{
                            fontWeight: isSelected ? "bold" : "normal",
                            "& .MuiChip-deleteIcon": {
                              color: (theme) =>
                                isSelected
                                  ? alpha(theme.palette.common.white, 0.7)
                                  : "inherit",
                              fontSize: 16,
                              transition: "all 0.2s",
                              "&:hover": {
                                color: "error.main",
                                transform: "scale(1.2)",
                              },
                            },
                            "&:hover": {
                              bgcolor: isSelected
                                ? "secondary.dark"
                                : (theme) =>
                                    alpha(theme.palette.secondary.main, 0.1),
                            },
                          }}
                        />
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay armas predefinidas.
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ mt: "auto", mb: 3 }}>
                {/* Add Custom Weapon */}
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Añadir arma nueva (ej. Arco, Daga)"
                    value={customWeapon}
                    onChange={(e) => setCustomWeapon(e.target.value)}
                    onKeyDown={handleCustomWeaponKeyDown}
                  />
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleAddCustomWeapon}
                    sx={{ minWidth: "auto" }}
                  >
                    <Add />
                  </Button>
                </Stack>
              </Box>
            </>
          )}

          <Box sx={{ mt: "auto" }}>
            {/* Actions */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleSaveAndNext}
                disabled={saving}
                startIcon={
                  saving ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Save />
                  )
                }
                sx={{ py: 1.5, fontWeight: "bold", fontSize: "1.1rem" }}
              >
                {saving ? "Guardando..." : "Guardar y Siguiente"}
              </Button>
              <Tooltip title="Saltar sin guardar">
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={handleSkip}
                  disabled={saving}
                  sx={{ width: "80px" }}
                >
                  <SkipNext />
                </Button>
              </Tooltip>
              <Tooltip title="Eliminar definitivamente del archivo">
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={handleDelete}
                  disabled={saving}
                  sx={{
                    width: "80px",
                    borderColor: (theme) =>
                      alpha(theme.palette.error.main, 0.5),
                    "&:hover": {
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                      borderColor: "error.main",
                    },
                  }}
                >
                  <DeleteIcon />
                </Button>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
