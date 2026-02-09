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
} from "@mui/material";
import { supabase } from "../../src/supabase";
import { ForumCategory } from "../../types";
import {
  LocalBar as LocalBarIcon,
  Brush as BrushIcon,
  AutoStories as AutoStoriesIcon,
  Storefront as StorefrontIcon,
  Forum as ForumIcon,
  Groups as GroupsIcon,
  Handyman as HandymanIcon,
  ReportProblem as HorrorIcon,
} from "@mui/icons-material";

// Map icons based on category name or other logic
const getIcon = (name: string) => {
  if (name.includes("Taberna")) return LocalBarIcon;
  if (name.includes("Buscador")) return GroupsIcon;
  if (name.includes("Forja")) return HandymanIcon;
  if (name.includes("Historias")) return HorrorIcon;
  if (name.includes("Reglas") || name.includes("Lore")) return AutoStoriesIcon;
  return ForumIcon;
};

interface ForumHomeProps {
  onCategorySelect: (categoryId: string) => void;
}

const ForumHome: React.FC<ForumHomeProps> = ({ onCategorySelect }) => {
  const theme = useTheme();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

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
    <Container maxWidth="lg" sx={{ mt: 16, mb: 10 }}>
      {/* Header Banner */}
      <Box
        sx={{
          textAlign: "center",
          mb: 8,
          py: 8,
          px: 4,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.secondary.main, 0.15)})`,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
          backdropFilter: "blur(12px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -20,
            left: -20,
            width: 150,
            height: 150,
            backgroundImage: "url(/images/guide/logoTextoSolo.svg)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            opacity: 0.1,
            transform: "rotate(-15deg)",
          }}
        />
        <Typography
          variant="h2"
          sx={{
            fontFamily: "Cinzel, serif",
            fontWeight: "bold",
            color: "secondary.main",
            mb: 2,
            textShadow: "0 2px 4px rgba(0,0,0,0.6)",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
          }}
        >
          La Taberna del Aventurero
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Newsreader", serif',
            color: "text.secondary",
            maxWidth: "800px",
            mx: "auto",
            fontStyle: "italic",
            lineHeight: 1.6,
          }}
        >
          Toma asiento junto al fuego, viajero. Aquí se cuentan historias de
          batalla, se presumen tesoros pintados y se mercadean reliquias
          olvidadas.
        </Typography>
      </Box>

      {/* Categories Grid */}
      <Grid container spacing={4}>
        {categories.map((category) => {
          const Icon = getIcon(category.name);
          return (
            <Grid size={{ xs: 12, md: 6 }} key={category.id}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: alpha(theme.palette.background.paper, 0.4),
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
                  borderRadius: 3,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: `0 12px 30px ${alpha(theme.palette.secondary.main, 0.25)}`,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.6)}`,
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                  },
                }}
              >
                <CardActionArea
                  onClick={() => onCategorySelect(category.id)}
                  sx={{ height: "100%", p: 3 }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 3,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        bgcolor: alpha(theme.palette.secondary.main, 0.15),
                        color: "secondary.main",
                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
                      }}
                    >
                      <Icon fontSize="large" sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        component="div"
                        sx={{
                          fontFamily: "Cinzel, serif",
                          fontWeight: 700,
                          mb: 1.5,
                          color: "text.primary",
                          fontSize: "1.5rem",
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          fontFamily: '"Newsreader", serif',
                          fontSize: "1.05rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {category.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default ForumHome;
