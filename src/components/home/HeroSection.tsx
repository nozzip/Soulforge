import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Container,
    IconButton,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import {
    ChevronLeft,
    ChevronRight,
    KeyboardArrowDown,
} from "@mui/icons-material";
import { ViewState } from "../../../types";

interface HeroSectionProps {
    setView: (view: ViewState) => void;
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

const HeroSection: React.FC<HeroSectionProps> = ({ setView }) => {
    const [heroLoaded, setHeroLoaded] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        setHeroLoaded(true);
    }, []);

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
            (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
        );
    };

    return (
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
                                pb: { xs: 14, sm: 18, md: 10, lg: 20 },
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
                                loading={idx === 0 ? "eager" : "lazy"} // Optimized loading
                                fetchpriority={idx === 0 ? "high" : "auto"} // Prioritize first image
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
                                <Box
                                    component="img"
                                    src={`https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/guide/YunqueSolo.svg`}
                                    alt="SoulForge Logo"
                                    sx={{
                                        width: 200,
                                        height: 200,
                                        opacity: 0.4,
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
                                    component="h2" // Semantic HTML improvement
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
                                    component="h1" // Semantic HTML improvement
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
                                    component="p" // Semantic HTML improvement
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
        </Box>
    );
};

export default HeroSection;
