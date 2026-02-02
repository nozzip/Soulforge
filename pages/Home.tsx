/// <reference lib="dom" />
import React, { useEffect, useRef, useState } from "react";
import { ViewState } from "../types";
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

interface HomeProps {
  setView: (view: ViewState) => void;
}

const HERO_SLIDES = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCOt5aQZidteyosgKEH6adeFrjY70HvrEfGe899g00U3xAIYG56c8fgeqBKxO8l7H88pIM9fvKCjOFj31ZRGXSNJMm0amjBByouYk2tQS9cJlO5tRXVypnfYTl4GOedXMMTeHteiT4YEek0yhThUIU-I3adq46F_jGdWXWA81N4fXwHAGu-qCKql3q3IOj_6RX7xJ3VDGhUy-IG7TOmabJh_2bG_B3XyQLiG6dKr1cd6iFYDBbZoCfADZlGEJy_eQT0j1kbKsuRM9c",
    subtitle: "Serie de Legado 2024",
    title: "Haz que tu ",
    titleHighlight: "Leyenda",
    titleSuffix: " Cobre Vida",
    description:
      "Impresiones de resina de alta calidad inspiradas en los últimos manuales. La ingeniería de precisión se une al arte mítico.",
    cta: "Entrar en la Forja",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
    subtitle: "Desde el Vacío Profundo",
    title: "Desata el ",
    titleHighlight: "Horror",
    titleSuffix: " Interior",
    description:
      "Aberraciones gargantuescas esculpidas con un detalle enloquecedor. Perfectas para tu próximo TPK.",
    cta: "Ver Monstruos",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
    subtitle: "Futuro Sombrío",
    title: "Despliega las ",
    titleHighlight: "Legiones de Hierro",
    titleSuffix: "",
    description:
      "Paquetes basados en escuadrones y unidades de apoyo pesado listos para la guerra eterna.",
    cta: "Equipa a tu Ejército",
  },
];

// Helper styles
const HeroGradient =
  "linear-gradient(to top, rgba(34, 16, 16, 0.9) 0%, rgba(34, 16, 16, 0.2) 60%, rgba(34, 16, 16, 0.1) 100%)";
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

const Home: React.FC<HomeProps> = ({ setView }) => {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setHeroLoaded(true);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
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
      <Box sx={{ px: { xs: 2, lg: 10 }, py: 6 }}>
        <Container maxWidth="xl" disableGutters>
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 3,
              border: "4px solid", // Strengthened border
              borderColor: "secondary.main", // Gold border
              minHeight: "560px",
              bgcolor: "common.black",
              animation: `${borderGlow} 4s ease-in-out infinite`,
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 30% 70%, rgba(197, 160, 89, 0.1) 0%, transparent 50%)",
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
                  width: 4,
                  height: 4,
                  bgcolor: "secondary.main",
                  borderRadius: "50%",
                  top: `${20 + i * 12}%`,
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
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transition: "opacity 1s ease-in-out",
                  opacity: idx === currentSlide ? 1 : 0,
                  zIndex: idx === currentSlide ? 1 : 0,
                  backgroundImage: `${HeroGradient}, url("${slide.image}")`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  p: { xs: 4, lg: 8 },
                }}
              >
                {/* Animated Logo Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 0,
                    pointerEvents: "none",
                    opacity: 0.2,
                    animation: `${logoFade} 4s ease-in-out infinite`,
                  }}
                >
                  {/* Logo Placeholder - simplified as a large icon or text */}
                  <Hub
                    sx={{
                      fontSize: 400,
                      color: "secondary.main",
                      opacity: 0.2,
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
                    }}
                  >
                    {slide.title}
                    <Typography
                      component="span"
                      variant="inherit"
                      color="primary"
                      sx={{
                        fontStyle: "italic",
                        textShadow: "0 0 30px rgba(212, 17, 17, 0.5)",
                      }}
                    >
                      {slide.titleHighlight}
                    </Typography>
                    {slide.titleSuffix}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ color: "grey.300", mb: 5, maxWidth: 600 }}
                  >
                    {slide.description}
                  </Typography>
                  <Button
                    onClick={() => setView(ViewState.CATALOG)}
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                      px: 4,
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
                bottom: 32,
                right: 32,
                zIndex: 30,
                display: "flex",
                gap: 2,
              }}
            >
              <IconButton
                onClick={prevSlide}
                sx={{
                  border: 1,
                  borderColor: "rgba(197, 160, 89, 0.3)",
                  bgcolor: "rgba(0,0,0,0.4)",
                  color: "secondary.main",
                  "&:hover": {
                    bgcolor: "secondary.main",
                    color: "common.black",
                  },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={nextSlide}
                sx={{
                  border: 1,
                  borderColor: "rgba(197, 160, 89, 0.3)",
                  bgcolor: "rgba(0,0,0,0.4)",
                  color: "secondary.main",
                  "&:hover": {
                    bgcolor: "secondary.main",
                    color: "common.black",
                  },
                }}
              >
                <ChevronRight />
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
      <Box sx={{ px: { xs: 2, lg: 10 }, py: 6 }}>
        <Container maxWidth="xl">
          <ScrollReveal>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
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
                  sx={{ fontWeight: "bold", color: "common.white" }}
                >
                  Colecciones Destacadas
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

          <Grid container spacing={4}>
            {[
              {
                title: "Héroes de Fantasía",
                sub: "Enanos, Elfos y los Defensores de la Luz.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3o4U20eQujlqlLivp6dfCAP5GGzSX_QIVGCsZjAW44J4Cn5dH3fh--dQTkyhXBkrF8FhFqEkEYr9RQT-DUD067sGwueG54R6I2D9AWpl0SZeHcNNNBlpw-hJcGf44E_evb6KJAvH1iUIbN3XlyqFqu1eAkxpckNTqSho97MfodGIWlijVtftnohk4UDHDDFQLMabvPPyGlPuNecTztgQfAeFoes10LMhaiBmRzvnS1bSmrAv4HZDh04MXIr9oLJX0zf3HFw_Us5E",
              },
              {
                title: "Guerreros Sci-Fi",
                sub: "Terrores mecánicos y viajeros estelares.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
              },
              {
                title: "Manual de Monstruos",
                sub: "Abominaciones, Bestias y los Grandes Dragones.",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
              },
            ].map((col, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 4 }}>
                <ScrollReveal delay={idx * 200}>
                  <Box
                    onClick={() => setView(ViewState.CATALOG)}
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

          <Grid container spacing={4}>
            {[
              {
                title: "Espíritu y Acero",
                sub: "Desde chicas mágicas hasta guerreros shonen.",
                tag: "Reinos del Este",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
              },
              {
                title: "Capas y Capuchas",
                sub: "Los dioses de la tinta y el papel.",
                tag: "Mitos Modernos",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
              },
              {
                title: "Titanes del Cine",
                sub: "Kaijus, Aliens y leyendas.",
                tag: "Pantalla Grande",
                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
              },
            ].map((item, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 4 }}>
                <ScrollReveal delay={idx * 150}>
                  <Box
                    onClick={() => setView(ViewState.CATALOG)}
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
                          letterSpacing: 3,
                          mb: 1,
                        }}
                      >
                        {item.tag}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          color: "common.white",
                          fontStyle: "italic",
                          fontWeight: "bold",
                          mb: 2,
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
                      text: "Diseños únicos que no encuentras en ningún otro lado. ResinForge es mi nueva tienda favorita.",
                      rating: 5,
                      variant: "Cazadora",
                    },
                  ].map((review, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        p: 4,
                        minWidth: 350,
                        maxWidth: 350,
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
