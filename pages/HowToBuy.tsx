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

import { HistoryEdu } from "@mui/icons-material";
import { ThemedLogo } from "../components/ThemedLogo";
import { howToBuySteps } from "../src/data/guideData";
import { GuideTimelineItem } from "../src/components/guides/GuideTimelineItem";

interface HowToBuyProps {
  setView: (view: ViewState) => void;
}

const HowToBuy: React.FC<HowToBuyProps> = ({ setView }) => {
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
          height: { xs: 350, md: 900 },
          position: "relative",
          backgroundImage:
            "url(https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/guide/dragon_banner.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // WATERCOLOR MASK EFFECT
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
              fontSize: { xs: "2.5rem", md: "5rem" },
              color: "common.white",
              fontWeight: 700,
              letterSpacing: 10,
              textTransform: "uppercase",
              textShadow:
                "0 0 30px rgba(0,0,0,0.8), 0 0 10px rgba(197, 160, 89, 0.3)",
              mb: 1,
              paddingTop: { xs: 15, md: 12 },
            }}
          >
            Guía de Compras
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Cinzel", serif',
              color: "secondary.main",
              letterSpacing: 4,
              opacity: 0.9,
              fontSize: { xs: "0.8rem", md: "1.2rem" },
            }}
          >
            Compendio Oficial del Aventurero
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 5, position: "relative" }}>
        {/* Introducción */}
        <Box sx={{ textAlign: "center", mb: 10, maxWidth: 800, mx: "auto" }}>
          <HistoryEdu sx={{ color: "secondary.main", fontSize: 40, mb: 2 }} />
          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Newsreader", serif',
              fontSize: "1.4rem",
              color: "text.secondary",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            "Desde las sombras de la forja hasta tu mesa de juego, cada
            miniatura sigue un camino sagrado. Esta guía contiene el
            conocimiento necesario para completar tu misión y armar tu propio
            ejército de leyendas."
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
                height: 1,
                width: 60,
                bgcolor: alpha(theme.palette.secondary.main, 0.4),
                mr: 2,
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                bgcolor: "secondary.main",
                transform: "rotate(45deg)",
              }}
            />
            <Box
              sx={{
                height: 1,
                width: 60,
                bgcolor: alpha(theme.palette.secondary.main, 0.4),
                ml: 2,
              }}
            />
          </Box>
        </Box>

        {/* Mapeo en dos columnas estilo Manual de D&D */}
        <Grid container spacing={8} alignItems="flex-start">
          {/* Columna 1: Pasos 1-5 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={8}>
              {howToBuySteps.slice(0, 5).map((step, index) => (
                <GuideTimelineItem
                  key={index}
                  step={step}
                  index={index}
                />
              ))}
            </Stack>
          </Grid>

          {/* Columna 2: Pasos 6-9 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={8}>
              {howToBuySteps.slice(5).map((step, index) => (
                <GuideTimelineItem
                  key={index + 5}
                  step={step}
                  index={index + 5}
                />
              ))}
            </Stack>

            {/* Botones de Acción (Call to Action) */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 10, mb: { xs: 8, md: 0 } }}
            >
              <Button
                variant="contained"
                onClick={() => setView(ViewState.CATALOG)}
                sx={{
                  bgcolor: "secondary.main",
                  color: "background.default",
                  fontFamily: '"Cinzel", serif',
                  px: 4,
                  py: 1.2,
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  flexGrow: 1,
                  "&:hover": {
                    bgcolor: "secondary.light",
                    transform: "translateY(-3px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Comenzar Aventura
              </Button>
              <Button
                variant="outlined"
                onClick={() => setView(ViewState.HOME)}
                sx={{
                  color: "secondary.main",
                  borderColor: "secondary.main",
                  fontFamily: '"Cinzel", serif',
                  px: 1,
                  py: 1.2,
                  fontSize: "0.9rem",
                  flexGrow: 1,
                  "&:hover": {
                    borderColor: "common.white",
                    color: "common.white",
                    bgcolor: alpha("#fff", 0.05),
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Volver al Atrio
              </Button>
            </Stack>
            {/* Footer Final Refinado (Sin línea divisoria) */}
            <Box
              sx={{
                mt: { xs: 10, md: 15 },
                textAlign: "center",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "inline-block",
                  mb: 2,
                  mt: -4,
                  opacity: 0.7,
                }}
              >
                <ThemedLogo width={240} />
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Newsreader", serif',
                  fontStyle: "italic",
                  color: "text.secondary",
                  maxWidth: 550,
                  mx: "auto",
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                  opacity: 0.8,
                }}
              >
                Donde cada alma encuentra su forma en resina pura.
                <br />
                Autenticado por el Gremio de Forjadores.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HowToBuy;
