/// <reference lib="dom" />
import React from "react";
import { ViewState, Product, Profile } from "../types";
import {
  Box,
  Typography,
  Container,
  List,
  ListItem,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import { Instagram, WhatsApp } from "@mui/icons-material";
import WhatsAppButton from "./WhatsAppButton";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
  setView: (view: ViewState) => void;
  currentView: ViewState;
  onSearch: (query: string) => void;
  onProductSelect: (id: string) => void;
  user?: string | null;
  userProfile?: Profile | null;
  isAdmin?: boolean;
  onLogout?: () => void;
  isWarhammer: boolean;
  onToggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  setView,
  currentView,
  onSearch,
  onProductSelect,
  user,
  userProfile,
  isAdmin,
  onLogout,
  isWarhammer,
  onToggleTheme,
}) => {
  const isCheckout = currentView === ViewState.CHECKOUT;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        color: "text.primary",
      }}
    >
      <Navbar
        setView={setView}
        currentView={currentView}
        onSearch={onSearch}
        onProductSelect={onProductSelect}
        user={user}
        userProfile={userProfile}
        isAdmin={isAdmin}
        onLogout={onLogout}
        isWarhammer={isWarhammer}
        onToggleTheme={onToggleTheme}
      />

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* Footer */}
      {!isCheckout && (
        <Box
          component="footer"
          sx={{
            bgcolor: "background.default",
            borderTop: 1,
            borderColor: "secondary.main",
            py: 8,
            px: 2,
            mt: "auto",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: (theme) =>
                `linear-gradient(90deg, transparent, ${theme.palette.secondary.main}, transparent)`,
            },
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "2fr 1fr 1fr 1fr",
                },
                gap: 6,
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  color="secondary.main"
                  gutterBottom
                  sx={{
                    fontFamily: "Cinzel, serif",
                    fontWeight: 700,
                    letterSpacing: 4,
                  }}
                >
                  SOULFORGE
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    maxWidth: 300,
                    lineHeight: 1.8,
                    fontStyle: "italic",
                    mb: 4,
                  }}
                >
                  Donde las leyendas se forjan en resina de alta fidelidad.
                  Artefactos diseñados para elevar tus partidas de rol y
                  colecciones.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    component="a"
                    href="https://www.instagram.com/soulforge.miniatures"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "secondary.main",
                      border: 1,
                      borderColor: "rgba(197, 160, 89, 0.3)",
                      "&:hover": {
                        color: "common.white",
                        bgcolor: "secondary.main",
                        borderColor: "secondary.main",
                      },
                    }}
                  >
                    <Instagram />
                  </IconButton>
                  <IconButton
                    component="a"
                    href={`https://wa.me/543815621699?text=${encodeURIComponent("Saludos desde el portal de Soulforge. Necesito asistencia del Gremio...")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "secondary.main",
                      border: 1,
                      borderColor: "rgba(197, 160, 89, 0.3)",
                      "&:hover": {
                        color: "common.white",
                        bgcolor: "secondary.main",
                        borderColor: "secondary.main",
                      },
                    }}
                  >
                    <WhatsApp />
                  </IconButton>
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="common.white"
                  gutterBottom
                  sx={{ letterSpacing: 2, fontWeight: "bold", mb: 2 }}
                >
                  EL REINO
                </Typography>
                <List dense disablePadding>
                  {[
                    { text: "Catálogo de Héroes", view: ViewState.CATALOG },
                    {
                      text: "La Taberna (Mesa de Rol)",
                      view: ViewState.FORUM_HOME,
                    },
                    { text: "Bestiario LFG", view: ViewState.FORUM_LFG },
                  ].map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ py: 0.75 }}>
                      <Typography
                        variant="body2"
                        onClick={() => setView(item.view)}
                        sx={{
                          color: "text.secondary",
                          cursor: "pointer",
                          transition: "color 0.2s",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {item.text}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="common.white"
                  gutterBottom
                  sx={{ letterSpacing: 2, fontWeight: "bold", mb: 2 }}
                >
                  SABIDURÍA
                </Typography>
                <List dense disablePadding>
                  {[
                    { text: "Guía de Compra", view: ViewState.HOW_TO_BUY },
                    {
                      text: "Iniciación al Rol",
                      view: ViewState.NEW_ADVENTURER,
                    },
                    { text: "Soporte del Gremio", view: ViewState.FEEDBACK },
                  ].map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ py: 0.75 }}>
                      <Typography
                        variant="body2"
                        onClick={() => setView(item.view)}
                        sx={{
                          color: "text.secondary",
                          cursor: "pointer",
                          transition: "color 0.2s",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {item.text}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="common.white"
                  gutterBottom
                  sx={{ letterSpacing: 2, fontWeight: "bold", mb: 2 }}
                >
                  CUENTA
                </Typography>
                <List dense disablePadding>
                  {[
                    { text: "Mi Perfil", view: ViewState.PROFILE },
                    { text: "Lista de Deseos", view: ViewState.WISHLIST },
                    { text: "Historial de Pedidos", view: ViewState.ORDERS },
                  ].map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ py: 0.75 }}>
                      <Typography
                        variant="body2"
                        onClick={() => setView(item.view)}
                        sx={{
                          color: "text.secondary",
                          cursor: "pointer",
                          transition: "color 0.2s",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {item.text}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>

            <Typography
              variant="caption"
              display="block"
              align="center"
              sx={{
                mt: 10,
                pt: 4,
                borderTop: 1,
                borderColor: "rgba(197, 160, 89, 0.1)",
                color: "text.secondary",
                letterSpacing: 2,
                opacity: 0.6,
              }}
            >
              © {new Date().getFullYear()} Soulforge Miniatures. Forjado con
              pasión por aventureros.
              <br />
              No es un producto oficial de Wizards of the Coast.
            </Typography>
          </Container>
        </Box>
      )}

      {/* WhatsApp Floating Button */}
      <WhatsAppButton
        phoneNumber="543815621699"
        message="Saludos desde el portal de Soulforge. Necesito asistencia del Gremio..."
      />
    </Box>
  );
};

export default Layout;
