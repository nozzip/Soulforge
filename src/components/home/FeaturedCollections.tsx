import React from "react";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { ViewState, Product } from "../../../types";
import { CornerFlourish, RuneDivider } from "../../../components/StyledComponents";
import ScrollReveal from "./ScrollReveal";

interface FeaturedCollectionsProps {
    products: Product[];
    setView: (view: ViewState) => void;
    onFilterNavigate: (filters: {
        categories?: string[];
        creatureTypes?: string[];
    }) => void;
}

const CollectionGradient =
    "linear-gradient(0deg, rgba(34, 16, 16, 0.95) 0%, rgba(34, 16, 16, 0.1) 50%)";

const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({
    products,
    setView,
    onFilterNavigate,
}) => {
    // Memoized logic moved to parent or kept here if specific strictly to this UI
    // But for performance, it's better to receive the data ready or compute efficiently
    // We'll compute it inside for now but efficiently

    const getHeroProduct = (
        category: string,
        filterFn?: (p: Product) => boolean
    ) => {
        // Optimization: find first match directly instead of filtering all then sorting
        // Assuming products are already sorted by date desc from parent or API
        return products.find(
            (p) => p.category === category && (!filterFn || filterFn(p))
        );
    };

    const fantasyHero = getHeroProduct(
        "D&D",
        (p) => p.creature_type?.toLowerCase().includes("humanoid") || false
    );
    const scifiHero = getHeroProduct("Warhammer");
    const monsterHero = getHeroProduct(
        "D&D",
        (p) => p.creature_type?.toLowerCase().includes("monstrosity") || false
    );

    const featuredCollections = [
        {
            title: "Héroes de Fantasía",
            sub: "Enanos, Elfos y los Defensores de la Luz.",
            img:
                fantasyHero?.image ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuB3o4U20eQujlqlLivp6dfCAP5GGzSX_QIVGCsZjAW44J4Cn5dH3fh--dQTkyhXBkrF8FhFqEkEYr9RQT-DUD067sGwueG54R6I2D9AWpl0SZeHcNNNBlpw-hJcGf44E_evb6KJAvH1iUIbN3XlyqFqu1eAkxpckNTqSho97MfodGIWlijVtftnohk4UDHDDFQLMabvPPyGlPuNecTztgQfAeFoes10LMhaiBmRzvnS1bSmrAv4HZDh04MXIr9oLJX0zf3HFw_Us5E",
            filters: { categories: ["D&D"] },
        },
        {
            title: "Guerreros Sci-Fi",
            sub: "Terrores mecánicos y viajeros estelares.",
            img:
                scifiHero?.image ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCOoJ1jIOn4jPLgzNAvKwwkCQE2_iPHMNTRmJnKwTVe1s16Y3IsWqDCLNtw58ig-nCjvDy9n0viSYpTjKSLiE0rVLs2R08qTyRGA9JmI5Jnt1qJYFJFLndBNbemc8FMbL7eNtue4wI5brNfS4WCKcSI55sF40XAguH8xExwk6LL0xnzivEaNUiUCKQgnyl5zuT-bylNbyOoz--wt1re7DbF7JMqODxHf2_ymsFXG8tWfQW1mFrD7L17j3w_G4V3nuEinQqugO-5iSo",
            filters: { categories: ["Warhammer"] },
        },
        {
            title: "Manual de Monstruos",
            sub: "Abominaciones, Bestias y los Grandes Dragones.",
            img:
                monsterHero?.image ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAk61FuYDjWAsNtu247-7UQnKD10MRF9FJclnImLSqjn4IV_svngmRGCH5VwHKU4F08LykO4cLSTZjd7PuG9JIqbAISQ8nYCiKO-jK3rG3FEzPVpdOES5vtmUXNCm8gvJ8Rgu_FRc_G4TCYlUMy4NcNsDAj_WUMdNcZZMwWi216xu4wMg54xqhfj3aiFvnT6MQGPfVSpQIT2qPrSJc-rcpRtaEmdk7-ZP_6pl9muFYAhogMHTm1eN1z3FgfVSDNejNMKnVe_KwTVGw",
            filters: { categories: ["D&D"], creatureTypes: ["Monstrosity"] },
        },
    ];

    return (
        <>
            <ScrollReveal>
                <RuneDivider variant="section" glowing />
            </ScrollReveal>

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
                            <Grid key={col.title} size={{ xs: 12, md: 4 }}>
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
        </>
    );
};

export default FeaturedCollections;
