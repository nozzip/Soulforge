import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Paper,
  alpha,
  useTheme,
  Avatar,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  Dialog,
} from "@mui/material";
import {
  CalendarMonth,
  AccessTime,
  Person,
  Groups,
  Rule,
  AutoStories,
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Map as MapIcon,
  VideoCameraBack as VideoIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { supabase } from "../../../src/supabase";
import { LFGPost, Profile } from "../../../types";
import LFGPostDetails from "./LFGPostDetails";
import LFGApplicationManagement from "./LFGApplicationManagement";
import { useAdmin } from "../../../src/hooks/useAdmin";

// Systems and Tags Constants
const SYSTEMS = [
  "D&D 5e",
  "Pathfinder 2e",
  "Call of Cthulhu",
  "Vampire: The Masquerade",
  "Warhammer 40k",
  "Cyberpunk RED",
  "Other",
];
const MODALITIES = ["Campaign", "One-Shot", "West Marches", "Historias Cortas"];
const MOOD_TAGS = [
  "Amigable para Principiantes",
  "Enfoque en el Roleplay",
  "Enfoque en el Combate",
  "Enfoque en la Exploración",
  "18+",
  "Horror",
  "Sandbox",
  "Modulo",
  "Homebrew",
];

// Textures & Styles
const SUPABASE_STORAGE_URL =
  "https://ydcbptnxlslljccwedwi.supabase.co/storage/v1/object/public/assets";
const TEXTURES = {
  woodDark: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("${SUPABASE_STORAGE_URL}/textures/wood-pattern.png"), #3e2723`,
  parchment: `url("${SUPABASE_STORAGE_URL}/textures/textures.png?v2"), linear-gradient(to bottom right, #f4e4bc 0%, #e6d2a0 100%)`,
  waxSealRed: `radial-gradient(circle at 30% 30%, #ff5252, #b71c1c)`,
};

interface LFGBoardProps {
  onBack: () => void;
}

const LFGBoard: React.FC<LFGBoardProps> = ({ onBack }) => {
  const theme = useTheme();
  // Form State
  const [formData, setFormData] = useState({
    gameName: "",
    system: "",
    modality: "",
    date: "",
    time: "",
    synopsis: "",
    slots: 4,
    platform: "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [posts, setPosts] = useState<LFGPost[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<LFGPost | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "details" | "management">(
    "board",
  );

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "info" | "warning" | "error",
  });

  const { isAdmin } = useAdmin();

  const handleDeletePost = async (postId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this contract? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("lfg_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSnackbar({
        open: true,
        message: "Contract deleted successfully.",
        severity: "success",
      });
      if (selectedPost?.id === postId) {
        handleClose();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setSnackbar({
        open: true,
        message: "Error deleting contract.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchPosts();
    getUser();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("lfg_posts")
      .select("*, gm_profile:profiles(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data as unknown as LFGPost[]);
    }
  };

  // Filter State
  const [filterText, setFilterText] = useState("");
  const [filterSystem, setFilterSystem] = useState("All");
  const [filterModality, setFilterModality] = useState("All");

  const filteredPosts = posts.filter((post) => {
    const matchesText =
      post.game_name.toLowerCase().includes(filterText.toLowerCase()) ||
      (post.synopsis &&
        post.synopsis.toLowerCase().includes(filterText.toLowerCase())) ||
      (post.gm_profile?.username &&
        post.gm_profile.username
          .toLowerCase()
          .includes(filterText.toLowerCase()));
    const matchesSystem =
      filterSystem === "All" || post.system === filterSystem;
    const matchesModality =
      filterModality === "All" || post.modality === filterModality;

    return matchesText && matchesSystem && matchesModality;
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      setSnackbar({
        open: true,
        message: "You must be logged in to post a contract.",
        severity: "error",
      });
      return;
    }

    if (
      !formData.gameName ||
      !formData.system ||
      !formData.modality ||
      !formData.date ||
      !formData.time
    ) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields.",
        severity: "error",
      });
      return;
    }

    const { error } = await supabase.from("lfg_posts").insert([
      {
        gm_id: user.id,
        game_name: formData.gameName,
        system: formData.system,
        modality: formData.modality,
        date: formData.date,
        time: formData.time,
        synopsis: formData.synopsis,
        tags: selectedTags,
        slots_total: formData.slots,
        slots_taken: 0,
        platform: formData.platform || "TBD",
      },
    ]);

    if (error) {
      console.error("Error creating post:", error);
      setSnackbar({
        open: true,
        message: "Error creating post: " + error.message,
        severity: "error",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Contract posted successfully!",
        severity: "success",
      });
      fetchPosts();
      // Reset Form
      setFormData({
        gameName: "",
        system: "",
        modality: "",
        date: "",
        time: "",
        synopsis: "",
        slots: 4,
        platform: "",
      });
      setSelectedTags([]);
    }
  };

  const handleClose = () => {
    setSelectedPost(null);
    setViewMode("board");
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 14, mb: 10 }}>
      {/* Detail/Management Modal */}
      <Dialog
        open={Boolean(selectedPost)}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: `
              linear-gradient(rgba(20, 20, 20, 0.9), rgba(20, 20, 20, 0.9)),
              radial-gradient(circle at 50% 50%, #4a3b32 0%, #1a1a1a 100%)
            `, // Deep warm dark metal
            border: `1px solid #c5a059`,
            borderRadius: "4px", // Slight rounding, mostly sharp
            boxShadow: `
              0 0 0 4px #0f0f0f,  /* Inner dark band */
              0 0 0 6px #5d4037,  /* Outer leather/wood rim */
              0 0 15px 6px rgba(0, 0, 0, 0.8), /* Deep drop shadow */
              0 0 30px rgba(197, 160, 89, 0.1) /* Faint magical glow */
            `,
            p: 0,
            overflow: "hidden",
            color: "#e0e0e0",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              border: "1px solid rgba(197, 160, 89, 0.3)",
              margin: "4px",
              pointerEvents: "none",
            },
          },
        }}
        // Remove default Dialog padding so components can control it
        sx={{
          "& .MuiDialog-paper": {
            margin: { xs: 2, md: 4 },
            overflow: "visible", // Allow box-shadows to bleed out
          },
          "& .MuiBackdrop-root": {
            backdropFilter: "blur(5px)",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <Box sx={{ position: "relative", height: "80vh", overflowY: "auto" }}>
          {selectedPost && viewMode === "details" && (
            <LFGPostDetails
              post={selectedPost}
              onBack={handleClose}
              currentUser={user}
              onManage={() => setViewMode("management")}
              isAdmin={isAdmin}
              onDelete={() => handleDeletePost(selectedPost.id)}
            />
          )}
          {selectedPost && viewMode === "management" && (
            <LFGApplicationManagement
              post={selectedPost}
              onBack={() => setViewMode("details")}
              currentUser={user}
              isAdmin={isAdmin}
              onUpdate={() => {
                // Same update logic as before
                supabase
                  .from("lfg_posts")
                  .select("*, gm_profile:profiles(*)")
                  .eq("id", selectedPost.id)
                  .single()
                  .then(({ data }) => {
                    if (data) setSelectedPost(data as any);
                    fetchPosts();
                  });
              }}
            />
          )}
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: "rgba(93, 64, 55, 0.8)",
              color: "#ffecb3",
              "&:hover": { bgcolor: "#3e2723" },
              zIndex: 10,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Dialog>
      {/* Main Board Container */}
      <Box
        sx={{
          p: 4,
          background: TEXTURES.woodDark,
          borderRadius: 2,
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.9)",
          border: "4px solid #5d4037",
          position: "relative",
        }}
      >
        {/* Corner Decorations (CSS simulated bolts/corner plates) */}
        {[].map((pos, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: 20,
              height: 20,
              bgcolor: "#c5a059", // Gold
              borderRadius: "50%",
              boxShadow:
                "inset -2px -2px 4px rgba(0,0,0,0.5), 2px 2px 4px rgba(0,0,0,0.5)",
              border: "2px solid #5d4037",
              zIndex: 2,
              ...pos,
            }}
          />
        ))}

        {/* Header */}
        <Box
          sx={{ mb: 6, textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontFamily: "Cinzel, serif",
              fontWeight: 800,
              color: "#ffecb3", // Light gold text
              textShadow:
                "0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(197, 160, 89, 0.5)",
              letterSpacing: 4,
              mb: 1,
              textTransform: "uppercase",
            }}
          >
            Quest Board
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Newsreader", serif',
              color: "#d7ccc8",
              fontStyle: "italic",
              maxWidth: 600,
              mx: "auto",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            }}
          >
            "Heroes wanted. Darkness rises. Answer the call."
          </Typography>
          <Button
            onClick={onBack}
            sx={{
              mt: 2,
              color: "#c5a059",
              textTransform: "none",
              "&:hover": {
                color: "#ffecb3",
                bgcolor: "rgba(197, 160, 89, 0.1)",
              },
            }}
          >
            &larr; Return to Tavern
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* LEFT COLUMN: SCRIBE A CONTRACT (FORM) */}
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <Paper
              elevation={12}
              sx={{
                p: 3,
                background: `linear-gradient(to bottom, #2d2d2d, #1a1a1a)`, // Dark metal/slate look
                border: `2px solid #c5a059`, // Gold border
                borderRadius: 1,
                position: "sticky",
                top: 100,
                boxShadow: "0 8px 16px rgba(0,0,0,0.6)",
              }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  mb: 3,
                  borderBottom: `1px solid #c5a059`,
                  pb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "Cinzel, serif",
                    fontWeight: 700,
                    color: "#c5a059", // Gold
                    letterSpacing: 1,
                  }}
                >
                  SCRIBE A QUEST
                </Typography>
              </Box>

              <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
              >
                {/* Game Name */}
                <TextField
                  label="Quest Title"
                  variant="filled" // Filled variant matches better with dark bg
                  fullWidth
                  size="small"
                  value={formData.gameName}
                  onChange={(e) =>
                    setFormData({ ...formData, gameName: e.target.value })
                  }
                  placeholder="Name your adventure..."
                  sx={{
                    bgcolor: "rgba(0,0,0,0.3)",
                    input: { color: "#e0e0e0" },
                    label: { color: "#9e9e9e" },
                    "& .MuiFilledInput-root": {
                      "&:before": { borderBottomColor: "#5d4037" },
                    },
                  }}
                />

                {/* System & Modality */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <FormControl
                      fullWidth
                      size="small"
                      variant="filled"
                      sx={{ bgcolor: "rgba(0,0,0,0.3)" }}
                    >
                      <InputLabel sx={{ color: "#9e9e9e" }}>System</InputLabel>
                      <Select
                        value={formData.system}
                        onChange={(e) =>
                          setFormData({ ...formData, system: e.target.value })
                        }
                        sx={{ color: "#e0e0e0" }}
                      >
                        {SYSTEMS.map((sys) => (
                          <MenuItem key={sys} value={sys}>
                            {sys}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControl
                      fullWidth
                      size="small"
                      variant="filled"
                      sx={{ bgcolor: "rgba(0,0,0,0.3)" }}
                    >
                      <InputLabel sx={{ color: "#9e9e9e" }}>
                        Modality
                      </InputLabel>
                      <Select
                        value={formData.modality}
                        onChange={(e) =>
                          setFormData({ ...formData, modality: e.target.value })
                        }
                        sx={{ color: "#e0e0e0" }}
                      >
                        {MODALITIES.map((mod) => (
                          <MenuItem key={mod} value={mod}>
                            {mod}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Date & Time */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 7 }}>
                    <TextField
                      type="date"
                      label="Date"
                      InputLabelProps={{
                        shrink: true,
                        sx: { color: "#9e9e9e" },
                      }}
                      fullWidth
                      size="small"
                      variant="filled"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      sx={{
                        bgcolor: "rgba(0,0,0,0.3)",
                        input: { color: "#e0e0e0" },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 5 }}>
                    <TextField
                      type="time"
                      label="Time"
                      InputLabelProps={{
                        shrink: true,
                        sx: { color: "#9e9e9e" },
                      }}
                      fullWidth
                      size="small"
                      variant="filled"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      sx={{
                        bgcolor: "rgba(0,0,0,0.3)",
                        input: { color: "#e0e0e0" },
                      }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="Synopsis"
                  variant="filled"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.synopsis}
                  onChange={(e) =>
                    setFormData({ ...formData, synopsis: e.target.value })
                  }
                  placeholder="Details of the contract..."
                  sx={{
                    bgcolor: "rgba(0,0,0,0.3)",
                    textarea: { color: "#e0e0e0" },
                    label: { color: "#9e9e9e" },
                  }}
                />

                <TextField
                  label="Platform / VTT"
                  variant="filled"
                  fullWidth
                  size="small"
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value })
                  }
                  sx={{
                    bgcolor: "rgba(0,0,0,0.3)",
                    input: { color: "#e0e0e0" },
                    label: { color: "#9e9e9e" },
                  }}
                />

                {/* Tags */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      mb: 1,
                      display: "block",
                      color: "#c5a059",
                      fontWeight: "bold",
                    }}
                  >
                    TAGS
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {MOOD_TAGS.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onClick={() => handleTagToggle(tag)}
                        clickable
                        sx={{
                          fontSize: "0.7rem",
                          bgcolor: selectedTags.includes(tag)
                            ? "#c5a059"
                            : "rgba(255,255,255,0.1)",
                          color: selectedTags.includes(tag)
                            ? "#000"
                            : "#e0e0e0",
                          "&:hover": {
                            bgcolor: selectedTags.includes(tag)
                              ? "#bcaaa4"
                              : "rgba(255,255,255,0.2)",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Slots */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#c5a059" }}>
                    Party Size:
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    variant="filled"
                    sx={{
                      width: 80,
                      bgcolor: "rgba(0,0,0,0.3)",
                      input: { color: "#e0e0e0" },
                    }}
                    value={formData.slots}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slots: parseInt(e.target.value),
                      })
                    }
                    inputProps={{ min: 1, max: 10 }}
                  />
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleSubmit}
                  startIcon={<AddIcon />}
                  sx={{
                    fontFamily: "Cinzel, serif",
                    fontWeight: 700,
                    mt: 2,
                    background: `linear-gradient(to bottom, #c5a059, #8d6e63)`, // Gold gradient
                    color: "#3e2723",
                    border: "1px solid #5d4037",
                    "&:hover": {
                      background: `linear-gradient(to bottom, #d7ccc8, #a1887f)`,
                    },
                  }}
                >
                  POST CONTRACT
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* RIGHT COLUMN: QUEST BOARD (LIST) */}
          <Grid size={{ xs: 12, md: 8, lg: 9 }}>
            {/* Filter Bar */}
            <Paper
              sx={{
                p: 2,
                mb: 4,
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
                background: `linear-gradient(to bottom, #2d2d2d, #1a1a1a)`,
                border: `2px solid #c5a059`,
                borderRadius: 1,
                boxShadow: "0 4px 6px rgba(0,0,0,0.6)",
                position: "relative",
              }}
            >
              <TextField
                size="small"
                placeholder="Search quests..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "#c5a059" }} />
                  ),
                }}
                sx={{
                  flexGrow: 1,
                  minWidth: 200,
                  bgcolor: "rgba(0,0,0,0.3)",
                  input: { color: "#e0e0e0" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(197, 160, 89, 0.3)" },
                    "&:hover fieldset": { borderColor: "#c5a059" },
                    "&.Mui-focused fieldset": { borderColor: "#c5a059" },
                  },
                }}
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: "#9e9e9e" }}>System</InputLabel>
                <Select
                  value={filterSystem}
                  label="System"
                  onChange={(e) => setFilterSystem(e.target.value)}
                  sx={{
                    bgcolor: "rgba(0,0,0,0.3)",
                    color: "#e0e0e0",
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(197, 160, 89, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#c5a059",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#c5a059",
                    },
                    ".MuiSvgIcon-root": { color: "#c5a059" },
                  }}
                >
                  <MenuItem value="All">All Systems</MenuItem>
                  {SYSTEMS.map((sys) => (
                    <MenuItem key={sys} value={sys}>
                      {sys}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: "#9e9e9e" }}>Modality</InputLabel>
                <Select
                  value={filterModality}
                  label="Modality"
                  onChange={(e) => setFilterModality(e.target.value)}
                  sx={{
                    bgcolor: "rgba(0,0,0,0.3)",
                    color: "#e0e0e0",
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(197, 160, 89, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#c5a059",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#c5a059",
                    },
                    ".MuiSvgIcon-root": { color: "#c5a059" },
                  }}
                >
                  <MenuItem value="All">All Modalities</MenuItem>
                  {MODALITIES.map((mod) => (
                    <MenuItem key={mod} value={mod}>
                      {mod}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {filteredPosts.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8, opacity: 0.6 }}>
                  <Typography
                    variant="h6"
                    fontFamily="Cinzel, serif"
                    sx={{ color: "#d7ccc8" }}
                  >
                    No quests found matching your criteria.
                  </Typography>
                </Box>
              ) : (
                filteredPosts.map((post) => (
                  <Paper
                    key={post.id}
                    elevation={4}
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "8px",
                      background: "transparent",
                      backgroundImage: `url("${SUPABASE_STORAGE_URL}/quest-card.jpg")`,
                      backgroundSize: "100% 100%",
                      backgroundRepeat: "no-repeat",
                      // content usually has padding to avoid the border
                      color: "#3e2723",
                      p: 0,
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      transition: "transform 0.2s",
                      boxShadow: "none",
                      filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.5))",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        filter:
                          "drop-shadow(0px 8px 16px rgba(0,0,0,0.6)) brightness(1.1)",
                      },
                    }}
                  >
                    {/* Wax Seal - Join Button */}
                    <Box
                      onClick={() => {
                        setSelectedPost(post);
                        setViewMode("details");
                      }}
                      sx={{
                        position: "absolute",
                        right: { xs: 16, md: 80 },
                        bottom: { xs: 16, md: "auto" },
                        top: { md: "50%" },
                        transform: { md: "translateY(-50%)" },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        zIndex: 5,
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: {
                            md: "translateY(-50%) scale(1.1)",
                            xs: "scale(1.1)",
                          },
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontFamily: "Cinzel, serif",
                          fontWeight: "bold",
                          color: "#5d4037",
                          mb: 0.5,
                          textShadow: "0 0 4px rgba(255,255,255,0.8)",
                        }}
                      >
                        Unirse
                      </Typography>
                      <Box
                        sx={{
                          width: 250,
                          height: 80,
                          backgroundImage: `url("${SUPABASE_STORAGE_URL}/wax-seal.png")`,
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                          filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.5))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "transform 0.2s",
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontFamily: "Cinzel, serif",
                          fontWeight: "bold",
                          color: "#5d4037",
                          mb: 0.5,
                          textShadow: "0 0 4px rgba(255,255,255,0.8)",
                        }}
                      >
                        A la quest
                      </Typography>
                    </Box>

                    {/* Content Section */}
                    <Box
                      sx={{
                        flex: 1,
                        p: { xs: 6, md: 8 },
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        alignItems: "center", // Center everything
                        textAlign: "center",
                      }}
                    >
                      {/* Header: Title, System & Players */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                          width: "100%",
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontFamily: "Cinzel, serif",
                            fontWeight: 800,
                            color: "#2d1b15",
                            lineHeight: 1.1,
                            textShadow:
                              "0 1px 2px rgba(255,255,255,0.4), 0 -1px 1px rgba(0,0,0,0.1)",
                            fontSize: { xs: "1.8rem", md: "2.2rem" },
                          }}
                        >
                          {post.game_name}
                        </Typography>

                        {/* System & Modality as Subtitle */}
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: "Cinzel, serif",
                            fontWeight: 600,
                            color: "#5d4037",
                            fontSize: "1rem",
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            opacity: 0.9,
                          }}
                        >
                          {post.system} • {post.modality}
                        </Typography>

                        {/* Players as Text */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                            color: "#2d1b15",
                          }}
                        >
                          <Groups fontSize="small" />
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "Cinzel, serif",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                            }}
                          >
                            {post.slots_taken} / {post.slots_total} Heroes
                          </Typography>
                        </Box>
                      </Box>

                      {/* Details Grid */}
                      <Grid
                        container
                        spacing={4}
                        sx={{ mt: 1, justifyContent: "center" }}
                      >
                        <Grid size={{ xs: 12, sm: "auto" }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <AccessTime
                                fontSize="small"
                                sx={{ color: "#5d4037" }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 900,
                                  color: "#5d4037",
                                  fontFamily: "Cinzel, serif",
                                  letterSpacing: 1,
                                }}
                              >
                                CUANDO
                              </Typography>
                            </Box>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 700,
                                fontFamily: '"Newsreader", serif',
                                fontSize: "1.1rem",
                                color: "#2d1b15",
                              }}
                            >
                              {post.date} @ {post.time} (GMT-3)
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: "auto" }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <MapIcon
                                fontSize="small"
                                sx={{ color: "#5d4037" }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 900,
                                  color: "#5d4037",
                                  fontFamily: "Cinzel, serif",
                                  letterSpacing: 1,
                                }}
                              >
                                DONDE
                              </Typography>
                            </Box>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 700,
                                fontFamily: '"Newsreader", serif',
                                fontSize: "1.1rem",
                                color: "#2d1b15",
                              }}
                            >
                              {post.platform}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Divider
                        sx={{ borderColor: "rgba(62, 39, 35, 0.3)", my: 1 }}
                      />

                      {/* Synopsis */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: "italic",
                          fontWeight: 700, // Bolder
                          fontFamily: '"Newsreader", serif',
                          fontSize: "1.2rem",
                          lineHeight: 1.6,
                          color: "#2d1b15",
                          maxWidth: "90%",
                        }}
                      >
                        "{post.synopsis}"
                      </Typography>

                      {/* Footer: Tags & GM */}
                      <Box
                        sx={{
                          mt: "auto",
                          pt: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {post.tags?.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: "#8d6e63",
                                color: "#3e2723", // Darker text
                                fontWeight: "bold",
                                fontSize: "0.75rem",
                                bgcolor: "rgba(255,255,255,0.6)", // Lighter background
                                fontFamily: "Cinzel, serif",
                              }}
                            />
                          ))}
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            src={post.gm_profile?.avatar_url}
                            sx={{
                              width: 40,
                              height: 40,
                              border: "2px solid #5d4037",
                            }}
                          />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                color: "#5d4037",
                                lineHeight: 1,
                                fontFamily: "Cinzel, serif",
                                fontWeight: 800,
                                fontSize: "0.7rem",
                                letterSpacing: 1,
                              }}
                            >
                              GAME MASTER
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: "#3e2723",
                                fontFamily: '"Newsreader", serif',
                              }}
                            >
                              {post.gm_profile?.username || "Unknown"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {isAdmin && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.id);
                        }}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "#c62828",
                          bgcolor: "rgba(255,255,255,0.8)",
                          "&:hover": {
                            bgcolor: "#ffebee",
                          },
                          zIndex: 10,
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Paper>
                ))
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>{" "}
      {/* End Main Board Container */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LFGBoard;
