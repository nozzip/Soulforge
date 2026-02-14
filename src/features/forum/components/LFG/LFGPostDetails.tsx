import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  Paper,
  Divider,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  CalendarMonth,
  AccessTime,
  Person,
  Groups,
  Rule,
  AutoStories,
  ArrowBack,
  Send,
  Chat,
} from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import { LFGPost, Profile } from "@/types";
import { DEFAULT_AVATAR_URL } from "@/constants";

interface LFGPostDetailsProps {
  post: LFGPost;
  onBack: () => void;
  currentUser: any;
  onManage?: () => void;
  isAdmin?: boolean;
  onDelete?: () => void;
}

const LFGPostDetails: React.FC<LFGPostDetailsProps> = ({
  post,
  onBack,
  currentUser,
  onManage,
  isAdmin,
  onDelete,
}) => {
  const [applicationMessage, setApplicationMessage] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    checkApplicationStatus();
  }, [post.id, currentUser]);

  const checkApplicationStatus = async () => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from("lfg_applications")
      .select("id")
      .eq("post_id", post.id)
      .eq("applicant_id", currentUser.id)
      .maybeSingle();

    if (data) {
      setHasApplied(true);
    }
  };

  const handleApply = async () => {
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: "Debes iniciar sesión para postularte.",
        severity: "error",
      });
      return;
    }

    const { error } = await supabase.from("lfg_applications").insert([
      {
        post_id: post.id,
        applicant_id: currentUser.id,
        message: applicationMessage,
        status: "pending",
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        setSnackbar({
          open: true,
          message: "¡Ya te has postulado a esta misión!",
          severity: "info",
        });
        setHasApplied(true);
        return;
      }
      // Check for foreign key violation (missing profile)
      if (error.code === "23503") {
        console.warn("Profile missing for user, attempting to create...");

        // Attempt to create the missing profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: currentUser.id,
          username:
            currentUser.user_metadata?.full_name ||
            currentUser.email?.split("@")[0] ||
            "Aventurero",
          full_name: currentUser.user_metadata?.full_name || "Desconocido",
          avatar_url: currentUser.user_metadata?.avatar_url || DEFAULT_AVATAR_URL,
        });

        if (profileError) {
          console.error("Failed to create missing profile:", profileError);
          setSnackbar({
            open: true,
            message:
              "Error: No se pudo crear tu perfil de aventurero. Contacta con soporte.",
            severity: "error",
          });
          return;
        }

        // Retry application
        const { error: retryError } = await supabase
          .from("lfg_applications")
          .insert([
            {
              post_id: post.id,
              applicant_id: currentUser.id,
              message: applicationMessage,
              status: "pending",
            },
          ]);

        if (retryError) {
          if (retryError.code === "23505") {
            setSnackbar({
              open: true,
              message: "¡Postulación enviada exitosamente!",
              severity: "success",
            });
            setHasApplied(true);
            return;
          }
          console.error("Error applying after profile creation:", retryError);
          setSnackbar({
            open: true,
            message: "Error al postularte: " + retryError.message,
            severity: "error",
          });
        } else {
          setSnackbar({
            open: true,
            message: "¡Postulación enviada exitosamente! (Perfil creado)",
            severity: "success",
          });
          setHasApplied(true);
        }
        return;
      }

      console.error("Error applying:", error);
      setSnackbar({
        open: true,
        message: "Error al postularte: " + error.message,
        severity: "error",
      });
    } else {
      setSnackbar({
        open: true,
        message: "¡Postulación enviada exitosamente!",
        severity: "success",
      });
      setHasApplied(true);
    }
  };

  const isGM = currentUser?.id === post.gm_id;

  return (
    <Box sx={{ color: "#3e2723", p: 4 }}>
      {/* Back button removed in favor of Modal close icon */}

      {/* Paper wrapper removed to avoid double-border/background with Dialog */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "Cinzel, serif",
            fontWeight: 800,
            mb: 1,
            color: "#c5a059",
            textShadow: "0 2px 10px rgba(197, 160, 89, 0.3)",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          {post.game_name}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Chip
            label={post.system}
            sx={{
              bgcolor: "#2d2d2d",
              color: "#ffecb3",
              fontFamily: "Cinzel, serif",
              fontWeight: 600,
              border: "1px solid #5d4037",
              boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
              borderRadius: "4px",
              height: "32px",
              "& .MuiChip-label": { px: 2 },
            }}
          />
          <Chip
            label={post.modality}
            variant="outlined"
            sx={{
              borderColor: "#c5a059",
              color: "#c5a059",
              fontFamily: "Cinzel, serif",
              fontWeight: "bold",
              bgcolor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "4px",
              height: "32px",
              boxShadow: "inset 0 0 5px rgba(0,0,0,0.5)",
            }}
          />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "#9e9e9e",
              fontFamily: "Cinzel, serif",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <span style={{ color: "#c5a059" }}>✦</span> {post.date} @{" "}
            {post.time}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Cinzel, serif",
                  fontWeight: 700,
                  color: "#c5a059",
                  letterSpacing: "0.1em",
                  borderBottom: "1px solid rgba(197, 160, 89, 0.3)",
                  pb: 0.5,
                  mb: 2,
                  display: "inline-block",
                }}
              >
                Sinopsis
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Newsreader", serif',
                  fontSize: "1.15rem",
                  lineHeight: 1.8,
                  mb: 4,
                  whiteSpace: "pre-wrap",
                  color: "#e0e0e0",
                  fontWeight: 400,
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {post.synopsis}
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Cinzel, serif",
                  fontWeight: 700,
                  color: "#c5a059",
                  letterSpacing: "0.1em",
                  borderBottom: "1px solid rgba(197, 160, 89, 0.3)",
                  pb: 0.5,
                  mb: 2,
                  display: "inline-block",
                }}
              >
                Etiquetas
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {post.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      bgcolor: "rgba(197, 160, 89, 0.05)",
                      color: "#c5a059",
                      fontWeight: 600,
                      border: "1px solid rgba(197, 160, 89, 0.3)",
                      borderRadius: "0px",
                      transform: "skew(-10deg)",
                      "& .MuiChip-label": {
                        transform: "skew(10deg)", // Counter-skew text
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "rgba(0, 0, 0, 0.2)",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                color: "#e0e0e0",
                position: "relative",
              }}
            >
              {/* Corner accents for GM box */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent, #c5a059, transparent)",
                  opacity: 0.5,
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Cinzel, serif",
                  mb: 2,
                  align: "center",
                  color: "#c5a059",
                  letterSpacing: "0.1em",
                }}
              >
                Director de Juego
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Avatar
                  src={post.gm_profile?.avatar_url}
                  sx={{
                    width: 64,
                    height: 64,
                    border: "2px solid #c5a059",
                    boxShadow: "0 0 10px rgba(197, 160, 89, 0.2)",
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: "#ffecb3", fontFamily: "Cinzel, serif" }}
                  >
                    {post.gm_profile?.username || "Desconocido"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
                    Gran Narrador
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, #c5a059, transparent)",
                  my: 2,
                  opacity: 0.3,
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                  color: "#e0e0e0",
                }}
              >
                <Typography sx={{ fontFamily: "Cinzel, serif" }}>
                  Plazas:
                </Typography>
                <Typography
                  fontWeight="bold"
                  sx={{ color: "#c5a059", fontFamily: "Cinzel, serif" }}
                >
                  {post.slots_taken} / {post.slots_total}
                </Typography>
              </Box>
              {/* Progress bar for slots */}
              <Box
                sx={{
                  width: "100%",
                  height: "4px",
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderRadius: "2px",
                  mb: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${Math.min(
                      (post.slots_taken / post.slots_total) * 100,
                      100,
                    )}%`,
                    height: "100%",
                    bgcolor: "#c5a059",
                    boxShadow: "0 0 5px #c5a059",
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                  color: "#e0e0e0",
                }}
              >
                <Typography sx={{ fontFamily: "Cinzel, serif" }}>
                  Plataforma:
                </Typography>
                <Typography
                  fontWeight="bold"
                  sx={{ color: "#ffecb3", fontFamily: "Cinzel, serif" }}
                >
                  {post.platform}
                </Typography>
              </Box>

              <Box
                sx={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, #c5a059, transparent)",
                  my: 2,
                  opacity: 0.3,
                }}
              />

              {isGM ? (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Groups />}
                  sx={{
                    bgcolor: "#c5a059",
                    color: "#000",
                    fontWeight: "bold",
                    fontFamily: "Cinzel, serif",
                    borderRadius: "2px",
                    boxShadow: "0 0 10px rgba(197, 160, 89, 0.3)",
                    "&:hover": {
                      bgcolor: "#b38f42",
                      boxShadow: "0 0 15px rgba(197, 160, 89, 0.5)",
                    },
                  }}
                  onClick={() => {
                    if (onManage) onManage();
                  }}
                >
                  Gestionar Postulaciones
                </Button>
              ) : null}

              {isAdmin && onDelete && (
                <Button
                  variant="outlined"
                  fullWidth
                  color="error"
                  onClick={onDelete}
                  sx={{
                    mt: 2,
                    fontFamily: "Cinzel, serif",
                    fontWeight: "bold",
                    borderColor: "#c62828",
                    color: "#c62828",
                    "&:hover": {
                      bgcolor: "rgba(198, 40, 40, 0.1)",
                      borderColor: "#b71c1c",
                      color: "#b71c1c",
                    },
                  }}
                >
                  Eliminar Misión (Admin)
                </Button>
              )}

              {isGM ? null : hasApplied ? (
                <Button
                  variant="contained"
                  fullWidth
                  disabled
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.05) !important",
                    color: "#9e9e9e !important",
                    border: "1px solid #5d4037",
                    fontFamily: "Cinzel, serif",
                  }}
                >
                  Postulación Pendiente
                </Button>
              ) : (
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      color: "#c5a059",
                      fontFamily: "Cinzel, serif",
                    }}
                  >
                    Mensaje al vacío:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    sx={{
                      mb: 2,
                      bgcolor: "rgba(0, 0, 0, 0.3)",
                      input: { color: "#e0e0e0", fontFamily: "inherit" },
                      textarea: { color: "#e0e0e0", fontFamily: "inherit" },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#5d4037",
                        },
                        "&:hover fieldset": { borderColor: "#c5a059" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#c5a059",
                          boxShadow: "0 0 5px rgba(197, 160, 89, 0.3)",
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Send />}
                    onClick={handleApply}
                    sx={{
                      background:
                        "linear-gradient(45deg, #8d6e63 30%, #5d4037 90%)",
                      color: "#ffecb3",
                      fontWeight: "bold",
                      fontFamily: "Cinzel, serif",
                      border: "1px solid #5d4037",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, #a1887f 30%, #6d4c41 90%)",
                        boxShadow: "0 0 10px rgba(141, 110, 99, 0.5)",
                      },
                    }}
                  >
                    Enviar Postulación
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LFGPostDetails;
