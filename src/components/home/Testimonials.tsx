import { useState, useEffect } from "react";
import { Box, Container, Typography, Paper, keyframes } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import ScrollReveal from "./ScrollReveal";

const scrollReviews = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const DEFAULT_REVIEWS = [
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
];

const Testimonials: React.FC = () => {
    const [displayedReviews, setDisplayedReviews] = useState(DEFAULT_REVIEWS);

    useEffect(() => {
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from("product_reviews")
                .select("user_name, comment, rating, products(name)")
                .order("created_at", { ascending: false })
                .limit(10);

            if (!error && data && data.length > 0) {
                const realReviews = data.map((item: any) => ({
                    user: item.user_name || "Aventurero Anónimo",
                    text: item.comment,
                    rating: item.rating,
                    variant: item.products?.name || "Aventurero",
                }));
                // Duplicate reviews if fewer than 5 to ensure scrolling looks good
                if (realReviews.length < 5) {
                    setDisplayedReviews([...realReviews, ...DEFAULT_REVIEWS.slice(0, 5 - realReviews.length)]);
                } else {
                    setDisplayedReviews(realReviews);
                }
            }
        };

        fetchReviews();
    }, []);

    return (
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
                                {displayedReviews.map((review, idx) => (
                                    <Paper
                                        key={`${i}-${idx}`}
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
    );
};

export default Testimonials;
