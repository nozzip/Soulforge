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

  // We use html-react-parser to safely render HTML and handle custom elements
  const parsedContent = parse(content || "", {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        if (domNode.name === "img") {
          let {
            src,
            alt,
            width,
            height,
            style: styleAttr,
            "data-align": dataAlign,
          } = domNode.attribs;

          // Check inline style if attributes are missing
          if (styleAttr && (!width || !height)) {
            const widthMatch = styleAttr.match(/width:\s*([^;]+)/);
            const heightMatch = styleAttr.match(/height:\s*([^;]+)/);
            if (widthMatch && !width) width = widthMatch[1];
            if (heightMatch && !height) height = heightMatch[1];
          }

          // Normalization: Ensure units if it's just a number
          if (width && !isNaN(Number(width))) width = `${width}px`;
          if (height && !isNaN(Number(height))) height = `${height}px`;

          const style: React.CSSProperties = {
            maxWidth: "100%",
            borderRadius: "4px",
            objectFit: "contain",
            display: "block", // Default for center/unaligned
          };

          if (dataAlign === "left") {
            style.float = "left";
            style.marginRight = "1rem";
            style.marginBottom = "0.5rem";
            style.display = "inline-block";
            style.clear = "both"; // Optional, depending on pref
          } else if (dataAlign === "right") {
            style.float = "right";
            style.marginLeft = "1rem";
            style.marginBottom = "0.5rem";
            style.display = "inline-block";
            style.clear = "both";
          } else {
            // Center or default
            style.margin = "0 auto";
            style.display = "block";
          }

          if (width) style.width = width;
          if (height) style.height = height;

          return <img src={src} alt={alt} style={style} />;
        }
      }
      return domNode;
    },
  });

  // We are no longer using the regex parser for simplicity and because we now store HTML.
  // We utilize dangerouslySetInnerHTML with the Tiptap content.
  // Security Note: Tiptap content should be sanitized on output, but for a real app we'd use DOMPurify here.

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
              src={author?.avatar_url?.includes('images/avatars/') ? DEFAULT_AVATAR_URL : author?.avatar_url}
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
          <Typography
            component="div"
            variant="body1"
            sx={{
              fontFamily: '"Newsreader", serif',
              fontSize: "1.1rem",
              lineHeight: 1.7,
              mb: 3,
              flex: 1,
              "& p": { margin: "0 0 1em 0" },
              "& blockquote": {
                borderLeft: `3px solid ${theme.palette.secondary.main}`,
                paddingLeft: "1rem",
                fontStyle: "italic",
                color: "text.secondary",
                margin: "1em 0",
              },
              "& .spoiler": {
                backgroundColor: "#000",
                color: "#000",
                cursor: "pointer",
                borderRadius: "4px",
                padding: "0 4px",
                transition: "color 0.2s",
                "&:hover": {
                  color: "#fff",
                },
              },
              // Images are handled by the parser replacement now to support resizing
            }}
          >
            {parsedContent}
          </Typography>

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
