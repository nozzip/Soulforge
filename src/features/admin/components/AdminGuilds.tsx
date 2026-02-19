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
  Avatar,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Shield as ShieldIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import { Guild } from "@/types";
import { DEFAULT_AVATAR_URL } from "@/constants";

export const AdminGuilds: React.FC = () => {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [renameOpen, setRenameOpen] = useState(false);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [newName, setNewName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guilds")
        .select("*, leader:profiles(*), members:guild_members(count)");

      if (error) throw error;

      const formattedGuilds = data.map((g: any) => ({
        ...g,
        members_count: g.members[0]?.count || 0,
        leader: g.leader, // Ensure leader is attached
      }));

      setGuilds(formattedGuilds);
    } catch (error) {
      console.error("Error fetching guilds:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar la guild "${name}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase.from("guilds").delete().eq("id", id);
      if (error) throw error;
      setGuilds((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error("Error deleting guild:", error);
      alert("Error al eliminar la guild.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRename = async () => {
    if (!selectedGuild || !newName.trim()) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("guilds")
        .update({ name: newName })
        .eq("id", selectedGuild.id);

      if (error) throw error;

      setGuilds((prev) =>
        prev.map((g) =>
          g.id === selectedGuild.id ? { ...g, name: newName } : g,
        ),
      );
      setRenameOpen(false);
      setSelectedGuild(null);
      setNewName("");
    } catch (error) {
      console.error("Error renaming guild:", error);
      alert("Error al renombrar la guild.");
    } finally {
      setActionLoading(false);
    }
  };

  const openRenameDialog = (guild: Guild) => {
    setSelectedGuild(guild);
    setNewName(guild.name);
    setRenameOpen(true);
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
        Gestión de Guilds
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: 1, borderColor: "divider" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell>Guild</TableCell>
              <TableCell>Líder</TableCell>
              <TableCell align="center">Miembros</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guilds.map((guild) => (
              <TableRow key={guild.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <ShieldIcon color="secondary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      {guild.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={guild.leader?.avatar_url || DEFAULT_AVATAR_URL}
                      sx={{ width: 24, height: 24 }}
                    />
                    <Typography variant="body2">
                      {guild.leader?.username || "Desconocido"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={<GroupIcon sx={{ fontSize: 16 }} />}
                    label={guild.members_count || 0}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Renombrar">
                    <IconButton
                      size="small"
                      onClick={() => openRenameDialog(guild)}
                      disabled={actionLoading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(guild.id, guild.name)}
                      disabled={actionLoading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {guilds.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No hay guilds registradas.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}>
        <DialogTitle>Renombrar Guild</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nuevo Nombre"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleRename}
            variant="contained"
            color="secondary"
            disabled={!newName.trim() || actionLoading}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
