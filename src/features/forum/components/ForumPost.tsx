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
  Divider,
  Button,
} from "@mui/material";
import {
  FormatQuote as QuoteIcon,
  Flag as FlagIcon,
  FavoriteBorder as LikeIcon,
  Delete as DeleteIcon,
  Shield as ShieldIcon,
  AutoAwesome as MagicIcon,
  PushPin as PinIcon,
} from "@mui/icons-material";
import parse, { DOMNode, Element } from "html-react-parser";
import { DEFAULT_AVATAR_URL } from "@/constants";
import RichTextDisplay from "@/components/Editor/RichTextDisplay";

interface ForumPostProps {
  content: string;
  author: any;
  date: string;
  isOp?: boolean;
  postId?: string;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onQuote?: (content: string, author: string) => void;
}

const ForumPost: React.FC<ForumPostProps> = ({
  content,
  author,
  date,
  isOp = false,
  postId,
  isAdmin = false,
  onDelete,
  onQuote,
}) => {
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

  // Generate mock stats based on username hash or random for now,
  // until we have real stats in Profile
  const getMockStats = (name: string) => {
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      lvl: (hash % 20) + 1,
      xp: (hash * 123) % 100000,
      ac: 10 + (hash % 10),
      hp: 20 + (hash % 100),
      class: hash % 2 === 0 ? "Paladín" : "Mago", // Just simplest mock
    };
  };

  const stats = getMockStats(author?.username || "Invitado");

  // We utilize RichTextDisplay to safely render HTML and handle custom elements
  // Security Note: Tiptap content should be sanitized on output, but for a real app we'd use DOMPurify in RichTextDisplay.

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
            : `PUBLICADO ${formatDate(date).toUpperCase()}`}
        </Typography>
        <Box>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            {" "}
            <LikeIcon fontSize="small" />{" "}
          </IconButton>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            {" "}
            <FlagIcon fontSize="small" />{" "}
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
          <Box sx={{ position: "relative", mb: 2 }}>
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
            }}
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
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: "0.65rem" }}
              >
                AC
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "Cinzel, serif" }}>
                {stats.ac}
              </Typography>
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

          {/* Action Bar */}
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
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ForumPost;
