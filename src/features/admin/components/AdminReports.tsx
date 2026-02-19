import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
  Chip,
  alpha,
  useTheme,
  MenuItem,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as DismissIcon,
  Gavel as SuspendIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import { DEFAULT_AVATAR_URL } from "@/constants";

export const AdminReports: React.FC = () => {
  const theme = useTheme();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [suspensionDays, setSuspensionDays] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forum_reports")
        .select(
          `
          *,
          reporter:profiles!reporter_id(username, avatar_url),
          target_thread:forum_threads(id, title, author_id, author:profiles(id, username, avatar_url)),
          target_post:forum_posts(id, content, author_id, author:profiles(id, username, avatar_url))
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("forum_reports")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    } catch (error) {
      console.error("Error updating report status:", error);
      alert("Error al actualizar estado.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      let suspendUntil = null;
      if (suspensionDays > 0) {
        suspendUntil = new Date();
        suspendUntil.setDate(suspendUntil.getDate() + suspensionDays);
      } else {
        // Permanent
        suspendUntil = new Date("9999-12-31");
      }

      const { error } = await supabase
        .from("profiles")
        .update({ forum_suspended_until: suspendUntil })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Also resolve the report
      if (selectedReport) {
        await handleUpdateStatus(selectedReport.id, "resolved");
      }

      setSuspendOpen(false);
      setSelectedUser(null);
      setSelectedReport(null);
      alert(`Usuario suspendido con éxito.`);
    } catch (error) {
      console.error("Error suspending user:", error);
      alert("Error al suspender usuario.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontFamily: "Cinzel, serif", mb: 3 }}
      >
        Reportes del Foro
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: 1, borderColor: "divider", bgcolor: "background.paper" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell>Fecha</TableCell>
              <TableCell>Reportado</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell>Razón</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => {
              const target = report.target_thread || report.target_post;
              const author = target?.author;
              const isThread = !!report.target_thread;

              return (
                <TableRow key={report.id} hover>
                  <TableCell>
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {isThread
                        ? "Hilo: " + target?.title
                        : "Post: " + target?.content?.substring(0, 30) + "..."}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      por {report.reporter?.username}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        src={author?.avatar_url || DEFAULT_AVATAR_URL}
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography variant="body2">
                        {author?.username || "Desconocido"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>
                    <StatusChip status={report.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Marcar como Resuelto">
                      <IconButton
                        size="small"
                        color="success"
                        disabled={report.status !== "pending" || actionLoading}
                        onClick={() =>
                          handleUpdateStatus(report.id, "resolved")
                        }
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Descartar Reporte">
                      <IconButton
                        size="small"
                        color="error"
                        disabled={report.status !== "pending" || actionLoading}
                        onClick={() =>
                          handleUpdateStatus(report.id, "dismissed")
                        }
                      >
                        <DismissIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Suspender Usuario">
                      <IconButton
                        size="small"
                        sx={{ color: "warning.main" }}
                        disabled={!author || actionLoading}
                        onClick={() => {
                          setSelectedUser(author);
                          setSelectedReport(report);
                          setSuspendOpen(true);
                        }}
                      >
                        <SuspendIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  No hay reportes pendientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Suspension Dialog */}
      <Dialog open={suspendOpen} onClose={() => setSuspendOpen(false)}>
        <DialogTitle sx={{ fontFamily: "Cinzel, serif" }}>
          Suspender Aventurero: {selectedUser?.username}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 350 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            El aventurero no podrá publicar en el foro durante el tiempo
            seleccionado.
          </Typography>
          <TextField
            select
            fullWidth
            label="Duración de la Suspensión"
            value={suspensionDays}
            onChange={(e) => setSuspensionDays(Number(e.target.value))}
            variant="outlined"
            margin="dense"
          >
            <MenuItem value={1}>1 Día</MenuItem>
            <MenuItem value={2}>2 Días</MenuItem>
            <MenuItem value={7}>7 Días</MenuItem>
            <MenuItem value={30}>30 Días</MenuItem>
            <MenuItem value={-1}>Permanente</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSuspend}
            variant="contained"
            color="error"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Aplicar Castigo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  let color: any = "default";
  let label = status;

  if (status === "pending") color = "warning";
  if (status === "resolved") color = "success";
  if (status === "dismissed") color = "error";

  return (
    <Chip
      size="small"
      color={color}
      label={label.toUpperCase()}
      variant="outlined"
    />
  );
};
