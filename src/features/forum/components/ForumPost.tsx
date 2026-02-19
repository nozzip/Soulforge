import React from "react";
import {
  Paper,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { supabase } from "@/src/supabase";
import {
  FormatQuote as QuoteIcon,
  Flag as FlagIcon,
  FavoriteBorder as LikeIcon,
  Favorite as LikeFilledIcon,
  Delete as DeleteIcon,
  Shield as ShieldIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { DEFAULT_AVATAR_URL } from "@/constants";
import RichTextDisplay from "@/components/Editor/RichTextDisplay";
import RichTextEditor from "@/components/Editor/RichTextEditor";
import { uploadImage } from "@/utils/imageHandler";

interface ForumPostProps {
  content: string;
  author: any;
  date: string;
  isOp?: boolean;
  postId?: string;
  threadId?: string; // If OP
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onQuote?: (content: string, author: string) => void;
  likesCount?: number;
  currentUserId?: string;
  isLiked?: boolean;
  onLike?: () => void;
  onEdit?: (id: string, newContent: string) => void;
  onProfileClick?: (id: string) => void;
  isEdited?: boolean;
}

const ForumPost: React.FC<ForumPostProps> = ({
  content,
  author,
  date,
  isOp = false,
  postId,
  threadId,
  isAdmin = false,
  onDelete,
  onQuote,
  likesCount = 0,
  onLike,
  isLiked = false,
  currentUserId,
  onEdit,
  onProfileClick,
  isEdited = false,
}) => {
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info" as "success" | "info" | "error",
  });
  const [reportOpen, setReportOpen] = React.useState(false);
  const [reportReason, setReportReason] = React.useState("");
  const [reporting, setReporting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(content);
  const [saving, setSaving] = React.useState(false);

  const reportReasons = [
    { value: "spam", label: "Spam / Publicidad" },
    { value: "harassment", label: "Acoso o Comportamiento Tóxico" },
    { value: "offensive", label: "Contenido Ofensivo / Discriminación" },
    { value: "rules", label: "Incumplimiento de Reglas del Foro" },
    { value: "other", label: "Otro" },
  ];

  const handleSaveEdit = async () => {
    if (!postId || !onEdit) return;
    setSaving(true);
    try {
      await onEdit(postId, editContent);
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: "Mensaje actualizado correctamente.",
        severity: "success",
      });
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message: "Error al actualizar.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReport = async () => {
    if (!currentUserId) {
      setSnackbar({
        open: true,
        message: "Debes iniciar sesión para reportar.",
        severity: "info",
      });
      return;
    }
    if (!reportReason) return;

    setReporting(true);
    try {
      const { error } = await supabase.from("forum_reports").insert({
        reporter_id: currentUserId,
        post_id: !isOp ? postId : null,
        thread_id: isOp ? threadId : null,
        reason: reportReason,
      });

      if (error) throw error;

      setReportOpen(false);
      setReportReason("");
      setSnackbar({
        open: true,
        message: "Reporte enviado. Los Supervisores lo revisarán.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error reporting:", error);
      setSnackbar({
        open: true,
        message: "Error al enviar el reporte.",
        severity: "error",
      });
    } finally {
      setReporting(false);
    }
  };

  const handleJoinGuild = async () => {
    if (!currentUserId) {
      setSnackbar({
        open: true,
        message: "Debes iniciar sesión para unirte a una guild.",
        severity: "info",
      });
      return;
    }
    if (!stats.guildId) return;

    try {
      // Check if already applied or member
      const { data, error: checkError } = await supabase
        .from("guild_members")
        .select("id, status")
        .eq("guild_id", stats.guildId)
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (data) {
        if (data.status === "pending") {
          setSnackbar({
            open: true,
            message: "Ya tienes una solicitud pendiente para esta guild.",
            severity: "info",
          });
        } else {
          setSnackbar({
            open: true,
            message: "Ya eres parte de esta guild.",
            severity: "info",
          });
        }
        return;
      }

      const { error } = await supabase.from("guild_members").insert({
        guild_id: stats.guildId,
        user_id: currentUserId,
        status: "pending",
      });

      if (error) throw error;
      setSnackbar({
        open: true,
        message: `Solicitud enviada a la guild ${stats.guildName} correctamente.`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error joining guild:", error);
      setSnackbar({
        open: true,
        message: "Error al enviar solicitud.",
        severity: "error",
      });
    }
  };
  const theme = useTheme();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Stats from author profile (or defaults if missing)
  // Extract Guild from author (assuming joined via guild_members)
  const guildMember = author?.guild_members?.[0];
  const isAcceptedMember = guildMember?.status === "accepted";
  const guild = isAcceptedMember ? guildMember?.guild : null;

  const stats = {
    lvl: author?.level || 1,
    xp: author?.xp || 0,
    title: author?.title || "Novice Adventurer",
    guildName: guild?.name || "Sin Guild",
    guildId: guildMember?.guild_id || guild?.id, // Use ID from member row if guild object is missing
  };

  // Calculate next level XP (Level * 1000)
  // Current logic: Total XP needed for next level = (L) * (L+1) / 2 * 1000? NO.
  // User said: "Level * 1000 required for next level".
  // Lvl 1 -> 2 needs 1000. Total 1000.
  // Lvl 2 -> 3 needs 2000. Total 3000.
  // We can just show current XP / Next Level Threshold?
  // Threshold for next level (L+1) is (L * (L+1) / 2) * 1000.
  // But let's simplify display to "Current XP".

  return (
    <Paper
      elevation={4}
      sx={{
        mb: 3,
        bgcolor: isOp
          ? alpha(theme.palette.secondary.main, 0.05) // Slight tint for OP
          : alpha(theme.palette.background.paper, 0.6),
        backdropFilter: "blur(10px)",
        border: isOp
          ? `1px solid ${alpha(theme.palette.secondary.main, 0.4)}`
          : `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        transition: "box-shadow 0.3s",
        "&:hover": {
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.5)}`,
        },
      }}
    >
      {/* Top Bar / Initiative Tracker Style */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          p: 1,
          px: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: "Cinzel, serif",
            color: "text.secondary",
            letterSpacing: 1,
            fontWeight: "bold",
          }}
        >
          {isOp
            ? "INICIATIVA #1 (OP)"
            : `PUBLICADO ${formatDate(date).toUpperCase()}${isEdited ? " (EDITADO)" : ""}`}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={isLiked ? "Ya no me gusta" : "Me gusta (+XP)"}>
            <Button
              size="small"
              onClick={onLike}
              startIcon={
                isLiked ? (
                  <LikeFilledIcon fontSize="small" color="error" />
                ) : (
                  <LikeIcon fontSize="small" />
                )
              }
              sx={{
                color: isLiked ? "error.main" : "text.secondary",
                minWidth: "auto",
                px: 1,
              }}
            >
              {likesCount > 0 && likesCount}
            </Button>
          </Tooltip>
          <IconButton
            size="small"
            sx={{ color: "text.secondary" }}
            onClick={() => setReportOpen(true)}
          >
            <FlagIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left Column: Character Sheet */}
        <Box
          sx={{
            width: { xs: "100%", md: 240 },
            p: 3,
            bgcolor: alpha(theme.palette.background.default, 0.3),
            borderRight: {
              md: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
            borderBottom: {
              xs: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              md: "none",
            },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Avatar Frame */}
          <Box
            sx={{
              position: "relative",
              mb: 2,
              cursor: onProfileClick ? "pointer" : "default",
              "&:hover": onProfileClick
                ? {
                    "& .MuiAvatar-root": {
                      borderColor: "primary.main",
                      boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                    },
                  }
                : {},
            }}
            onClick={() =>
              onProfileClick && author && onProfileClick(author.id)
            }
          >
            <Avatar
              src={
                author?.avatar_url?.includes("images/avatars/")
                  ? DEFAULT_AVATAR_URL
                  : author?.avatar_url
              }
              alt={author?.username}
              variant="rounded"
              sx={{
                width: 96,
                height: 96,
                borderRadius: 2,
                border: `2px solid ${theme.palette.secondary.main}`,
                boxShadow: `0 0 15px ${alpha(theme.palette.secondary.main, 0.3)}`,
                transition: "all 0.3s",
              }}
            />
            <Chip
              label={`Lvl ${stats.lvl}`}
              size="small"
              color="secondary"
              sx={{
                position: "absolute",
                bottom: -10,
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "Cinzel, serif",
                fontWeight: 700,
                height: 20,
              }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontFamily: "Cinzel, serif",
              fontWeight: 700,
              color: "secondary.main",
              mb: 0.5,
              cursor: onProfileClick ? "pointer" : "default",
              "&:hover": onProfileClick ? { textDecoration: "underline" } : {},
            }}
            onClick={() =>
              onProfileClick && author && onProfileClick(author.id)
            }
          >
            {author?.username || "Desconocido"}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            sx={{ fontStyle: "italic" }}
          >
            {author?.title || "Aventurero"}
          </Typography>

          {/* Stats Grid */}
          <Box
            sx={{
              mt: 2,
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              bgcolor: alpha(theme.palette.background.paper, 0.3),
              p: 1.5,
              borderRadius: 1,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: "0.65rem" }}
              >
                XP
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "Cinzel, serif" }}>
                {stats.xp}
              </Typography>
            </Box>
            {/* Duplicate XP removed */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: "0.65rem" }}
              >
                GUILD
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "Cinzel, serif",
                    fontSize: "0.7rem",
                    fontWeight: guild ? 700 : 400,
                    color: guild ? "secondary.main" : "text.secondary",
                  }}
                >
                  {stats.guildName}
                </Typography>
                {/* Parchment Tooltip for Joining */}
                {stats.guildId && currentUserId && (
                  <Tooltip title="Unirse a esta Guild">
                    <IconButton
                      size="small"
                      sx={{ p: 0 }}
                      onClick={handleJoinGuild}
                    >
                      <ShieldIcon
                        fontSize="small"
                        sx={{ fontSize: 14, color: "brown" }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>

          {/* Online Indicator */}
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "success.main",
                boxShadow: "0 0 5px #4caf50",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              EN SESIÓN
            </Typography>
          </Box>
        </Box>

        {/* Right Column: Content */}
        <Box sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column" }}>
          {/* Post Content */}
          {isEditing ? (
            <Box sx={{ mb: 2, flex: 1 }}>
              <RichTextEditor
                content={editContent}
                onChange={setEditContent}
                onImageUpload={(file) =>
                  currentUserId
                    ? uploadImage(file, currentUserId)
                    : Promise.resolve("")
                }
              />
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 1,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  startIcon={<CloseIcon />}
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(content);
                  }}
                  color="inherit"
                >
                  Cancelar
                </Button>
                <Button
                  startIcon={
                    saving ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                  onClick={handleSaveEdit}
                  variant="contained"
                  color="secondary"
                  disabled={saving}
                >
                  Guardar
                </Button>
              </Box>
            </Box>
          ) : (
            <RichTextDisplay
              content={content}
              sx={{
                fontFamily: '"Newsreader", serif',
                fontSize: "1.1rem",
                lineHeight: 1.7,
                mb: 3,
                flex: 1,
              }}
            />
          )}

          {/* Action Bar */}
          {!isEditing && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                pt: 2,
                mt: "auto",
              }}
            >
              <Button
                startIcon={<QuoteIcon />}
                size="small"
                color="inherit"
                sx={{ opacity: 0.7 }}
                onClick={() =>
                  onQuote && onQuote(content, author?.username || "Desconocido")
                }
              >
                Citar
              </Button>

              {/* Edit Button */}
              {onEdit &&
                currentUserId &&
                (currentUserId === author?.id || isAdmin) && (
                  <Button
                    startIcon={<EditIcon />}
                    size="small"
                    color="inherit"
                    sx={{ opacity: 0.7 }}
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                )}

              {isAdmin && postId && onDelete && (
                <Button
                  startIcon={<DeleteIcon />}
                  size="small"
                  color="error"
                  onClick={() => onDelete(postId)}
                >
                  Borrar
                </Button>
              )}

              {/* Corrected duplicate delete button */}
            </Box>
          )}
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            fontFamily: "Newsreader, serif",
            bgcolor: "rgba(20, 20, 20, 0.95)",
            color: "#fff",
            border: `1px solid ${snackbar.severity === "success" ? "#4caf50" : snackbar.severity === "error" ? "#f44336" : "#d4af37"}`,
            "& .MuiAlert-icon": {
              color:
                snackbar.severity === "success"
                  ? "#4caf50"
                  : snackbar.severity === "error"
                    ? "#f44336"
                    : "#d4af37",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)}>
        <DialogTitle sx={{ fontFamily: "Cinzel, serif" }}>
          Reportar {isOp ? "Hilo" : "Respuesta"}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ¿Por qué deseas reportar este contenido? Un Supervisor revisará tu
            reporte.
          </Typography>
          <TextField
            select
            fullWidth
            label="Razón del Reporte"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            variant="outlined"
            margin="dense"
          >
            {reportReasons.map((option) => (
              <MenuItem key={option.value} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {reportReason === "Otro" && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Detalles adicionales"
              variant="outlined"
              margin="dense"
              sx={{ mt: 1 }}
              onChange={(e) => setReportReason(`Otro: ${e.target.value}`)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleReport}
            variant="contained"
            color="error"
            disabled={!reportReason || reporting}
          >
            {reporting ? <CircularProgress size={20} /> : "Enviar Reporte"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ForumPost;
