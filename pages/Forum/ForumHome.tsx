import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  alpha,
  useTheme,
  CardActionArea,
  Avatar,
  Divider,
} from "@mui/material";
import { supabase } from "../../src/supabase";
import { ForumCategory } from "../../types";
import {
  LocalBar as LocalBarIcon,
  AutoStories as AutoStoriesIcon,
  Forum as ForumIcon,
  Groups as GroupsIcon,
  Handyman as HandymanIcon,
  ReportProblem as HorrorIcon,
  MenuBook as BookIcon,
  School as SchoolIcon,
  Security as DmIcon,
  Pets as BeastIcon,
} from "@mui/icons-material";
import ForumSidebar from "./components/ForumSidebar";

// Map icons based on category name
const getIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("taberna")) return LocalBarIcon;
  if (n.includes("buscador")) return GroupsIcon;
  if (n.includes("forja")) return HandymanIcon;
  if (n.includes("historias")) return HorrorIcon;
  if (n.includes("reglas")) return SchoolIcon;
  if (n.includes("lore") || n.includes("mundo")) return AutoStoriesIcon;
  if (n.includes("master") || n.includes("dm")) return DmIcon;
  if (n.includes("bestiario") || n.includes("monstruo")) return BeastIcon;
  return ForumIcon;
};

// Helper to group categories (mock logic until DB schema supports groups)
const getCategoryGroup = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("reglas") || n.includes("builds") || n.includes("taberna"))
    return "THE PLAYER'S HANDBOOK";
  if (n.includes("master") || n.includes("lore") || n.includes("mundo"))
    return "THE DUNGEON MASTER'S GUIDE";
  if (
    n.includes("bestiario") ||
    n.includes("monstruo") ||
    n.includes("historias")
  )
    return "THE MONSTER MANUAL";
  return "GENERAL DISCUSSION";
};

interface ForumHomeProps {
  onCategorySelect: (categoryId: string) => void;
  onThreadSelect?: (threadId: string) => void;
  onProductSelect?: (productId: string) => void;
  onLFGClick?: () => void;
}

const ForumHome: React.FC<ForumHomeProps> = ({
  onCategorySelect,
  onThreadSelect,
  onProductSelect,
  onLFGClick,
}) => {
  const theme = useTheme();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<
    Record<string, { threads: number; posts: number }>
  >({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Supabase error fetching categories:", error);
      }
      if (data) {
        setCategories(data);
        fetchStats(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (cats: ForumCategory[]) => {
    const stats: Record<string, { threads: number; posts: number }> = {};

    for (const cat of cats) {
      // Get thread count
      const { count: threadCount } = await supabase
        .from("forum_threads")
        .select("*", { count: "exact", head: true })
        .eq("category_id", cat.id);

      // Get post count (joined via threads) - this is a bit expensive, maybe just distinct threads?
      // Simpler approach for now: Get threads for this category, then count posts for those threads
      // optimization: we can just count threads for SCROLLS and maybe skip posts (RUNES) if too heavy,
      // or just do a second query.
      // Let's try to get post count by joining.
      // Actually Supabase doesn't support deep join count easily in one go without a view/rpc.
      // We will just report Thread Count (Scrolls) and Post Count (Runes).
      // For Runes, we'll query forum_posts where thread_id is in (threads of this cat).
      // That might be too much. Let's just do threads for now as "Scrolls" and maybe 0 or a random number for Runes if strictly needed,
      // OR better: Just show Threads and maybe "Replies" if we can.
      // Let's try to get all threads ids first.
      const { data: threads } = await supabase
        .from("forum_threads")
        .select("id")
        .eq("category_id", cat.id);

      let postCount = 0;
      if (threads && threads.length > 0) {
        const threadIds = threads.map((t) => t.id);
        const { count } = await supabase
          .from("forum_posts")
          .select("*", { count: "exact", head: true })
          .in("thread_id", threadIds);
        postCount = count || 0;
      }

      stats[cat.id] = {
        threads: threadCount || 0,
        posts: postCount,
      };
    }
    setCategoryStats(stats);
  };

  const groupedCategories = categories.reduce(
    (acc, cat) => {
      const group = getCategoryGroup(cat.name);
      if (!acc[group]) acc[group] = [];
      acc[group].push(cat);
      return acc;
    },
    {} as Record<string, ForumCategory[]>,
  );

  // Define group order
  const groupOrder = [
    "THE PLAYER'S HANDBOOK",
    "THE DUNGEON MASTER'S GUIDE",
    "THE MONSTER MANUAL",
    "GENERAL DISCUSSION",
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 16, mb: 10 }}>
      {/* Hero Banner */}
      <Box
        sx={{
          textAlign: "center",
          mb: 6,
          py: 6,
          px: 4,
          borderRadius: 0,
          borderTop: `2px solid ${theme.palette.secondary.main}`,
          borderBottom: `2px solid ${theme.palette.secondary.main}`,
          background: `linear-gradient(to right, ${alpha(theme.palette.background.default, 0)}, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.background.default, 0)})`,
          position: "relative",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Cinzel, serif",
            fontWeight: 800,
            color: "secondary.main", // Gold
            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
            letterSpacing: 2,
            mb: 1,
          }}
        >
          LA TABERNA DEL DRAGÓN
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Newsreader", serif',
            color: "text.primary",
            fontStyle: "italic",
            maxWidth: 800,
            mx: "auto",
            opacity: 0.9,
          }}
        >
          "El fuego es cálido, la cerveza está fría y las historias son
          legendarias. Bienvenido a casa, aventurero."
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content - Categories */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {groupOrder.map((groupName) => {
            const groupCats = groupedCategories[groupName];
            if (!groupCats || groupCats.length === 0) return null;

            let HeaderIcon = BookIcon;
            if (groupName.includes("MASTER")) HeaderIcon = DmIcon;
            if (groupName.includes("MONSTER")) HeaderIcon = BeastIcon;

            return (
              <Box key={groupName} sx={{ mb: 5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                    pb: 1,
                  }}
                >
                  <HeaderIcon color="secondary" sx={{ fontSize: 30 }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "Cinzel, serif",
                      fontWeight: 700,
                      color: "secondary.main",
                      letterSpacing: 1,
                    }}
                  >
                    {groupName}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {groupCats.map((category) => {
                    const Icon = getIcon(category.name);
                    return (
                      <Grid size={{ xs: 12 }} key={category.id}>
                        <Card
                          sx={{
                            bgcolor: alpha(theme.palette.background.paper, 0.2),
                            border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
                            transition: "all 0.3s",
                            "&:hover": {
                              bgcolor: alpha(
                                theme.palette.background.paper,
                                0.4,
                              ),
                              transform: "translateX(4px)",
                              border: `1px solid ${alpha(theme.palette.secondary.main, 0.4)}`,
                            },
                          }}
                        >
                          <CardActionArea
                            onClick={() => {
                              // If Buscador de Aventureros is clicked, route to LFG Board if prop provided
                              if (
                                category.name
                                  .toLowerCase()
                                  .includes("buscador") &&
                                onLFGClick
                              ) {
                                onLFGClick();
                              } else {
                                onCategorySelect(category.id);
                              }
                            }}
                            sx={{ p: 2.5 }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <Box
                                sx={{
                                  p: 1.5,
                                  bgcolor: alpha(
                                    theme.palette.secondary.main,
                                    0.1,
                                  ),
                                  borderRadius: 2,
                                  display: "flex",
                                  color: "secondary.main",
                                }}
                              >
                                <Icon fontSize="large" />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontFamily: "Cinzel, serif",
                                    fontWeight: 700,
                                    color: "text.primary",
                                    mb: 0.5,
                                  }}
                                >
                                  {category.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontFamily: '"Newsreader", serif',
                                  }}
                                >
                                  {category.description}
                                </Typography>
                              </Box>
                              {/* Mock Stats */}
                              <Box
                                sx={{
                                  display: { xs: "none", sm: "flex" },
                                  gap: 3,
                                  mr: 2,
                                }}
                              >
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    SCROLLS
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="secondary.main"
                                    fontWeight="bold"
                                  >
                                    {categoryStats[category.id]?.threads || 0}
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    RUNES
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="secondary.main"
                                    fontWeight="bold"
                                  >
                                    {categoryStats[category.id]?.posts || 0}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            );
          })}
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {onThreadSelect && (
            <ForumSidebar
              onThreadSelect={onThreadSelect}
              onProductSelect={onProductSelect}
              onLFGClick={onLFGClick}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ForumHome;
