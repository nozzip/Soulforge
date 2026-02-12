/// <reference lib="dom" />
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
  Divider,
} from "@mui/material";

import {
  AutoStories,
  Backpack,
  AccessibilityNew,
  Map,
  Groups,
  Casino,
  ArrowForward,
} from "@mui/icons-material";
import { ThemedLogo } from "../components/ThemedLogo";

interface NewAdventurerGuideProps {
  setView: (view: ViewState) => void;
}

interface GuideStep {
  title: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  tip?: string;
}

const NewAdventurerGuide: React.FC<NewAdventurerGuideProps> = ({ setView }) => {
  const theme = useTheme();

  const steps: GuideStep[] = [
    {
      title: "La Llamada a la Aventura",
      description: "¿Qué es Dungeons & Dragons?",
      longDescription:
        "Imagina una historia donde tú eres el protagonista. No hay guion, solo posibilidades infinitas. D&D es un juego de rol de mesa donde tú y tus amigos crean una leyenda compartida. Un jugador, el Dungeon Master (DM), es el narrador y árbitro del mundo, mientras que tú controlas a un héroe único. Juntos explorarán mazmorras, lucharán contra bestias y forjarán su destino.",
      icon: <AutoStories sx={{ fontSize: 32 }} />,
      tip: "No necesitas ser actor ni experto en reglas para empezar. Solo necesitas imaginación.",
    },
    {
      title: "El Equipo Inicial",
      description: "Las herramientas del oficio.",
      longDescription:
        "Para comenzar tu viaje, necesitarás lo básico: un set de dados poliédricos (el d20 será tu mejor amigo y tu peor enemigo), una hoja de personaje para anotar tus habilidades, y un lápiz. Los manuales son útiles, pero un buen DM te guiará. No necesitas gastar una fortuna para dar tus primeros pasos.",
      icon: <Backpack sx={{ fontSize: 32 }} />,
      tip: "Existen muchas aplicaciones gratuitas para lanzar dados si aún no tienes los tuyos.",
    },
    {
      title: "Tu Avatar en la Mesa",
      description: "¿Por qué necesito una miniatura?",
      longDescription:
        'Cuando la batalla comienza y el caos se desata, saber dónde estás parado puede salvarte la vida. Una miniatura no es solo una pieza de plástico; es la representación física de tu héroe. Ver a tu paladín enfrentarse cara a cara con un dragón en el tablero convierte un "ataque" en una memoria épica. Es tu ancla en el mundo físico para las hazañas de tu imaginación.',
      icon: <AccessibilityNew sx={{ fontSize: 32 }} />,
      tip: 'Muchos jugadores comienzan con una miniatura que se "parezca" a su personaje y luego encargan una personalizada a medida que suben de nivel.',
    },
    {
      title: "El Tablero y el Mapa",
      description: "El mundo toma forma.",
      longDescription:
        "El combate en D&D suele jugarse en una cuadrícula de 1 pulgada, donde cada cuadro representa 5 pies (1.5 metros). Aquí es donde la táctica brilla: flanquear enemigos, cubrirse tras una roca, o lanzar una bola de fuego sin quemar a tus aliados. Las miniaturas y el terreno dan vida a estas situaciones, permitiendo que todos visualicen la misma escena.",
      icon: <Map sx={{ fontSize: 32 }} />,
      tip: "No necesitas escenografía profesional al principio; un mapa dibujado en papel cuadriculado es suficiente para una gran aventura.",
    },
    {
      title: "El Azar de los Dados",
      description: "Cuando el destino decide.",
      longDescription:
        "¿Lograrás saltar el abismo? ¿Tu espada atravesará la armadura del orco? Para averiguarlo, lanzas los dados. El resultado, sumado a tus habilidades, determina el éxito o el fracaso. A veces un 1 (Fallo Crítico) crea una historia más divertida que un 20 (Éxito Crítico). Abraza el caos.",
      icon: <Casino sx={{ fontSize: 32 }} />,
    },
    {
      title: "Únete a la Comunidad",
      description: "Nunca viajarás solo.",
      longDescription:
        "La comunidad de rol es inmensa y acogedora. Desde tiendas locales hasta grupos en línea, siempre hay una mesa buscando aventureros. No temas ser nuevo; todos fuimos nivel 1 alguna vez. Pregunta, aprende y, sobre todo, diviértete. Tu leyenda apenas comienza.",
      icon: <Groups sx={{ fontSize: 32 }} />,
      tip: 'Pregunta en Soulforge o en tu tienda local por noches de "Aventureros de la Liga" para principiantes.',
    },
  ];

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
          {steps.map((step, index) => (
            <Grid key={index} size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  height: "100%",
                  p: 3,
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: alpha(theme.palette.background.paper, 0.02),
                    zIndex: -1,
                  },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Cinzel", serif',
                    color: "secondary.main",
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    mb: 1,
                    borderBottom: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                    pb: 0.5,
                    display: "inline-block",
                    width: "100%",
                  }}
                >
                  {step.title}
                </Typography>

                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: '"Newsreader", serif',
                    color: "text.primary",
                    fontStyle: "italic",
                    mb: 2,
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  {step.description}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: '"Newsreader", serif',
                    fontSize: "1.05rem",
                    color: "text.secondary",
                    lineHeight: 1.6,
                    textAlign: "justify",
                    mb: 2,
                  }}
                >
                  {step.longDescription}
                </Typography>

                {step.tip && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                      mt: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Newsreader", serif',
                        fontSize: "0.9rem",
                        color: "text.primary",
                        fontWeight: 500,
                      }}
                    >
                      <strong>Sabiduría del DM:</strong> {step.tip}
                    </Typography>
                  </Box>
                )}
              </Box>
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
