import React from "react";
import { Box, Container, Typography, Paper, Grid } from "@mui/material";
import { AutoFixHigh, Api } from "@mui/icons-material";
import ScrollReveal from "./ScrollReveal";

const Promotions: React.FC = () => {
    return (
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
    );
};

export default Promotions;
