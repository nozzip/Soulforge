import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Divider,
  alpha,
  useTheme,
  Button,
  Avatar,
  AvatarGroup,
  CardActionArea,
  Chip,
} from "@mui/material";
import {
  Groups as GroupsIcon,
  FiberManualRecord as OnlineIcon,
  HelpOutline as QuestionIcon,
  MenuBook as StoryIcon,
  Handyman as BuildIcon,
  NewReleases as NewIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import { ForumThread, Product } from "@/types";
import { DEFAULT_AVATAR_URL } from "@/constants";

// Mock LFG Data for Sidebar Preview
const MOCK_SIDEBAR_LFG = [
  {
    id: "1",
    title: "La Maldición de Strahd: En la Niebla",
    system: "D&D 5e",
    author: "DungeonMasterX",
    time: "20:00 EST",
  },
  {
    id: "2",
    title: "El Golpe del Siglo",
    system: "Blades in the Dark",
    author: "RogueLeader",
    time: "14:00 GMT",
  },
];

interface ForumSidebarProps {
  onThreadSelect: (threadId: string) => void;
  onProductSelect?: (productId: string) => void;
  onLFGClick?: () => void;
}

const ForumSidebar: React.FC<ForumSidebarProps> = ({
  onThreadSelect,
  onProductSelect,
  onLFGClick,
}) => {
  const theme = useTheme();
  const [lfgPosts, setLfgPosts] = useState<any[]>([]);
  const [latestProduct, setLatestProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [recentLocals, setRecentLocals] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Latest Product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (productError && productError.code !== "PGRST116") {
        console.error("Error fetching latest product:", productError);
      }
      if (productData) {
        setLatestProduct(productData);
      }

      // 2. Fetch Latest LFG Posts
      const { data: lfgData, error: lfgError } = await supabase
        .from("lfg_posts")
        .select("*, gm_profile:profiles(*)")
        .order("created_at", { ascending: false })
        .limit(3);

      if (lfgError) {
        console.error("Error fetching LFG posts:", lfgError);
      } else {
        setLfgPosts(lfgData || []);
      }

      // 3. Fetch "Online" Users (Total Profiles for now)
      const { count: userCount, error: userError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (userError) {
        console.error("Error fetching user count:", userError);
      } else {
        setOnlineCount(userCount || 0);
      }

      // 4. Fetch a few recent profiles for avatars
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .limit(5);

      if (profileData) {
        setRecentLocals(profileData);
      }
    } catch (error) {
      console.error("Error fetching sidebar data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* 1. LOOKING FOR GROUP (Formerly Quest Board) */}
      <Card
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          backdropFilter: "blur(8px)",
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))",
          overflow: "visible", // To allow corner flourishes if we add them
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: alpha(theme.palette.secondary.main, 0.1),
            cursor: onLFGClick ? "pointer" : "default",
          }}
          onClick={onLFGClick}
        >
          <GroupsIcon color="secondary" />
          <Typography
            variant="h6"
            sx={{
              fontFamily: "Cinzel, serif",
              fontWeight: 700,
              color: "secondary.main",
              letterSpacing: 1,
              fontSize: "1rem",
            }}
          >
            BUSCANDO GRUPO
          </Typography>
        </Box>
        <List disablePadding>
          {lfgPosts.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No hay misiones activas"
                secondary="¡Sé el primero en publicar una!"
                primaryTypographyProps={{
                  color: "text.secondary",
                  fontFamily: "Cinzel, serif",
                }}
              />
            </ListItem>
          ) : (
            lfgPosts.map((post, index) => (
              <React.Fragment key={post.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    // CLICKING ITEM NOW GOES TO LFG BOARD
                    onClick={onLFGClick}
                    alignItems="flex-start"
                    sx={{
                      py: 1.5,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        pl: 3,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                      <GroupsIcon color="secondary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontFamily: "Cinzel, serif",
                            color: "text.primary",
                            lineHeight: 1.2,
                            mb: 0.5,
                            fontSize: "0.85rem",
                          }}
                        >
                          {post.game_name.toUpperCase()}
                        </Typography>
                      }
                      secondary={
                        <Box component="span">
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              color: "secondary.main",
                              fontWeight: "bold",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            {post.system}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              fontFamily: "Newsreader, serif",
                              fontStyle: "italic",
                            }}
                          >
                            by {post.gm_profile?.username || "Desconocido"} •{" "}
                            {post.date}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < lfgPosts.length - 1 && (
                  <Divider
                    component="li"
                    sx={{
                      borderColor: alpha(theme.palette.common.white, 0.05),
                    }}
                  />
                )}
              </React.Fragment>
            ))
          )}
        </List>
        <Box
          sx={{
            p: 1.5,
            borderTop: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          }}
        >
          <Button
            fullWidth
            size="small"
            color="secondary"
            onClick={onLFGClick}
            sx={{
              fontFamily: "Cinzel, serif",
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: "0.75rem",
            }}
          >
            VER TODAS LAS MISIONES
          </Button>
        </Box>
      </Card>

      {/* 2. LATEST ARRIVAL (Replacing One-Shot Card) */}
      {latestProduct ? (
        <Card
          sx={{
            position: "relative",
            overflow: "hidden",
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.5)}`,
            borderRadius: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "secondary.main",
              boxShadow: `0 0 20px ${alpha(theme.palette.secondary.main, 0.3)}`,
              transform: "translateY(-4px)",
            },
          }}
        >
          <CardActionArea
            onClick={() => onProductSelect && onProductSelect(latestProduct.id)}
          >
            {/* Background Image / Gradient */}
            <Box
              sx={{
                height: 180,
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%), url(${latestProduct.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <Chip
                label="RECIÉN FORJADO"
                color="secondary"
                size="small"
                sx={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  fontFamily: "Cinzel, serif",
                  fontWeight: "bold",
                  fontSize: "0.65rem",
                  height: 20,
                }}
              />
            </Box>
            <CardContent sx={{ pt: 1, pb: "16px !important" }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Cinzel, serif",
                  fontWeight: 700,
                  color: "white", // Assume dark theme usually
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {latestProduct.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontSize: "0.8rem",
                }}
              >
                {latestProduct.description ||
                  "Un nuevo artefacto descubierto..."}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  color="secondary.main"
                  fontWeight="bold"
                >
                  {latestProduct.price} GP
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    color="secondary.main"
                    fontWeight="bold"
                  >
                    INSPECCIONAR
                  </Typography>
                  <ArrowForwardIcon
                    fontSize="small"
                    sx={{ fontSize: 14, color: "secondary.main" }}
                  />
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      ) : (
        // Placeholder if no product loaded yet
        <Card
          sx={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.background.paper, 0.2),
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Avivando la forja...
          </Typography>
        </Card>
      )}

      {/* 3. ADVENTURERS ONLINE */}
      <Card
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          backdropFilter: "blur(8px)",
          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: "Cinzel, serif",
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: 1,
            }}
          >
            GREMIO DE AVENTUREROS
          </Typography>
        </Box>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <AvatarGroup
              max={5}
              sx={{
                "& .MuiAvatar-root": {
                  borderColor: theme.palette.background.paper,
                  width: 32,
                  height: 32,
                  fontSize: "0.8rem",
                },
              }}
            >
              {recentLocals.map((profile) => (
                <Avatar
                  key={profile.id}
                  alt={profile.username || "Hero"}
                  src={profile.avatar_url?.includes('images/avatars/') ? DEFAULT_AVATAR_URL : profile.avatar_url}
                />
              ))}
            </AvatarGroup>
            {onlineCount > 5 && (
              <Box
                sx={{
                  bgcolor: alpha(theme.palette.secondary.main, 0.2),
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "secondary.main",
                  fontWeight: "bold",
                  fontSize: "0.7rem",
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                }}
              >
                +{onlineCount - 5}
              </Box>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            <Box
              component="span"
              sx={{
                color: "success.main",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <OnlineIcon sx={{ fontSize: 10 }} />{" "}
              {onlineCount.toLocaleString()}
            </Box>{" "}
            héroes registrados en el reino.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForumSidebar;
