import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Divider,
  ListItemButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Article as ArticleIcon,
  PushPin as PushPinIcon,
  Lock as LockIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { TextField, Pagination, InputAdornment } from "@mui/material";
import { supabase } from "@/src/supabase";
import { ForumThread, ForumCategory, Profile } from "@/types";
import { DEFAULT_AVATAR_URL } from "@/constants";
import RichTextDisplay from "@/components/Editor/RichTextDisplay";
import { useToast } from "@/context/ToastContext";

interface CategoryProps {
  categoryId: string;
  onThreadSelect: (threadId: string) => void;
  onBack: () => void;
  onCreateThread: () => void;
  user: any; // Using any for now to avoid strict type issues, but should match User type
  isAdmin?: boolean;
  onProfileClick: (userId: string) => void;
}

const Category: React.FC<CategoryProps> = ({
  categoryId,
  onThreadSelect,
  onBack,
  onCreateThread,
  user,
  isAdmin = false,
  onProfileClick,
}) => {
  const theme = useTheme();
  const { showToast } = useToast();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const channel = supabase
      .channel(`category_threads:${categoryId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_threads",
          filter: `category_id=eq.${categoryId}`,
        },
        () => {
          fetchCategoryAndThreads();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryId]);

  const fetchCategoryAndThreads = async () => {
    setLoading(true);
    try {
      // Fetch Category Details
      const { data: catData, error: catError } = await supabase
        .from("forum_categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (catError) throw catError;
      setCategory(catData);

      // Fetch Threads with Pagination and Search
      let query = supabase
        .from("forum_threads")
        .select("*, author:profiles(username, avatar_url, title, faction)", {
          count: "exact",
        })
        .eq("category_id", categoryId);

      if (searchQuery.trim()) {
        query = query.ilike("title", `%${searchQuery.trim()}%`);
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const {
        data: threadData,
        error: threadError,
        count,
      } = await query
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false })
        .range(from, to);

      if (threadError) throw threadError;
      setThreads(threadData || []);
      if (count) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error("Error fetching forum data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on search
      fetchCategoryAndThreads();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch on page change
  useEffect(() => {
    fetchCategoryAndThreads();
  }, [page, categoryId]); // categoryId triggers reset via parent effect? No, let's keep it simple.

  // Remove the original useEffect which only depended on categoryId
  // We will replace it with one that depends on just the realtime subscription setup

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "¿Estás seguro de que deseas borrar este hilo? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("forum_threads")
        .delete()
        .eq("id", threadId);

      if (error) throw error;

      // Remove from state
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
    } catch (error) {
      console.error("Error deleting thread:", error);
      showToast("Error al borrar el hilo.", "error");
    }
  };

  const handlePinThread = async (
    threadId: string,
    pinned: boolean,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("forum_threads")
        .update({ is_pinned: pinned })
        .eq("id", threadId);

      if (error) throw error;

      // Update state locally
      setThreads((prev) =>
        prev
          .map((t) => (t.id === threadId ? { ...t, is_pinned: pinned } : t))
          .sort((a, b) => {
            if (a.is_pinned === b.is_pinned) {
              return (
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
              );
            }
            return a.is_pinned ? -1 : 1;
          }),
      );
    } catch (error) {
      console.error("Error pinning thread:", error);
      showToast("Error al fijar el hilo.", "error");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  return (
    <Container maxWidth="lg" sx={{ mt: 14, mb: 10 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ mb: 2, color: "text.secondary" }}
        >
          Volver a la Taberna
        </Button>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "Cinzel, serif",
                fontWeight: "bold",
                color: "secondary.main",
              }}
            >
              {category?.name}
            </Typography>
            <RichTextDisplay
              content={category?.description || ""}
              sx={{
                fontStyle: "italic",
                color: "text.secondary",
                fontSize: "1rem",
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Buscar pergaminos..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                width: { xs: "100%", sm: 300 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            {user && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                sx={{
                  fontFamily: "Cinzel, serif",
                  fontWeight: "bold",
                }}
                onClick={onCreateThread}
              >
                Nuevo Pergamino
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Threads List */}
      <Paper
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          backdropFilter: "blur(8px)",
          border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {threads.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No hay pergaminos escritos aquí aún.
            </Typography>
            {user && (
              <Button
                variant="outlined"
                color="secondary"
                sx={{ mt: 2 }}
                onClick={onCreateThread}
              >
                Sé el primero en escribir
              </Button>
            )}
          </Box>
        ) : (
          <List disablePadding>
            {threads.map((thread, index) => (
              <React.Fragment key={thread.id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    isAdmin && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mr: 1, // Margin from the edge of the paper
                        }}
                      >
                        <IconButton
                          edge="end"
                          aria-label="pin"
                          onClick={(e) =>
                            handlePinThread(thread.id, !thread.is_pinned, e)
                          }
                          sx={{
                            color: thread.is_pinned
                              ? "secondary.main"
                              : "text.disabled",
                          }}
                          size="small"
                        >
                          <PushPinIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => handleDeleteThread(thread.id, e)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )
                  }
                >
                  <ListItemButton
                    alignItems="flex-start"
                    onClick={() => onThreadSelect(thread.id)}
                    sx={{
                      py: 3,
                      px: 3,
                      pr: isAdmin ? 14 : 3, // Increased padding to avoid overlap with admin icons
                      transition: "all 0.2s",
                      bgcolor: thread.is_pinned
                        ? alpha(theme.palette.secondary.main, 0.08)
                        : "transparent",
                      "&:hover": {
                        bgcolor: thread.is_pinned
                          ? alpha(theme.palette.secondary.main, 0.15)
                          : alpha(theme.palette.secondary.main, 0.05),
                      },
                    }}
                  >
                    {/* Status Icon */}
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      {thread.is_pinned ? (
                        <PushPinIcon color="secondary" />
                      ) : thread.is_locked ? (
                        <LockIcon color="error" />
                      ) : (
                        <ArticleIcon
                          sx={{
                            color: alpha(theme.palette.text.primary, 0.4),
                          }}
                        />
                      )}
                    </ListItemIcon>

                    {/* Content */}
                    <ListItemAvatar>
                      <Avatar
                        src={thread.author?.avatar_url || DEFAULT_AVATAR_URL}
                        alt={thread.author?.username}
                        sx={{
                          cursor: "pointer",
                          "&:hover": { opacity: 0.8 },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (thread.author?.id)
                            onProfileClick(thread.author.id);
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="h6"
                          component="span"
                          sx={{
                            fontFamily: "Cinzel, serif",
                            fontWeight: 700,
                            color: "text.primary",
                          }}
                        >
                          {thread.is_pinned && (
                            <PushPinIcon
                              fontSize="small"
                              sx={{
                                mr: 1,
                                verticalAlign: "middle",
                                color: "secondary.main",
                              }}
                            />
                          )}
                          {thread.title}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="secondary.main"
                            sx={{
                              cursor: "pointer",
                              "&:hover": { textDecoration: "underline" },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (thread.author?.id)
                                onProfileClick(thread.author.id);
                            }}
                          >
                            {thread.author?.username ||
                              thread.author?.full_name ||
                              "Desconocido"}
                          </Typography>
                          {" • "}
                          {new Date(thread.created_at).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                          {thread.replies_count !== undefined &&
                            ` • ${thread.replies_count} respuestas`}
                        </React.Fragment>
                      }
                    />

                    {/* Stats */}
                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center",
                        gap: 3,
                        color: "text.secondary",
                        ml: 2,
                      }}
                    >
                      <Box sx={{ textAlign: "center", minWidth: 60 }}>
                        <VisibilityIcon fontSize="small" sx={{ mb: 0.5 }} />
                        <Typography variant="caption" display="block">
                          {thread.view_count}
                        </Typography>
                      </Box>
                      {/* Placeholder for replies count - would need DB query/join */}
                      <Box sx={{ textAlign: "center", minWidth: 60 }}>
                        <CommentIcon fontSize="small" sx={{ mb: 0.5 }} />
                        <Typography variant="caption" display="block">
                          -
                        </Typography>
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
                {index < threads.length - 1 && (
                  <Divider component="li" variant="inset" />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => {
              setPage(value);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            color="secondary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default Category;
