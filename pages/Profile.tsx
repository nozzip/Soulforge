import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Shield as ShieldIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { supabase } from "../src/supabase";
import { DEFAULT_AVATAR_URL } from "../constants";
import { Profile as ProfileType, Guild, GuildMember } from "../types";
import AvatarSelectionModal from "../components/AvatarSelectionModal";

interface ProfileProps {
  user: any;
  isAdmin?: boolean;
  viewedUserId?: string;
  onProfileUpdate?: () => void;
}

// XP Calculation Helpers
const getXpThresholds = (level: number) => {
  const currentLevelXp = 500 * level * (level - 1);
  const nextLevelXp = 500 * (level + 1) * level;
  return { currentLevelXp, nextLevelXp, needed: nextLevelXp - currentLevelXp };
};

const Profile: React.FC<ProfileProps> = ({
  user,
  isAdmin = false,
  viewedUserId,
  onProfileUpdate,
}) => {
  const theme = useTheme();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [startLoading, setStartLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Guild State
  const [guildMember, setGuildMember] = useState<GuildMember | null>(null);
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [guildApps, setGuildApps] = useState<GuildMember[]>([]);
  const [createGuildOpen, setCreateGuildOpen] = useState(false);
  const [newGuildName, setNewGuildName] = useState("");
  const [creatingGuild, setCreatingGuild] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "info" | "error",
  });

  // Form State
  const [formData, setFormData] = useState({
    avatar_url: "",
    username: "",
  });

  const targetUserId = viewedUserId || user?.id;
  const isOwnProfile = user?.id === targetUserId;

  const NICKNAME_CHANGE_COOLDOWN_DAYS = 15;

  const getNicknameCooldownInfo = () => {
    if (!profile?.last_nickname_change) return { canChange: true, daysLeft: 0 };

    const lastChange = new Date(profile.last_nickname_change);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastChange.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      canChange: diffDays >= NICKNAME_CHANGE_COOLDOWN_DAYS,
      daysLeft: NICKNAME_CHANGE_COOLDOWN_DAYS - diffDays
    };
  };

  const { canChange: canChangeNickname, daysLeft } = getNicknameCooldownInfo();

  useEffect(() => {
    if (targetUserId) {
      fetchProfileAndGuild();
    }
  }, [targetUserId]);

  const fetchProfileAndGuild = async () => {
    try {
      setStartLoading(true);

      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUserId)
        .single();

      if (profileError) {
        if (profileError.code === "PGRST116") {
          if (isOwnProfile) {
            // Create default profile if missing (only for self)
            const initialProfile = {
              id: user.id,
              username: user.user_metadata?.full_name || "Aventurero",
              full_name: user.user_metadata?.full_name || "",
              avatar_url: user.user_metadata?.avatar_url || "",
              xp: 0,
              level: 1,
              title: "Novice Adventurer",
            };
            setProfile(initialProfile as ProfileType);
            setFormData({
              avatar_url: initialProfile.avatar_url,
              username: initialProfile.username
            });
          } else {
            // If viewing other profile and missing, show error or empty
            setProfile(null);
          }
        } else {
          throw profileError;
        }
      } else {
        setProfile(profileData);
        setFormData({
          avatar_url: profileData.avatar_url || "",
          username: profileData.username || ""
        });
      }

      // 2. Fetch Guild Membership
      const { data: memberData, error: memberError } = await supabase
        .from("guild_members")
        .select("*, guild:guilds(*)")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (!memberError && memberData) {
        setGuildMember(memberData);
        setMyGuild(memberData.guild as Guild);

        // 3. If Leader, fetch applications (ONLY IF OWN PROFILE)
        if (memberData.role === "leader" && memberData.guild && isOwnProfile) {
          const { data: appsData } = await supabase
            .from("guild_members")
            .select("*, profile:profiles(*)")
            .eq("guild_id", memberData.guild.id)
            .eq("status", "pending");
          setGuildApps(appsData || []);
        }
      } else {
        // Fallback: Check if they are a leader of a guild even if membership row is missing
        const { data: leaderGuild } = await supabase
          .from("guilds")
          .select("*")
          .eq("leader_id", targetUserId)
          .maybeSingle();

        if (leaderGuild) {
          setMyGuild(leaderGuild as Guild);
          setGuildMember({
            role: "leader",
            status: "accepted",
          } as any);
        } else {
          setGuildMember(null);
          setMyGuild(null);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setStartLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // 1. Validaciones de Nickname
      const nickname = formData.username.trim();

      if (nickname.length < 3) {
        throw new Error("El nickname debe tener al menos 3 caracteres.");
      }

      if (nickname.length > 20) {
        throw new Error("El nickname no puede superar los 20 caracteres.");
      }

      // Letras, números y espacios (pero no solo espacios)
      const validNicknameRegex = /^[a-zA-Z0-9\s]+$/;
      if (!validNicknameRegex.test(nickname)) {
        throw new Error("El nickname solo puede contener letras, números y espacios (sin símbolos).");
      }

      const updates: any = {
        id: user.id,
        avatar_url: formData.avatar_url,
        username: nickname,
      };

      const isNicknameChanging = nickname !== profile?.username;

      if (isNicknameChanging) {
        if (!canChangeNickname) {
          throw new Error(`Debes esperar ${daysLeft} días más para cambiar tu nickname.`);
        }

        // Verificar si el nickname ya existe (Case Insensitive)
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .ilike("username", nickname)
          .neq("id", user.id)
          .maybeSingle();

        if (checkError) console.error("Error checking username uniqueness:", checkError);

        if (existingUser) {
          throw new Error("Este nickname ya está siendo usado por otro aventurero.");
        }

        updates.last_nickname_change = new Date().toISOString();
      }

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;

      setProfile((prev) => prev ? ({ ...prev, ...updates }) : null);
      setEditMode(false);
      setSnackbar({
        open: true,
        message: "Perfil actualizado con éxito.",
        severity: "success",
      });
      if (onProfileUpdate) onProfileUpdate();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGuild = async () => {
    if (!newGuildName.trim()) return;
    setCreatingGuild(true);
    try {
      // 1. Create Guild
      const { data: guildData, error: guildError } = await supabase
        .from("guilds")
        .insert({
          name: newGuildName,
          leader_id: user.id,
        })
        .select()
        .single();

      if (guildError) throw guildError;

      // 2. Add Leader as Member
      const { error: memberError } = await supabase
        .from("guild_members")
        .insert({
          guild_id: guildData.id,
          user_id: user.id,
          role: "leader",
          status: "accepted",
        });

      if (memberError) {
        // Rollback guild creation if member insert fails?
        // Ideally yes, but for now just alert.
        console.error("Error adding leader to guild:", memberError);
      }

      setCreateGuildOpen(false);
      setNewGuildName("");
      // Refresh
      fetchProfileAndGuild();
    } catch (error: any) {
      console.error("Error creating guild:", error);
      if (error.code === "23505") {
        alert("Ya eres líder de un gremio o el nombre elegido ya está en uso.");
      } else {
        alert("Error al crear el gremio: " + error.message);
      }
    } finally {
      setCreatingGuild(false);
    }
  };

  const handleApplication = async (memberId: string, accept: boolean) => {
    try {
      if (accept) {
        await supabase
          .from("guild_members")
          .update({ status: "accepted" })
          .eq("id", memberId);
      } else {
        await supabase.from("guild_members").delete().eq("id", memberId);
      }
      // Remove from list
      setGuildApps((prev) => prev.filter((a) => a.id !== memberId));
      setSnackbar({
        open: true,
        message: accept ? "Solicitud aprobada." : "Solicitud rechazada.",
        severity: "info",
      });
    } catch (error) {
      console.error("Error managing application:", error);
      setSnackbar({
        open: true,
        message: "Error al gestionar solicitud.",
        severity: "error",
      });
    }
  };

  if (startLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const { currentLevelXp, nextLevelXp } = getXpThresholds(profile?.level || 1);
  const currentXpProgress = Math.max(0, (profile?.xp || 0) - currentLevelXp);
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const progressPercent = Math.min(
    (currentXpProgress / xpNeededForLevel) * 100,
    100,
  );

  return (
    <Container maxWidth="md" sx={{ mt: 14, mb: 10 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(12px)",
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Decoration */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 150,
            background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 100%)`,
            zIndex: 0,
          }}
        />

        {/* Header / Avatar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "flex-end" },
            gap: 4,
            mb: 4,
            position: "relative",
            zIndex: 1,
            mt: 4,
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={formData.avatar_url || DEFAULT_AVATAR_URL}
              sx={{
                width: 140,
                height: 140,
                border: `4px solid ${theme.palette.background.paper}`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.3)}`,
              }}
            />
            {editMode && isOwnProfile && (
              <Button
                variant="contained"
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  minWidth: "auto",
                  p: 1,
                  borderRadius: "50%",
                }}
                onClick={() => {
                  setAvatarModalOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </Button>
            )}
          </Box>
          <Box sx={{ textAlign: { xs: "center", sm: "left" }, flexGrow: 1 }}>
            {editMode && isOwnProfile ? (
              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Nickname"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  error={!canChangeNickname && formData.username !== profile?.username}
                  inputProps={{ maxLength: 20 }}
                  helperText={
                    !canChangeNickname && formData.username !== profile?.username
                      ? `Podrás cambiarlo en ${daysLeft} días.`
                      : "Máx. 20 caracteres, letras, números y espacios."
                  }
                  sx={{
                    maxWidth: 300,
                    "& .MuiInputBase-input": {
                      fontFamily: "Cinzel, serif",
                      fontWeight: "bold",
                    }
                  }}
                />
              </Box>
            ) : (
              <Typography
                variant="h3"
                sx={{
                  fontFamily: "Cinzel, serif",
                  fontWeight: "bold",
                  color: "secondary.main",
                }}
              >
                {profile?.username}
              </Typography>
            )}
            <Typography variant="h6" color="text.secondary">
              {profile?.title || "Novice Adventurer"}
            </Typography>

            {/* Guild Display in Header */}
            {myGuild && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                  color: "warning.main",
                }}
              >
                <ShieldIcon fontSize="small" />
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", fontFamily: "Cinzel, serif" }}
                >
                  {myGuild.name}
                </Typography>
                {guildMember?.role === "leader" && (
                  <Chip
                    label="Líder"
                    size="small"
                    color="secondary"
                    sx={{ height: 20 }}
                  />
                )}
              </Box>
            )}
            {!myGuild && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontStyle: "italic" }}
              >
                Sin Guild
              </Typography>
            )}
          </Box>
          {isOwnProfile && (
            <Button
              variant={editMode ? "outlined" : "contained"}
              color="secondary"
              startIcon={editMode ? null : <EditIcon />}
              onClick={() => {
                if (editMode) {
                  setEditMode(false);
                  setFormData({
                    avatar_url: profile?.avatar_url || "",
                    username: profile?.username || ""
                  });
                } else {
                  setEditMode(true);
                }
              }}
            >
              {editMode ? "Cancelar" : "Editar"}
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Stats / Level */}
        <Box sx={{ mb: 6 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontFamily: "Cinzel, serif" }}>
              Nivel {profile?.level}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentXpProgress} / {xpNeededForLevel} XP (Total: {profile?.xp})
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            color="secondary"
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>

        {/* GUILD SECTION */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            bgcolor: alpha(theme.palette.background.default, 0.4),
            border: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h5"
              fontFamily="Cinzel, serif"
              color="primary.main"
            >
              Guild & Alianzas
            </Typography>
          </Box>

          {!myGuild ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <ShieldIcon
                sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No perteneces a ninguna guild.
              </Typography>

              {(profile?.level || 0) >= 5 ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateGuildOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Fundar una Guild
                </Button>
              ) : (
                <Typography variant="caption" color="text.disabled">
                  Alcanza el nivel 5 para fundar tu propia guild.
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              <Grid container spacing={4}>
                <Grid
                  size={{ xs: 12, md: guildMember?.role === "leader" ? 6 : 12 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        guildMember?.role === "leader"
                          ? "flex-start"
                          : "center",
                      textAlign:
                        guildMember?.role === "leader" ? "left" : "center",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      INFORMACIÓN DE LA GUILD
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        borderRadius: 2,
                        width: guildMember?.role === "leader" ? "100%" : "80%",
                        maxWidth: 600,
                      }}
                    >
                      <Typography variant="h6" fontFamily="Cinzel, serif">
                        {myGuild.name}
                      </Typography>
                      <Typography variant="body2">
                        Miembro desde:{" "}
                        {new Date(
                          guildMember?.joined_at || "",
                        ).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={
                          guildMember?.role === "leader"
                            ? "Maestro de Guild"
                            : "Miembro"
                        }
                        color={
                          guildMember?.role === "leader"
                            ? "secondary"
                            : "default"
                        }
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </Grid>

                {/* Leader Actions / Applications */}
                {guildMember?.role === "leader" && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      SOLICITUDES DE INGRESO ({guildApps.length})
                    </Typography>
                    {guildApps.length === 0 ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontStyle="italic"
                      >
                        No hay solicitudes pendientes.
                      </Typography>
                    ) : (
                      <List
                        dense
                        sx={{
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                          borderRadius: 2,
                        }}
                      >
                        {guildApps.map((app) => (
                          <ListItem
                            key={app.id}
                            secondaryAction={
                              <Box>
                                <IconButton
                                  edge="end"
                                  color="success"
                                  onClick={() =>
                                    handleApplication(app.id, true)
                                  }
                                >
                                  <CheckIcon />
                                </IconButton>
                                <IconButton
                                  edge="end"
                                  color="error"
                                  onClick={() =>
                                    handleApplication(app.id, false)
                                  }
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Box>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar
                                src={
                                  app.profile?.avatar_url || DEFAULT_AVATAR_URL
                                }
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={app.profile?.username || "Desconocido"}
                              secondary={`Lvl ${app.profile?.level || "?"}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Save Button for Edit Mode */}
        {editMode && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={
                saving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              onClick={handleSaveProfile}
              disabled={saving}
              size="large"
            >
              Guardar Cambios
            </Button>
          </Box>
        )}
      </Paper>

      {/* Avatar Modal */}
      <AvatarSelectionModal
        open={avatarModalOpen}
        isAdmin={isAdmin}
        onClose={() => setAvatarModalOpen(false)}
        onSelect={(url) => {
          setFormData({ ...formData, avatar_url: url });
          setAvatarModalOpen(false);
        }}
      />

      {/* Create Guild Dialog */}
      <Dialog open={createGuildOpen} onClose={() => setCreateGuildOpen(false)}>
        <DialogTitle sx={{ fontFamily: "Cinzel, serif" }}>
          Fundar Nueva Guild
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Como aventurero experimentado (Nivel 5+), tienes el derecho de
            reunir a otros bajo tu estandarte.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la Guild"
            fullWidth
            variant="outlined"
            value={newGuildName}
            onChange={(e) => setNewGuildName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateGuildOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateGuild}
            variant="contained"
            color="secondary"
            disabled={!newGuildName.trim() || creatingGuild}
          >
            {creatingGuild ? <CircularProgress size={20} /> : "Crear Guild"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            fontFamily: "Newsreader, serif",
            bgcolor: "rgba(20, 20, 20, 0.95)",
            color: "#fff",
            border: `1px solid ${snackbar.severity === "success" ? "#4caf50" : snackbar.severity === "error" ? "#f44336" : "#d4af37"}`,
            "& .MuiAlert-icon": {
              color:
                snackbar.severity === "success"
                  ? "#4caf50"
                  : snackbar.severity === "error"
                    ? "#f44336"
                    : "#d4af37",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
