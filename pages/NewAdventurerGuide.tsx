import React from "react";
import { ViewState } from "../types";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  alpha,
  useTheme,
  Grid,
} from "@mui/material";

import { ArrowForward } from "@mui/icons-material";
import { ThemedLogo } from "../components/ThemedLogo";
import { newAdventurerSteps } from "../src/data/guideData";
import { GuideCard } from "../src/components/guides/GuideCard";

interface NewAdventurerGuideProps {
  setView: (view: ViewState) => void;
}

const NewAdventurerGuide: React.FC<NewAdventurerGuideProps> = ({ setView }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        pb: 10,
        position: "relative",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    >
      {/* Banner Superior Heroico */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 350, md: 1000 },
          position: "relative",
          backgroundImage:
            "url(https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/banners/adventurer_guide_banner.jpg)", // PLACEHOLDER: Replace with user provided image
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // WATERCOLOR MASK EFFECT
          // To use your own mask:
          // 1. Upload a black/transparent PNG mask image to /public/images/masks/
          // 2. Update the url() below to point to your file.
          // Examples of mask images can be found by searching "watercolor brush mask png"
          maskImage:
            "url(https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/masks/my-mask.png), linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage:
            "url(https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/masks/my-mask.png), linear-gradient(to bottom, black 50%, transparent 100%)",
          maskSize: "100% 100%, 100% 100%",
          WebkitMaskSize: "100% 100%, 100% 100%",
          maskPosition: "center bottom, center",
          WebkitMaskPosition: "center bottom, center",
          maskRepeat: "no-repeat, no-repeat",
          WebkitMaskRepeat: "no-repeat, no-repeat",
          // Fallback if mask image fails to load or isn't present - ensures content is still visible
          // but fades out at the bottom
          maskComposite: "source-over",
          WebkitMaskComposite: "source-over",

          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "70%",
            background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`,
          },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            zIndex: 1,
            mt: { xs: 5, md: 10 },
            px: 2,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Cinzel", serif',
              fontSize: { xs: "2rem", md: "4.5rem" },
              color: "common.white",
              fontWeight: 700,
              letterSpacing: 8,
              textTransform: "uppercase",
              textShadow:
                "0 0 30px rgba(0,0,0,0.8), 0 0 10px rgba(197, 160, 89, 0.3)",
              mb: 2,
              paddingTop: { xs: 10, md: 12 },
            }}
          >
            Guía del Nuevo Aventurero
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Newsreader", serif',
              color: "secondary.main",
              letterSpacing: 2,
              opacity: 0.9,
              fontSize: { xs: "1rem", md: "1.4rem" },
              fontStyle: "italic",
              maxWidth: 800,
              mx: "auto",
            }}
          >
            "Acércate al fuego, viajero. Tienes aspecto de alguien que busca
            escribir su propia leyenda..."
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 5, position: "relative", pb: 10 }}>
        {/* Introducción Narrativa */}
        <Box sx={{ textAlign: "center", mb: 8, maxWidth: 800, mx: "auto" }}>
          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Newsreader", serif',
              fontSize: "1.25rem",
              color: "text.secondary",
              lineHeight: 1.8,
              textAlign: "justify",
              columnCount: { md: 2 },
              columnGap: 4,
              "&::first-letter": {
                float: "left",
                fontSize: "3.5rem",
                lineHeight: 0.8,
                fontWeight: "bold",
                fontFamily: '"Cinzel", serif',
                color: "secondary.main",
                mr: 1,
                mt: 1,
              },
            }}
          >
            Bienvenido a los Reinos Olvidados, o quizás a Eberron, o tal vez a
            un mundo que tú y tus amigos inventarán esta noche. Si estás aquí,
            es porque has sentido el llamado. No importa si nunca has tocado un
            dado de 20 caras o si crees que una "Tirada de Salvación" es guardar
            la partida. Aquí en <strong>Soulforge</strong>, creemos que cada
            gran héroe comienza con un solo paso... y usualmente, con una buena
            miniatura.
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 4,
            }}
          >
            <Box
              sx={{
                height: 2,
                width: 100,
                background: `linear-gradient(90deg, transparent, ${theme.palette.secondary.main}, transparent)`,
              }}
            />
          </Box>
        </Box>

        {/* Grid de Contenido Estilo Manual */}
        <Grid container spacing={4}>
          {newAdventurerSteps.map((step, index) => (
            <Grid key={index} size={{ xs: 12, md: 6 }}>
              <GuideCard step={step} />
            </Grid>
          ))}
        </Grid>

        {/* Call to Action Final */}
        <Box sx={{ textAlign: "center", mt: 15 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Cinzel", serif',
              color: "common.white",
              mb: 4,
              textShadow: "0 0 20px rgba(197, 160, 89, 0.4)",
            }}
          >
            ¿Listo para comenzar tu viaje?
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => setView(ViewState.CATALOG)}
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: "secondary.main",
                color: "background.default",
                fontFamily: '"Cinzel", serif',
                px: 6,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: "secondary.light",
                  transform: "scale(1.05)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Explorar Miniaturas
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setView(ViewState.HOW_TO_BUY)}
              sx={{
                color: "secondary.main",
                borderColor: "secondary.main",
                fontFamily: '"Cinzel", serif',
                px: 6,
                py: 2,
                fontSize: "1.1rem",
                "&:hover": {
                  borderColor: "common.white",
                  color: "common.white",
                  bgcolor: alpha(theme.palette.common.white, 0.05),
                },
              }}
            >
              Ver Guía de Compra
            </Button>
          </Stack>
        </Box>

        {/* Footer Logo */}
        <Box sx={{ mt: 15, textAlign: "center", opacity: 0.7 }}>
          <ThemedLogo width={200} />
        </Box>
      </Container>
    </Box>
  );
};

export default NewAdventurerGuide;
