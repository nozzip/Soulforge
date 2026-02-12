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
  MenuItem,
  useTheme,
  alpha,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Shield as ShieldIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import { supabase } from "../src/supabase";
import { Profile as ProfileType } from "../types";

interface ProfileProps {
  user: any; // Using any to avoid strict type issues with Auth User vs Profile
}

const FACTIONS = [
  "Harpers",
  "Order of the Gauntlet",
  "Emerald Enclave",
  "Lords' Alliance",
  "Zhentarim",
];

// Titles based on level (read-only)
const getTitle = (level: number) => {
  if (level >= 20) return "Epic Legend";
  if (level >= 15) return "Master of the Realm";
  if (level >= 10) return "Veteran Hero";
  if (level >= 5) return "Dungeon Explorer";
  return "Novice Adventurer";
};

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const theme = useTheme();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    faction: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        // If profile doesn't exist, use user metadata
        if (error.code === "PGRST116") {
          const initialProfile = {
            id: user.id,
            username:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "Aventurero",
            full_name: user.user_metadata?.full_name || "",
            avatar_url: user.user_metadata?.avatar_url || "",
            faction: "Harpers", // Default
            title: "Novice Adventurer",
            xp: 0,
            level: 1,
          };
          setProfile(initialProfile);
          setFormData({
            faction: initialProfile.faction,
            avatar_url: initialProfile.avatar_url,
          });
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        setFormData({
          faction: data.faction || "Harpers",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        id: user.id,
        ...formData,
        // Ensure username and title are NOT updated from form data, but kept from profile or calculated
        username: profile?.username,
        title: getTitle(profile?.level || 1),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      setProfile({ ...profile, ...updates } as ProfileType);
      setEditMode(false);
    } catch (error: any) {
      alert("Error saving profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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

  const currentTitle = getTitle(profile?.level || 1);

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
              src={
                formData.avatar_url ||
                "https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets/avatars/default.png"
              }
              sx={{
                width: 140,
                height: 140,
                border: `4px solid ${theme.palette.background.paper}`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.3)}`,
              }}
            />
            {editMode && (
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
                  const url = prompt("Introduce la URL de tu avatar:");
                  if (url) setFormData({ ...formData, avatar_url: url });
                }}
              >
                <EditIcon fontSize="small" />
              </Button>
            )}
          </Box>
          <Box sx={{ textAlign: { xs: "center", sm: "left" }, flexGrow: 1 }}>
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
            <Typography variant="h6" color="text.secondary">
              {currentTitle}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1,
                justifyContent: { xs: "center", sm: "flex-start" },
                color: "warning.main",
              }}
            >
              <ShieldIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {profile?.faction || "Sin Facción"}
              </Typography>
            </Box>
          </Box>
          <Button
            variant={editMode ? "outlined" : "contained"}
            color="secondary"
            startIcon={editMode ? null : <EditIcon />}
            onClick={() => {
              if (editMode) {
                setEditMode(false);
                // Reset form data to profile state
                setFormData({
                  faction: profile?.faction || "",
                  avatar_url: profile?.avatar_url || "",
                });
              } else {
                setEditMode(true);
              }
            }}
          >
            {editMode ? "Cancelar" : "Editar"}
          </Button>
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
              {profile?.xp} XP / {(profile?.level || 1) * 1000} XP
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(
              ((profile?.xp || 0) / ((profile?.level || 1) * 1000)) * 100,
              100,
            )}
            color="secondary"
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>

        {/* Form Fields */}
        <Grid container spacing={4} justifyContent="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              select
              label="Faction"
              fullWidth
              variant="outlined"
              value={formData.faction}
              onChange={(e) =>
                setFormData({ ...formData, faction: e.target.value })
              }
              disabled={!editMode}
              sx={{ mb: 3 }}
            >
              {FACTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

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
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              Guardar Cambios
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
