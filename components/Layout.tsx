/// <reference lib="dom" />
import React from "react";
import { ViewState, Product } from "../types";
import {
  Box,
  Typography,
  Container,
  List,
  ListItem,
  Button,
  InputBase,
} from "@mui/material";
import {
  RssFeed as RssFeedIcon,
  Share as ShareIcon,
  Forum as ForumIcon,
} from "@mui/icons-material";
import WhatsAppButton from "./WhatsAppButton";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
  setView: (view: ViewState) => void;
  currentView: ViewState;
  onSearch: (query: string) => void;
  onProductSelect: (id: string) => void;
  user?: string | null;
  isAdmin?: boolean;
  onLogout?: () => void;
  products: Product[];
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
  isAdmin,
  onLogout,
  products,
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
        isAdmin={isAdmin}
        onLogout={onLogout}
        products={products}
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
            py: 6,
            px: 2,
            mt: "auto",
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" },
                gap: 4,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  color="secondary.main"
                  gutterBottom
                  sx={{ fontFamily: "Cinzel, serif" }}
                >
                  SOULFORGE
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The premiere destination for high-fidelity 3D resin prints.
                  Designed by gamers, for gamers.
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  color="common.white"
                  gutterBottom
                  sx={{ letterSpacing: 2 }}
                >
                  ARCHIVOS
                </Typography>
                <List dense disablePadding>
                  {[
                    "Catálogos",
                    "Ediciones Limitadas",
                    "Caja de Suscripción",
                    "Guías de Pintura",
                  ].map((text) => (
                    <ListItem key={text} disablePadding sx={{ py: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          "&:hover": {
                            color: "primary.main",
                            cursor: "pointer",
                          },
                        }}
                      >
                        {text}
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
                  sx={{ letterSpacing: 2 }}
                >
                  LORE Y LEYES
                </Typography>
                <List dense disablePadding>
                  {[
                    "Rituales de Envío",
                    "El Juramento del Alquimista",
                    "Pergaminos del Mercader",
                    "Sigilo de Privacidad",
                  ].map((text) => (
                    <ListItem key={text} disablePadding sx={{ py: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          "&:hover": {
                            color: "primary.main",
                            cursor: "pointer",
                          },
                        }}
                      >
                        {text}
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
                  sx={{ letterSpacing: 2 }}
                >
                  DESPACHO
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 1, fontStyle: "italic" }}
                >
                  Suscríbete para alertas de nuevos lanzamientos.
                </Typography>
                <Box sx={{ display: "flex" }}>
                  <InputBase
                    placeholder="Email"
                    sx={{
                      bgcolor: "background.paper",
                      px: 2,
                      py: 0.5,
                      borderRadius: "4px 0 0 4px",
                      border: 1,
                      borderColor: "secondary.main",
                      color: "common.white",
                      width: "100%",
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{ borderRadius: "0 4px 4px 0" }}
                  >
                    Unirse
                  </Button>
                </Box>
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <RssFeedIcon
                    sx={{
                      color: "secondary.main",
                      "&:hover": { color: "white" },
                      cursor: "pointer",
                    }}
                  />
                  <ShareIcon
                    sx={{
                      color: "secondary.main",
                      "&:hover": { color: "white" },
                      cursor: "pointer",
                    }}
                  />
                  <ForumIcon
                    sx={{
                      color: "secondary.main",
                      "&:hover": { color: "white" },
                      cursor: "pointer",
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Typography
              variant="caption"
              display="block"
              align="center"
              sx={{
                mt: 8,
                pt: 4,
                borderTop: 1,
                borderColor: "rgba(197, 160, 89, 0.1)",
                color: "text.secondary",
                letterSpacing: 2,
              }}
            >
              © {new Date().getFullYear()} Soulforge Miniatures. Todos los
              derechos reservados. No es un producto de Wizards of the Coast.
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
