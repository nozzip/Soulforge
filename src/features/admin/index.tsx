import React, { useState, Suspense } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  alpha,
  useTheme,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  AutoStories,
  Inventory,
  ReceiptLong,
  RateReview,
} from "@mui/icons-material";
import { SectionHeader } from "@/components/StyledComponents";
import { ViewState, Product } from "@/types";
import { AdminProducts } from "./components/AdminProducts";
import { AdminOrders } from "./components/AdminOrders";
import { AdminReviews } from "./components/AdminReviews";

interface AdminProps {
  setView: (view: ViewState) => void;
  categories: string[];
  sizes: string[];
  onAddCategory: (cat: string) => void;
  onAddSize: (size: string) => void;
  onDeleteCategory: (cat: string) => void;
  onDeleteSize: (size: string) => void;
  isAdmin: boolean;
}

const Admin: React.FC<AdminProps> = ({
  setView,
  categories,
  sizes,
  onAddCategory,
  onAddSize,
  onDeleteCategory,
  onDeleteSize,
  isAdmin,
}) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);

  if (!isAdmin) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, textAlign: "center" }}>
        <Paper sx={{ p: 4 }}>
          <AutoStories sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <SectionHeader
            title="Acceso Restringido"
            description="Esta sección está reservada para los Altos Supervisores."
            icon={<AutoStories />}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setView(ViewState.CATALOG)}
            sx={{ mt: 2 }}
          >
            Volver al Catálogo
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <SectionHeader
        title="El Libro del Alto Supervisor"
        description="Forja nuevas leyendas en los archivos"
        icon={<AutoStories />}
        rightElement={
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setView(ViewState.CATALOG)}
            startIcon={<AutoStories />}
            sx={{
              borderColor: (t) => alpha(t.palette.secondary.main, 0.3),
              color: "secondary.main",
              "&:hover": {
                borderColor: "secondary.main",
                bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
              },
            }}
          >
            Ver Catálogo
          </Button>
        }
      />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 3, lg: 2 }}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: (t) => alpha(t.palette.background.paper, 0.5),
              border: 1,
              borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
              borderRadius: 2,
              overflow: "hidden",
              position: "sticky",
              top: 100,
            }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={currentTab}
              onChange={(_e, v) => setCurrentTab(v)}
              sx={{
                "& .MuiTab-root": {
                  alignItems: "flex-start",
                  textAlign: "left",
                  py: 3,
                  px: 3,
                  borderLeft: 3,
                  borderColor: "transparent",
                  justifyContent: "flex-start",
                  transition: "all 0.2s",
                  "&.Mui-selected": {
                    bgcolor: (t) => alpha(t.palette.secondary.main, 0.1),
                    borderLeftColor: "secondary.main",
                    color: "secondary.main",
                  },
                  "&:hover": {
                    bgcolor: (t) => alpha(t.palette.common.white, 0.05),
                  },
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              <Tab
                icon={<Inventory sx={{ mb: 0, mr: 2 }} />}
                iconPosition="start"
                label="Forjar Artefactos"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              />
              <Tab
                icon={<ReceiptLong sx={{ mb: 0, mr: 2 }} />}
                iconPosition="start"
                label="Gestión de Requisiciones"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              />
              <Tab
                icon={<RateReview sx={{ mb: 0, mr: 2 }} />}
                iconPosition="start"
                label="Crónicas de Aventureros"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              />
            </Tabs>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 9, lg: 10 }}>
          {currentTab === 0 && (
            <Suspense fallback={<Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}>
              <AdminProducts
                categories={categories}
                sizes={sizes}
                onAddCategory={onAddCategory}
                onAddSize={onAddSize}
                onDeleteCategory={onDeleteCategory}
                onDeleteSize={onDeleteSize}
              />
            </Suspense>
          )}

          {currentTab === 1 && <AdminOrders />}

          {currentTab === 2 && <AdminReviews />}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Admin;
