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
import { supabase } from "../../../src/supabase";
import { ForumThread, Product } from "../../../types";

// Mock LFG Data for Sidebar Preview
const MOCK_SIDEBAR_LFG = [
  {
    id: "1",
    title: "Curse of Strahd: Into the Mists",
    system: "D&D 5e",
    author: "DungeonMasterX",
    time: "20:00 EST",
  },
  {
    id: "2",
    title: "The Heist of the Century",
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
  // const [recentThreads, setRecentThreads] = useState<ForumThread[]>([]); // Removing recent threads for LFG section
  const [latestProduct, setLatestProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(1204);

  useEffect(() => {
    fetchData();
    // Simulate fluctuating online users
    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
        return Math.max(100, prev + change); // Ensure doesn't go too low
      });
    }, 5000);
    return () => clearInterval(interval);
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
            LOOKING FOR GROUP
          </Typography>
        </Box>
        <List disablePadding>
          {MOCK_SIDEBAR_LFG.map((post, index) => (
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
                        {post.title.toUpperCase()}
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
                          by {post.author} • {post.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < MOCK_SIDEBAR_LFG.length - 1 && (
                <Divider
                  component="li"
                  sx={{ borderColor: alpha(theme.palette.common.white, 0.05) }}
                />
              )}
            </React.Fragment>
          ))}
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
            VIEW ALL REQUESTS
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
                label="FRESH FROM THE FORGE"
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
                {latestProduct.description || "A new artifact discovered..."}
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
                    INSPECT
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
            Stoking the forge...
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
            ADVENTURERS ONLINE
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
              {/* Mock Avatars */}
              <Avatar alt="Gandalf" src="https://i.pravatar.cc/150?u=gandalf" />
              <Avatar alt="Aragorn" src="https://i.pravatar.cc/150?u=aragorn" />
              <Avatar alt="Legolas" src="https://i.pravatar.cc/150?u=legolas" />
              <Avatar alt="Gimli" src="https://i.pravatar.cc/150?u=gimli" />
              <Avatar alt="Frodo" src="https://i.pravatar.cc/150?u=frodo" />
              <Avatar alt="Sam" src="https://i.pravatar.cc/150?u=sam" />
            </AvatarGroup>
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
            heroes currently exploring the realm.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForumSidebar;
