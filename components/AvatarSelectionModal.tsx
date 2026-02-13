import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  Grid,
  alpha,
  useTheme,
} from "@mui/material";
import { supabase } from "../src/supabase";

interface AvatarSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const theme = useTheme();
  const [avatars, setAvatars] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchAvatars();
    }
  }, [open]);

  const fetchAvatars = async () => {
    setLoading(true);
    setError(null);
    try {
      // List all files in the 'avatar' bucket
      const { data, error } = await supabase.storage.from("avatar").list();

      if (error) {
        throw error;
      }

      if (data) {
        // Construct public URLs for each file
        const urls = data.map((file) => {
          const { data: publicUrlData } = supabase.storage
            .from("avatar")
            .getPublicUrl(file.name);
          return publicUrlData.publicUrl;
        });
        setAvatars(urls);
      }
    } catch (err: any) {
      console.error("Error fetching avatars:", err);
      setError("Error al cargar los avatares. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Cinzel, serif",
          color: "secondary.main",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        Elige tu Semblante
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress color="secondary" />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : avatars.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No se encontraron avatares disponibles.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {avatars.map((url, index) => (
              <Grid size={{ xs: 3, sm: 2 }} key={index}>
                <Box
                  onClick={() => onSelect(url)}
                  sx={{
                    width: "100%",
                    paddingTop: "100%", // 1:1 Aspect Ratio
                    position: "relative",
                    cursor: "pointer",
                    borderRadius: 1,
                    overflow: "hidden",
                    border: `2px solid transparent`,
                    transition: "all 0.2s",
                    "&:hover": {
                      border: `2px solid ${theme.palette.secondary.main}`,
                      transform: "scale(1.05)",
                      boxShadow: `0 0 10px ${alpha(theme.palette.secondary.main, 0.5)}`,
                    },
                  }}
                >
                  <img
                    src={url}
                    alt={`Avatar ${index + 1}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvatarSelectionModal;
