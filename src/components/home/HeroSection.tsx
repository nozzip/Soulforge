import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Container, IconButton } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { getOptimizedImageUrl } from "../../../utils/imageValidation";
import {
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  Edit,
  Add,
  Delete,
  Save,
  CloudUpload,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { ViewState } from "../../../types";
import { supabase } from "@/src/supabase";
import { SUPABASE_BANNER_BASE } from "../../../constants";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Divider,
} from "@mui/material";

interface HeroSectionProps {
  setView: (view: ViewState) => void;
  isAdmin?: boolean;
}

interface HeroSlide {
  id: string;
  image_url: string;
  subtitle: string;
  title: string;
  title_highlight: string;
  title_suffix: string;
  description: string;
  cta: string;
  sort_order: number;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "1",
    image_url: `${SUPABASE_BANNER_BASE}home_banner_pathfinder.webp`,
    subtitle: "Dungeons & Dragons",
    title: "Aventuras ",
    title_highlight: "Épicas",
    title_suffix: "",
    description: "Todo lo que necesitas para tu próxima campaña.",
    cta: "Explorar D&D",
    sort_order: 0,
  },
  {
    id: "2",
    image_url: `${SUPABASE_BANNER_BASE}home_banner_dnd.webp`,
    subtitle: "Pathfinder",
    title: "Senda del ",
    title_highlight: "Explorador",
    title_suffix: "",
    description: "Criaturas y héroes para el mundo de Golarion.",
    cta: "Ver Pathfinder",
    sort_order: 1,
  },
  {
    id: "3",
    image_url: `${SUPABASE_BANNER_BASE}home_banner_warhammer.webp`,
    subtitle: "Warhammer 40k",
    title: "En el ",
    title_highlight: "Futuro Sombrío",
    title_suffix: "",
    description: "Solo hay guerra. Prepara tu ejército.",
    cta: "Por el Emperador",
    sort_order: 2,
  },
  {
    id: "4",
    image_url: `${SUPABASE_BANNER_BASE}home_banner_anime.webp`,
    subtitle: "Colección Anime",
    title: "Héroes de ",
    title_highlight: "Leyenda",
    title_suffix: "",
    description: "Figuras icónicas del anime esculpidas con detalle.",
    cta: "Ver Colección",
    sort_order: 3,
  },
  {
    id: "5",
    image_url: `${SUPABASE_BANNER_BASE}home_banner_starwars.webp`,
    subtitle: "Star Wars",
    title: "Una Galaxia ",
    title_highlight: "Lejana",
    title_suffix: "",
    description: "Únete a la Rebelión o al Imperio con estas miniaturas.",
    cta: "Que la fuerza te acompañe",
    sort_order: 4,
  },
];

const HeroGradient =
  "linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 40%, rgba(0, 0, 0, 0) 100%)";

const logoFade = keyframes`
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
`;

const floatParticle = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
`;

const textReveal = keyframes`
  0% { opacity: 0; transform: translateY(30px); filter: blur(10px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const HeroSection: React.FC<HeroSectionProps> = ({ setView, isAdmin }) => {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editingSlides, setEditingSlides] = useState<HeroSlide[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setHeroLoaded(true);
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching slides:", error);
    } else if (data && data.length > 0) {
      setSlides(data);
    }
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleOpenManage = () => {
    setEditingSlides([...slides]);
    setIsManageOpen(true);
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: crypto.randomUUID(),
      image_url: slides[0]?.image_url || "",
      subtitle: "Nuevo Subtítulo",
      title: "Nuevo ",
      title_highlight: "Título",
      title_suffix: "",
      description: "Descripción de la nueva diapositiva",
      cta: "Explorar",
      sort_order: editingSlides.length,
    };
    setEditingSlides([...editingSlides, newSlide]);
  };

  const handleRemoveSlide = (id: string) => {
    setEditingSlides(editingSlides.filter((s) => s.id !== id));
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const newSlides = [...editingSlides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [
      newSlides[targetIndex],
      newSlides[index],
    ];

    // Update sort orders
    newSlides.forEach((s, i) => (s.sort_order = i));
    setEditingSlides(newSlides);
  };

  const handleImageUpload = async (index: number, file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("assets").getPublicUrl(filePath);

      const newEditingSlides = [...editingSlides];
      newEditingSlides[index].image_url = publicUrl;
      setEditingSlides(newEditingSlides);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      // Delete existing
      const { error: deleteError } = await supabase
        .from("hero_slides")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) throw deleteError;

      // Insert all
      const slidesToInsert = editingSlides.map(({ id, ...rest }) => rest);
      const { error: insertError } = await supabase
        .from("hero_slides")
        .insert(slidesToInsert);

      if (insertError) throw insertError;

      await fetchSlides();
      setIsManageOpen(false);
      setCurrentSlide(0);
    } catch (error) {
      console.error("Error saving slides:", error);
      alert("Error al guardar los cambios");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ py: 0, position: "relative" }}>
      {isAdmin && (
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Edit />}
          onClick={handleOpenManage}
          sx={{
            position: "absolute",
            top: 80,
            right: 20,
            zIndex: 100,
            boxShadow: "0 0 15px rgba(197, 160, 89, 0.5)",
            border: "1px solid #c5a059",
          }}
        >
          Gestionar Carousel
        </Button>
      )}

      <Container maxWidth={false} disableGutters>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            marginTop: "50px",
            height: "100dvh",
            minHeight: "100dvh",
            bgcolor: "common.black",
            maskImage: `linear-gradient(to bottom, black 85%, transparent 100%), url('https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/banners/home_banner.webp')`,
            maskSize: "10% 10%, 100% 100%",
            maskPosition: "top, bottom",
            maskRepeat: "no-repeat, no-repeat",
            WebkitMaskImage: `linear-gradient(to bottom, black 85%, transparent 100%), url('https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/banners/home_banner.webp')`,
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
          {slides.map((slide, idx) => (
            <Box
              key={slide.id || idx}
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
                pb: { xs: 14, sm: 18, md: 10, lg: 20 },
              }}
            >
              {/* Background Image */}
              <img
                src={getOptimizedImageUrl(slide.image_url, 1280)}
                alt={slide.title || "Miniatura destacada"}
                width="1280"
                height="720"
                loading={idx === 0 ? "eager" : "lazy"}
                style={{
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
                  opacity: 1,
                  animation: `${logoFade} 4s ease-in-out infinite`,
                  display: { xs: "none", md: "block" },
                }}
              >
                <Box
                  component="img"
                  src={`https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/guide/YunqueSolo.svg`}
                  alt="SoulForge Logo"
                  sx={{
                    width: 250,
                    height: 250,
                    opacity: 1,
                    filter:
                      "brightness(100%) saturate(100%) invert(88%) sepia(0%) saturate(1217%) hue-rotate(359deg) brightness(88%) contrast(92%)",
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
                  component="p"
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
                  component={idx === 0 ? "h1" : "h2"}
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
                    {slide.title_highlight}
                  </Typography>
                  {slide.title_suffix}
                </Typography>
                <Typography
                  variant="h5"
                  component="p"
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
              bottom: 56,
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
              name="Previous Slide"
              aria-label="Previous Slide"
              sx={{
                border: 1,
                borderColor: "rgba(197, 160, 89, 0.3)",
                bgcolor: "rgba(0,0,0,0.4)",
                color: "secondary.main",
                width: 32,
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
              name="Next Slide"
              aria-label="Next Slide"
              sx={{
                border: 1,
                borderColor: "rgba(197, 160, 89, 0.3)",
                bgcolor: "rgba(0,0,0,0.4)",
                color: "secondary.main",
                width: 32,
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
            {slides.map((_, idx) => (
              <IconButton
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Ir a la diapositiva ${idx + 1}`}
                sx={{
                  height: 8,
                  width: idx === currentSlide ? 32 : 8,
                  p: 0,
                  borderRadius: 4,
                  transition: "all 0.5s",
                  bgcolor:
                    idx === currentSlide
                      ? "secondary.main"
                      : "rgba(255,255,255,0.3)",
                  boxShadow: idx === currentSlide ? "0 0 10px #c5a059" : "none",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.6)" },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Scroll Indicator */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 2,
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

      {/* Admin Management Dialog */}
      <Dialog
        open={isManageOpen}
        onClose={() => !uploading && setIsManageOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#1a1a1a",
            color: "#eee",
            border: "1px solid #c5a059",
          },
        }}
      >
        <DialogTitle sx={{ color: "#c5a059", fontFamily: "Cinzel" }}>
          Gestionar Carousel de Inicio
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "rgba(197, 160, 89, 0.2)" }}>
          <Stack spacing={4} sx={{ mt: 1 }}>
            {editingSlides.map((slide, index) => (
              <Box
                key={slide.id}
                sx={{
                  p: 2,
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 1,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleMoveSlide(index, "up")}
                    disabled={index === 0}
                    sx={{ color: "#c5a059" }}
                  >
                    <ArrowUpward />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveSlide(index, "down")}
                    disabled={index === editingSlides.length - 1}
                    sx={{ color: "#c5a059" }}
                  >
                    <ArrowDownward />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveSlide(slide.id)}
                    sx={{ color: "#f44336" }}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: "100%", md: "30%" },
                      pt: { xs: "56.25%", md: "15%" },
                      bgcolor: "#000",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src={slide.image_url}
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <label htmlFor={`upload-${slide.id}`}>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id={`upload-${slide.id}`}
                        type="file"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleImageUpload(index, e.target.files[0])
                        }
                      />
                      <IconButton
                        component="span"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          bgcolor: "rgba(0,0,0,0.5)",
                          color: "#fff",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                        }}
                      >
                        <CloudUpload />
                      </IconButton>
                    </label>
                  </Box>
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <TextField
                      label="Subtítulo"
                      size="small"
                      fullWidth
                      value={slide.subtitle}
                      onChange={(e) => {
                        const newS = [...editingSlides];
                        newS[index].subtitle = e.target.value;
                        setEditingSlides(newS);
                      }}
                      variant="outlined"
                      sx={{
                        input: { color: "#eee" },
                        label: { color: "#c5a059" },
                      }}
                    />
                    <Stack direction="row" spacing={1}>
                      <TextField
                        label="Título"
                        size="small"
                        value={slide.title}
                        onChange={(e) => {
                          const newS = [...editingSlides];
                          newS[index].title = e.target.value;
                          setEditingSlides(newS);
                        }}
                        sx={{
                          flex: 2,
                          input: { color: "#eee" },
                          label: { color: "#c5a059" },
                        }}
                      />
                      <TextField
                        label="Resaltar"
                        size="small"
                        value={slide.title_highlight}
                        onChange={(e) => {
                          const newS = [...editingSlides];
                          newS[index].title_highlight = e.target.value;
                          setEditingSlides(newS);
                        }}
                        sx={{
                          flex: 1,
                          input: { color: "#eee" },
                          label: { color: "#c5a059" },
                        }}
                      />
                      <TextField
                        label="Sufijo"
                        size="small"
                        value={slide.title_suffix}
                        onChange={(e) => {
                          const newS = [...editingSlides];
                          newS[index].title_suffix = e.target.value;
                          setEditingSlides(newS);
                        }}
                        sx={{
                          flex: 1,
                          input: { color: "#eee" },
                          label: { color: "#c5a059" },
                        }}
                      />
                    </Stack>
                    <TextField
                      label="Descripción"
                      size="small"
                      multiline
                      rows={2}
                      value={slide.description}
                      onChange={(e) => {
                        const newS = [...editingSlides];
                        newS[index].description = e.target.value;
                        setEditingSlides(newS);
                      }}
                      sx={{
                        input: { color: "#eee" },
                        label: { color: "#c5a059" },
                        mb: 1,
                      }}
                    />
                    <TextField
                      label="Texto Botón (CTA)"
                      size="small"
                      value={slide.cta}
                      onChange={(e) => {
                        const newS = [...editingSlides];
                        newS[index].cta = e.target.value;
                        setEditingSlides(newS);
                      }}
                      sx={{
                        input: { color: "#eee" },
                        label: { color: "#c5a059" },
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddSlide}
              sx={{ color: "#c5a059", borderColor: "#c5a059" }}
            >
              Añadir Diapositiva
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderColor: "rgba(197, 160, 89, 0.2)" }}>
          <Button onClick={() => setIsManageOpen(false)} sx={{ color: "#999" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="secondary"
            disabled={uploading}
            startIcon={uploading ? null : <Save />}
          >
            {uploading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HeroSection;
