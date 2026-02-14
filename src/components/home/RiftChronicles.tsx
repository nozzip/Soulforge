import React from "react";
import { Box, Container, Typography, Grid, keyframes } from "@mui/material";
import { AutoAwesome, KeyboardArrowDown } from "@mui/icons-material";
import { ViewState, Product } from "../../../types";
import ScrollReveal from "./ScrollReveal";

interface RiftChroniclesProps {
    products: Product[];
    onFilterNavigate: (filters: {
        categories?: string[];
        creatureTypes?: string[];
    }) => void;
}

const sparkleAnim = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
`;

const RiftChronicles: React.FC<RiftChroniclesProps> = ({
    products,
    onFilterNavigate,
}) => {
    // Logic from Home.tsx
    const getHeroProduct = (category: string) => {
        return products.find((p) => p.category === category);
    };

    const animeHero = getHeroProduct("Anime");
    const juegosHero = getHeroProduct("Juegos");
    const cineHero = getHeroProduct("Cine");

    // Removed 'any' cast by defining the structure properly if needed,
    // but for now inferred type is fine or we can extend the object
    const chronicleCollections = [
        {
            title: "Artesanos del Ki",
            sub: "Guerreros del sol naciente, portadores de almas forjadas en tinta y celuloide.",
            tag: "Reinos Orientales",
            original: "Anime",
            img:
                animeHero?.image ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
            filters: { categories: ["Anime"] },
        },
        {
            title: "El Cónclave de los Mandos",
            sub: "De las mazmorras digitales a la palma de tu mano. Héroes que han superado el Game Over.",
            tag: "Senda de Bits",
            original: "Juegos",
            img:
                juegosHero?.image ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
            filters: { categories: ["Juegos"] },
        },
        {
            title: "Titanes del Séptimo Reino",
            sub: "Grandes leyendas que han cruzado el umbral de la pantalla para reclamar su lugar en tu mesa.",
            tag: "Proyección Épica",
            original: "Series y Cine",
            img:
                cineHero?.image ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
            filters: { categories: ["Cine"] },
        },
    ];

    return (
        <>
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
                            '[data-section="rift-chronicles"]'
                        );
                        if (nextSection) {
                            nextSection.scrollIntoView({ behavior: "smooth" });
                        }
                    }}
                />
            </Box>

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
                            <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                                <ScrollReveal delay={idx * 150}>
                                    <Box
                                        onClick={() => onFilterNavigate(item.filters)}
                                        sx={{
                                            position: "relative",
                                            height: 500,
                                            borderRadius: "200px 200px 0 0",
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
                                                    minHeight: "3rem",
                                                    justifyContent: "center",
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
                                                    ({item.original})
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
                                                        md: item.title.length > 20 ? "1.85rem" : "2.125rem",
                                                    },
                                                    minHeight: { xs: "3.5rem", md: "5.5rem" },
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
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
                                                    minHeight: "3rem",
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
        </>
    );
};

export default RiftChronicles;
