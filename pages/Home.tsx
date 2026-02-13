/// <reference lib="dom" />
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  IconButton,
  alpha,
} from "@mui/material";
import { styled, keyframes, useTheme } from "@mui/material/styles";
import {
  ChevronLeft,
  ChevronRight,
  MenuBook,
  AutoAwesome,
  AutoFixHigh,
  Hub,
  KeyboardArrowDown,
  Api,
} from "@mui/icons-material";
import { RuneDivider, CornerFlourish } from "../components/StyledComponents";
import { ViewState, Product } from "../types";

interface HomeProps {
  setView: (view: ViewState) => void;
  onFilterNavigate: (filters: {
    categories?: string[];
    creatureTypes?: string[];
  }) => void;
  products: Product[];
}

const SUPABASE_BANNER_BASE =
  "https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/banners/";

const HERO_SLIDES = [


  {
    image: `${SUPABASE_BANNER_BASE}home_banner_pathfinder.jpg`,
    subtitle: "Dungeons & Dragons",
    title: "Aventuras ",
    titleHighlight: "Épicas",
    titleSuffix: "",
    description: "Todo lo que necesitas para tu próxima campaña.",
    cta: "Explorar D&D",
  },
  {
    image: `${SUPABASE_BANNER_BASE}home_banner_dnd.png`,
    subtitle: "Pathfinder",
    title: "Senda del ",
    titleHighlight: "Explorador",
    titleSuffix: "",
    description: "Criaturas y héroes para el mundo de Golarion.",
    cta: "Ver Pathfinder",
  },
  {
    image: `${SUPABASE_BANNER_BASE}home_banner_warhammer.png`,
    subtitle: "Warhammer 40k",
    title: "En el ",
    titleHighlight: "Futuro Sombrío",
    titleSuffix: "",
    description: "Solo hay guerra. Prepara tu ejército.",
    cta: "Por el Emperador",
  },
  {
    image: `${SUPABASE_BANNER_BASE}home_banner_anime.png`,
    subtitle: "Colección Anime",
    title: "Héroes de ",
    titleHighlight: "Leyenda",
    titleSuffix: "",
    description: "Figuras icónicas del anime esculpidas con detalle.",
    cta: "Ver Colección",
  },

  {
    image: `${SUPABASE_BANNER_BASE}home_banner_starwars.png`,
    subtitle: "Star Wars",
    title: "Una Galaxia ",
    titleHighlight: "Lejana",
    titleSuffix: "",
    description: "Únete a la Rebelión o al Imperio con estas miniaturas.",
    cta: "Que la fuerza te acompañe",
  },

];

// Helper styles
const HeroGradient =
  "linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 40%, rgba(0, 0, 0, 0) 100%)";
const CollectionGradient =
  "linear-gradient(0deg, rgba(34, 16, 16, 0.95) 0%, rgba(34, 16, 16, 0.1) 50%)";

// Keyframes
const sparkleAnim = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
`;

const logoFade = keyframes`
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
`;

const borderGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(197, 160, 89, 0.3), inset 0 0 20px rgba(0,0,0,0.3); }
  50% { box-shadow: 0 0 40px rgba(197, 160, 89, 0.5), inset 0 0 30px rgba(0,0,0,0.4); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const textReveal = keyframes`
  0% { opacity: 0; transform: translateY(30px); filter: blur(10px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
`;

const floatParticle = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
`;

const scrollReviews = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// Helper component for scroll animations
const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in ms
  direction?: "up" | "left" | "right";
}> = ({ children, delay = 0, direction = "up" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Animate once
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return "none";
    switch (direction) {
      case "left":
        return "translateX(-48px)";
      case "right":
        return "translateX(48px)";
      case "up":
      default:
        return "translateY(48px)";
    }
  };

  return (
    <Box
      ref={ref}
      sx={{
        transition: "all 1s ease-out",
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Box>
  );
};

const Home: React.FC<HomeProps> = ({ setView, onFilterNavigate, products }) => {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic Featured Collections Logic
  const featuredCollections = useMemo(() => {
    // 1. Heroes de Fantasía: category D&D + humanoid (case insensitive)
    const fantasyHero = [...products]
      .filter(p =>
        p.category === "D&D" &&
        p.creature_type?.toLowerCase().includes("humanoid")
      )
      .sort((a, b) => b.id.localeCompare(a.id))[0];

    // 2. Guerreros Sci-Fi: category Warhammer
    const scifiHero = [...products]
      .filter(p => p.category === "Warhammer")
      .sort((a, b) => b.id.localeCompare(a.id))[0];

    // 3. Manual de Monstruos: category D&D + monstrosity
    const monsterHero = [...products]
      .filter(p =>
        p.category === "D&D" &&
        p.creature_type?.toLowerCase().includes("monstrosity")
      )
      .sort((a, b) => b.id.localeCompare(a.id))[0];

    return [
      {
        title: "Héroes de Fantasía",
        sub: "Enanos, Elfos y los Defensores de la Luz.",
        img: fantasyHero?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuB3o4U20eQujlqlLivp6dfCAP5GGzSX_QIVGCsZjAW44J4Cn5dH3fh--dQTkyhXBkrF8FhFqEkEYr9RQT-DUD067sGwueG54R6I2D9AWpl0SZeHcNNNBlpw-hJcGf44E_evb6KJAvH1iUIbN3XlyqFqu1eAkxpckNTqSho97MfodGIWlijVtftnohk4UDHDDFQLMabvPPyGlPuNecTztgQfAeFoes10LMhaiBmRzvnS1bSmrAv4HZDh04MXIr9oLJX0zf3HFw_Us5E",
        filters: { categories: ["D&D"] }
      },
      {
        title: "Guerreros Sci-Fi",
        sub: "Terrores mecánicos y viajeros estelares.",
        img: scifiHero?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
        filters: { categories: ["Warhammer"] }
      },
      {
        title: "Manual de Monstruos",
        sub: "Abominaciones, Bestias y los Grandes Dragones.",
        img: monsterHero?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
        filters: { categories: ["D&D"], creatureTypes: ["Monstrosity"] }
      },
    ];
  }, [products]);

  // Dynamic Chronicles Logic
  const chronicleCollections = useMemo(() => {
    // 1. Anime: category Anime
    const animeHero = [...products]
      .filter(p => p.category === "Anime")
      .sort((a, b) => b.id.localeCompare(a.id))[0];

    // 2. Juegos: category Juegos
    const juegosHero = [...products]
      .filter(p => p.category === "Juegos")
      .sort((a, b) => b.id.localeCompare(a.id))[0];

    // 3. Series y Cine: category Cine
    const cineHero = [...products]
      .filter(p => p.category === "Cine")
      .sort((a, b) => b.id.localeCompare(a.id))[0];

    return [
      {
        title: "Artesanos del Ki",
        sub: "Guerreros del sol naciente, portadores de almas forjadas en tinta y celuloide.",
        tag: "Reinos Orientales",
        original: "Anime",
        img: animeHero?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
        filters: { categories: ["Anime"] }
      },
      {
        title: "El Cónclave de los Mandos",
        sub: "De las mazmorras digitales a la palma de tu mano. Héroes que han superado el Game Over.",
        tag: "Senda de Bits",
        original: "Juegos",
        img: juegosHero?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
        filters: { categories: ["Juegos"] }
      },
      {
        title: "Titanes del Séptimo Reino",
        sub: "Grandes leyendas que han cruzado el umbral de la pantalla para reclamar su lugar en tu mesa.",
        tag: "Proyección Épica",
        original: "Series y Cine",
        img: cineHero?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
        filters: { categories: ["Cine"] }
      },
    ];
  }, [products]);

  useEffect(() => {
    setHeroLoaded(true);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
    );
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box sx={{ py: 0 }}>
        <Container maxWidth={false} disableGutters>
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              marginTop: "50px",
              height: "100dvh",
              minHeight: "100dvh",
              bgcolor: "common.black",
              // Original Bottom Mask (Restored)
              maskImage: `linear-gradient(to bottom, black 85%, transparent 100%), url('https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/banners/home_banner.png')`,
              maskSize: "10% 10%, 100% 100%",
              maskPosition: "top, bottom",
              maskRepeat: "no-repeat, no-repeat",
              WebkitMaskImage: `linear-gradient(to bottom, black 85%, transparent 100%), url('https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/banners/home_banner.png')`,
              WebkitMaskSize: "10% 10%, 100% 100%",
              WebkitMaskPosition: "top, bottom",
              WebkitMaskRepeat: "no-repeat, no-repeat",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 2,
                background:
                  "radial-gradient(ellipse at 100% 50%, rgba(197, 160, 89, 0.1) 10%, transparent 50%)",
                pointerEvents: "none",
                zIndex: 2,
              },
            }}
          >
            {/* Floating Particles */}
            {[...Array(6)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  width: 8,
                  height: 8,
                  bgcolor: "secondary.main",
                  borderRadius: "50%",
                  top: `${10 + i * 12}%`,
                  left: `${10 + i * 15}%`,
                  animation: `${floatParticle} ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                  zIndex: 3,
                  pointerEvents: "none",
                  boxShadow: "0 0 10px rgba(197, 160, 89, 0.5)",
                }}
              />
            ))}

            {/* Slides Carousel */}
            {HERO_SLIDES.map((slide, idx) => (
              <Box
                key={idx}
                sx={{
                  position: "absolute",
                  inset: 0,
                  transition: "opacity 4s ease-in-out",
                  opacity: idx === currentSlide ? 1 : 0,
                  zIndex: idx === currentSlide ? 1 : 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  p: { xs: 2, sm: 3, md: 10, lg: 20 },
                  pb: { xs: 14, sm: 18, md: 10, lg: 20 }, // Adjusted for 320px
                }}
              >
                {/* Background Image */}
                <Box
                  component="img"
                  src={slide.image}
                  alt={slide.title}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: -1,
                  }}
                />

                {/* Gradient Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: HeroGradient,
                    zIndex: -1,
                  }}
                />
                {/* Animated Logo Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "30%",
                    left: "80%",
                    right: "80%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 0,
                    pointerEvents: "none",
                    opacity: 0.4,
                    animation: `${logoFade} 4s ease-in-out infinite`,
                    display: { xs: "none", md: "block" },
                  }}
                >
                  {/* Logo Placeholder - simplified as a large icon or text */}
                  <Box
                    component="img"
                    src={`https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/guide/YunqueSolo.svg`}
                    alt="SoulForge Logo"
                    sx={{
                      width: 200,
                      height: 200,
                      opacity: 0.4,
                      filter:
                        "brightness(100%) saturate(100%) invert(88%) sepia(0%) saturate(1217%) hue-rotate(359deg) brightness(88%) contrast(92%)", // Filter to approximate secondary.main color
                      animation: `${logoFade} 3s ease-in-out infinite`,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    maxWidth: "md",
                    position: "relative",
                    zIndex: 10,
                    transition: "all 1s ease-out",
                    transitionDelay: "300ms",
                    opacity: heroLoaded && idx === currentSlide ? 1 : 0,
                    transform:
                      heroLoaded && idx === currentSlide
                        ? "translateY(0)"
                        : "translateY(48px)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontStyle: "italic",
                      color: "secondary.main",
                      mb: 1,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      animation:
                        heroLoaded && idx === currentSlide
                          ? `${textReveal} 0.8s ease-out forwards`
                          : "none",
                      animationDelay: "0.2s",
                      opacity: 0,
                    }}
                  >
                    {slide.subtitle}
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      color: "common.white",
                      mb: 3,
                      textShadow:
                        "0 4px 20px rgba(0,0,0,0.7), 0 0 40px rgba(197, 160, 89, 0.2)",
                      animation:
                        heroLoaded && idx === currentSlide
                          ? `${textReveal} 0.8s ease-out forwards`
                          : "none",
                      animationDelay: "0.4s",
                      opacity: 0,
                      fontSize: { xs: "2rem", sm: "2.5rem", md: "3.75rem" },
                      lineHeight: { xs: 1.1, md: 1.2 },
                    }}
                  >
                    {slide.title}
                    <Typography
                      component="span"
                      variant="inherit"
                      color="primary"
                      sx={{
                        fontStyle: "italic",
                        textShadow: (t) => `
                          0 0 30px rgba(212, 17, 17, 0.5),
                          -1px -1px 0 #fff,  
                           1px -1px 0 #fff,
                          -1px  1px 0 #fff,
                           1px  1px 0 #fff,
                           0 0 8px rgba(255, 255, 255, 0.8)
                        `,
                      }}
                    >
                      {slide.titleHighlight}
                    </Typography>
                    {slide.titleSuffix}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "grey.300",
                      mb: 5,
                      maxWidth: 600,
                      fontSize: { xs: "1rem", md: "1.5rem" },
                    }}
                  >
                    {slide.description}
                  </Typography>
                  <Button
                    onClick={() => setView(ViewState.CATALOG)}
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                      px: { xs: 3, sm: 4 },
                      py: 2,
                      fontWeight: "bold",
                      letterSpacing: 2,
                      position: "relative",
                      border: "1px solid",
                      borderColor: "primary.light",
                    }}
                  >
                    {slide.cta}
                  </Button>
                </Box>
              </Box>
            ))}

            {/* Navigation Controls */}
            <Box
              sx={{
                position: "absolute",
                bottom: 56, // Just above the pagination
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 30,
                display: "flex",
                gap: 1,
              }}
            >
              <IconButton
                onClick={prevSlide}
                size="small"
                sx={{
                  border: 1,
                  borderColor: "rgba(197, 160, 89, 0.3)",
                  bgcolor: "rgba(0,0,0,0.4)",
                  color: "secondary.main",
                  width: 32, // Fixed small size
                  height: 32,
                  "&:hover": {
                    bgcolor: "secondary.main",
                    color: "common.black",
                  },
                }}
              >
                <ChevronLeft fontSize="small" />
              </IconButton>
              <IconButton
                onClick={nextSlide}
                size="small"
                sx={{
                  border: 1,
                  borderColor: "rgba(197, 160, 89, 0.3)",
                  bgcolor: "rgba(0,0,0,0.4)",
                  color: "secondary.main",
                  width: 32, // Fixed small size
                  height: 32,
                  "&:hover": {
                    bgcolor: "secondary.main",
                    color: "common.black",
                  },
                }}
              >
                <ChevronRight fontSize="small" />
              </IconButton>
            </Box>

            {/* Pagination Indicators */}
            <Box
              sx={{
                position: "absolute",
                bottom: 32,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 30,
                display: "flex",
                gap: 1,
              }}
            >
              {HERO_SLIDES.map((_, idx) => (
                <Box
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  sx={{
                    height: 6,
                    borderRadius: 4,
                    cursor: "pointer",
                    transition: "all 0.5s",
                    width: idx === currentSlide ? 32 : 8,
                    bgcolor:
                      idx === currentSlide
                        ? "secondary.main"
                        : "rgba(255,255,255,0.3)",
                    boxShadow:
                      idx === currentSlide ? "0 0 10px #c5a059" : "none",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.6)" },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Scroll Indicator - Moved inside/near Hero */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 2, // Moved down as requested
              mb: 4,
              position: "relative",
              zIndex: 40,
              animation: "pulse 2s infinite",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "secondary.main",
                mb: 1,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontSize: "0.7rem",
                textShadow: "0 0 10px rgba(0,0,0,0.5)",
              }}
            >
              Explorar más
            </Typography>
            <KeyboardArrowDown
              sx={{
                fontSize: 32,
                color: "secondary.main",
                animation: `${bounce} 2s infinite`,
                cursor: "pointer",
                filter: "drop-shadow(0 0 5px rgba(0,0,0,0.5))",
              }}
              onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
            />
          </Box>
        </Container>
      </Box>

      {/* Decorative Divider */}
      <ScrollReveal>
        <RuneDivider variant="section" glowing />
      </ScrollReveal>

      {/* Featured Collections */}
      <Box sx={{ py: 6 }}>
        <Container maxWidth="xl">
          <ScrollReveal>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "flex-end" },
                justifyContent: "space-between",
                gap: { xs: 2, md: 0 },
                mb: 5,
                pb: 2,
                borderBottom: 1,
                borderColor: "rgba(197, 160, 89, 0.1)",
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "secondary.main",
                    letterSpacing: "0.2em",
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  BÓVEDAS CURADAS
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    color: "common.white",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Colecciones Destacadas
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    color: "common.white",
                    display: { xs: "block", sm: "none" },
                  }}
                >
                  Destacado
                </Typography>
              </Box>
              <Button
                onClick={() => setView(ViewState.CATALOG)}
                sx={{
                  color: "secondary.main",
                  letterSpacing: 2,
                  fontWeight: "bold",
                }}
              >
                Ver Catálogo
              </Button>
            </Box>
          </ScrollReveal>

          <Grid container spacing={{ xs: 2, md: 4 }}>
            {featuredCollections.map((col, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 4 }}>
                <ScrollReveal delay={idx * 200}>
                  <Box
                    onClick={() => onFilterNavigate(col.filters)}
                    sx={{
                      position: "relative",
                      aspectRatio: "4/5",
                      borderRadius: 2,
                      border: 2,
                      borderColor: "secondary.main",
                      cursor: "pointer",
                      overflow: "hidden",
                      "&:hover .bg-image": { transform: "scale(1.1)" },
                      "&:hover .col-sub": {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    }}
                  >
                    <Box
                      className="bg-image"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `${CollectionGradient}, url("${col.img}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        transition: "transform 0.7s",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          fontStyle: "italic",
                          mb: 1,
                        }}
                      >
                        {col.title}
                      </Typography>
                      <Typography
                        className="col-sub"
                        variant="body2"
                        sx={{
                          color: "grey.400",
                          transition: "all 0.3s",
                          opacity: 0,
                          transform: "translateY(16px)",
                        }}
                      >
                        {col.sub}
                      </Typography>
                    </Box>
                    {/* Corner Flourishes */}
                    <CornerFlourish position="top-left" animated />
                    <CornerFlourish position="top-right" animated />
                    <CornerFlourish position="bottom-left" animated />
                    <CornerFlourish position="bottom-right" animated />
                  </Box>
                </ScrollReveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Scroll Indicator after Collections */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 2,
          bgcolor: "background.default",
        }}
      >
        <KeyboardArrowDown
          sx={{
            fontSize: 30,
            color: "secondary.main",
            animation: "bounce 2s infinite",
            cursor: "pointer",
            opacity: 0.6,
          }}
          onClick={() => {
            const nextSection = document.querySelector(
              '[data-section="rift-chronicles"]',
            );
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />
      </Box>

      {/* Rift Chronicles Section */}
      <Box
        data-section="rift-chronicles"
        sx={{
          position: "relative",
          py: 12,
          px: { xs: 2, lg: 10 },
          overflow: "hidden",
          bgcolor: "background.default",
          borderTop: 1,
          borderColor: "rgba(197, 160, 89, 0.2)",
        }}
      >
        {/* Background Effects */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, #2e1065, #1a0b2e, #000000)",
            opacity: 0.6,
            zIndex: 0,
          }}
        />

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <ScrollReveal>
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  color: "secondary.main",
                  opacity: 0.6,
                  mb: 2,
                }}
              >
                <Box sx={{ width: 48, height: 1, bgcolor: "secondary.main" }} />
                <AutoAwesome
                  fontSize="small"
                  sx={{ animation: `${sparkleAnim} 2s infinite ease-in-out` }}
                />
                <Box sx={{ width: 48, height: 1, bgcolor: "secondary.main" }} />
              </Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  background:
                    "linear-gradient(to right, #c5a059, #ffffff, #c5a059)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: { xs: "2rem", md: "3.75rem" },
                }}
              >
                Las Crónicas de la Brecha
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontStyle: "italic",
                  color: "grey.300",
                  maxWidth: "md",
                  mx: "auto",
                }}
              >
                "Las forjas han abierto una puerta a realidades extrañas y
                distantes. Contempla héroes de grafito y tinta, espíritus de
                animación y titanes de la pantalla grande."
              </Typography>
            </Box>
          </ScrollReveal>

          <Grid container spacing={{ xs: 2, md: 4 }}>
            {chronicleCollections.map((item, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 4 }}>
                <ScrollReveal delay={idx * 150}>
                  <Box
                    onClick={() => onFilterNavigate(item.filters)}
                    sx={{
                      position: "relative",
                      height: 500,
                      borderRadius: "200px 200px 0 0", // Archway shape
                      overflow: "hidden",
                      border: 2,
                      borderColor: "rgba(197, 160, 89, 0.3)",
                      bgcolor: "common.black",
                      cursor: "pointer",
                      "&:hover": {
                        borderColor: "secondary.main",
                        boxShadow: "0 0 30px rgba(197,160,89,0.2)",
                      },
                      "&:hover .bg-img": {
                        transform: "scale(1.1)",
                        opacity: 1,
                      },
                      "&:hover .content-sub": {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    }}
                  >
                    <Box
                      className="bg-img"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url("${item.img}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.6,
                        transition: "all 0.7s",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, #000 0%, transparent 60%)",
                      }}
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="overline"
                        sx={{
                          color: "secondary.main",
                          fontWeight: "bold",
                          letterSpacing: 2,
                          mb: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          lineHeight: 1.2,
                          minHeight: "3rem", // Added to align titles
                          justifyContent: "center"
                        }}
                      >
                        {item.tag}
                        <Box
                          component="span"
                          sx={{
                            fontSize: "0.65rem",
                            opacity: 0.7,
                            letterSpacing: 1,
                            fontWeight: "medium",
                            textTransform: "none",
                            fontStyle: "italic",
                          }}
                        >
                          ({(item as any).original})
                        </Box>
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          color: "common.white",
                          fontStyle: "italic",
                          fontWeight: "bold",
                          mb: 2,
                          fontSize: {
                            xs: item.title.length > 20 ? "1.5rem" : "1.75rem",
                            md: item.title.length > 20 ? "1.85rem" : "2.125rem"
                          },
                          minHeight: { xs: "3.5rem", md: "5.5rem" },
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        className="content-sub"
                        variant="body2"
                        sx={{
                          color: "grey.400",
                          opacity: 0,
                          transform: "translateY(10px)",
                          transition: "all 0.5s",
                          minHeight: "3rem", // Added to align bottoms
                        }}
                      >
                        {item.sub}
                      </Typography>
                    </Box>
                  </Box>
                </ScrollReveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials / Reviews Section - Ecos de la Forja */}
      <Box
        sx={{
          py: 10,
          bgcolor: "background.paper",
          position: "relative",
          overflow: "hidden",
          borderBottom: 1,
          borderColor: "rgba(197, 160, 89, 0.1)",
        }}
      >
        <Container maxWidth="xl">
          <ScrollReveal>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "secondary.main",
                  letterSpacing: 3,
                  fontWeight: "bold",
                  mb: 1,
                  textTransform: "uppercase",
                }}
              >
                Ecos de la Forja
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  color: "common.white",
                  fontStyle: "italic",
                }}
              >
                Pergaminos de Agradecimiento
              </Typography>
            </Box>
          </ScrollReveal>

          {/* Infinite Scrolling Review Track */}
          <Box
            sx={{
              display: "flex",
              overflow: "hidden",
              position: "relative",
              py: 4,
              "&::before, &::after": {
                content: '""',
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 150,
                zIndex: 2,
                pointerEvents: "none",
              },
              "&::before": {
                left: 0,
                background: "linear-gradient(to right, #1a0b2e, transparent)",
              },
              "&::after": {
                right: 0,
                background: "linear-gradient(to left, #1a0b2e, transparent)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 4,
                animation: `${scrollReviews} 40s linear infinite`,
                "&:hover": { animationPlayState: "paused" },
              }}
            >
              {[...Array(2)].map((_, i) => (
                <Box key={i} sx={{ display: "flex", gap: 4 }}>
                  {[
                    {
                      user: "Lord Galen",
                      text: "La calidad de los detalles en el Dragón Rojo es simplemente legendaria. ¡Mis jugadores quedaron aterrados!",
                      rating: 5,
                      variant: "Aventurero Veterano",
                    },
                    {
                      user: "Mago Silencioso",
                      text: "El envío fue más rápido que un conjuro de teletransporte. Muy bien empaquetado.",
                      rating: 5,
                      variant: "Maestro de Runas",
                    },
                    {
                      user: "Bardo Anonimo",
                      text: "Las miniaturas tienen un peso y una textura perfectos para pintar. Altamente recomendadas.",
                      rating: 4,
                      variant: "Escriba",
                    },
                    {
                      user: "Enano Forjador",
                      text: "La resina es resistente. Se me cayó un Orco y no se rompió ni una astilla. ¡Artesanía de enanos!",
                      rating: 5,
                      variant: "Guerrero de Montaña",
                    },
                    {
                      user: "Elfa Estelar",
                      text: "Diseños únicos que no encuentras en ningún otro lado. Soulforge es mi nueva tienda favorita.",
                      rating: 5,
                      variant: "Cazadora",
                    },
                  ].map((review, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        p: 4,
                        minWidth: { xs: 280, md: 350 },
                        maxWidth: { xs: 280, md: 350 },
                        bgcolor: "rgba(255,255,255,0.02)",
                        border: 1,
                        borderColor: "rgba(197, 160, 89, 0.2)",
                        borderRadius: 2,
                        position: "relative",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                      }}
                    >
                      <AutoAwesome
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          fontSize: 16,
                          color: "secondary.main",
                          opacity: 0.3,
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          color: "grey.300",
                          fontStyle: "italic",
                          mb: 3,
                          minHeight: 80,
                        }}
                      >
                        "{review.text}"
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: "secondary.main",
                            color: "common.black",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "1.2rem",
                          }}
                        >
                          {review.user.charAt(0)}
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: "common.white", fontWeight: "bold" }}
                          >
                            {review.user}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "secondary.main",
                              opacity: 0.7,
                              textTransform: "uppercase",
                              fontSize: "0.6rem",
                            }}
                          >
                            {review.variant}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Promotions Section */}
      <Box
        sx={{
          py: 12,
          px: { xs: 2, lg: 10 },
          bgcolor: "background.paper",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 400,
            height: 400,
            bgcolor: "primary.dark",
            filter: "blur(100px)",
            borderRadius: "50%",
            opacity: 0.2,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 400,
            height: 400,
            bgcolor: "secondary.dark",
            filter: "blur(100px)",
            borderRadius: "50%",
            opacity: 0.2,
          }}
        />

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <ScrollReveal direction="left">
                <Paper
                  sx={{
                    p: 6,
                    bgcolor: "rgba(255,255,255,0.02)",
                    backdropFilter: "blur(10px)",
                    border: 1,
                    borderColor: "primary.main",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      color: "common.white",
                      fontStyle: "italic",
                      mb: 2,
                    }}
                  >
                    Nadie se queda atrás
                  </Typography>
                  <Typography sx={{ color: "grey.400", mb: 4 }}>
                    Si tu grupo de aventureros está buscando forjar un alma en
                    resina, nosotros te ayudamos ofreciendoté un descuento en
                    compras de 4 miniaturas o más.
                  </Typography>

                  <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
                    <AutoFixHigh
                      sx={{ color: "secondary.main", fontSize: 40 }}
                    />

                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "common.white", fontWeight: "bold" }}
                      >
                        DUNGEON MASTER
                      </Typography>
                      <Typography variant="body2" sx={{ color: "grey.500" }}>
                        Expandí tu colección de criaturas, desde Boblin el
                        Goblin, hasta Tiamat La Reina de los Dragones
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "rgba(14, 165, 233, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: 1,
                        borderColor: "primary.main",
                      }}
                    >
                      <Api sx={{ color: "primary.main", fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "common.white", fontWeight: "bold" }}
                      >
                        WARHAMMER 40K
                      </Typography>
                      <Typography variant="body2" sx={{ color: "grey.500" }}>
                        Complacé al Emperador con nuevos reclutas para la guerra
                        Eterna
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </ScrollReveal>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ScrollReveal direction="right">
                <Box sx={{ textAlign: "center", pl: { md: 8 } }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      mb: 3,
                      textShadow: "0 0 20px rgba(197,160,89,0.5)",
                      fontSize: { xs: "2.5rem", md: "3.75rem" },
                    }}
                  >
                    <Typography
                      component="span"
                      variant="inherit"
                      sx={{
                        background:
                          "linear-gradient(to right, #c084fc, #ec4899)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Proximamente
                    </Typography>{" "}
                    Ediciones Limitadas
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "grey.400", mb: 6, fontStyle: "italic" }}
                  >
                    "Extraemos artefactos del éter antes de que el portal se
                    cierre. Una vez que el molde se rompe, la conexión se corta
                    para siempre."
                  </Typography>
                </Box>
              </ScrollReveal>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
