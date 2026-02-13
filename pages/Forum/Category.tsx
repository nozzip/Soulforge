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
} from "@mui/icons-material";
import { supabase } from "../../src/supabase";
import { ForumThread, ForumCategory, Profile } from "../../types";

interface CategoryProps {
  categoryId: string;
  onThreadSelect: (threadId: string) => void;
  onBack: () => void;
  onCreateThread: () => void;
  user: any; // Using any for now to avoid strict type issues, but should match User type
  isAdmin?: boolean;
}

const Category: React.FC<CategoryProps> = ({
  categoryId,
  onThreadSelect,
  onBack,
  onCreateThread,
  user,
  isAdmin = false,
}) => {
  const theme = useTheme();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryAndThreads();

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

      // Fetch Threads
      // Note: We need to join with profiles to get author details.
      // Supabase-js can do this if foreign keys are set up.
      const { data: threadData, error: threadError } = await supabase
        .from("forum_threads")
        .select("*, author:profiles(username, avatar_url, title, faction)")
        .eq("category_id", categoryId)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (threadError) throw threadError;
      setThreads(threadData || []);
    } catch (error) {
      console.error("Error fetching forum data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      alert("Error al borrar el hilo.");
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
      alert("Error al fijar el hilo.");
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
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              {category?.description}
            </Typography>
          </Box>
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
                      <Box>
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
                            mr: 1,
                          }}
                        >
                          <PushPinIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => handleDeleteThread(thread.id, e)}
                          color="error"
                        >
                          <DeleteIcon />
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
                      pr: isAdmin ? 8 : 3, // Add padding for delete button
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
                    <ListItemText
                      secondaryTypographyProps={{ component: "div" }}
                      primary={
                        <Typography
                          variant="h6"
                          component="span"
                          sx={{
                            fontFamily: '"Newsreader", serif',
                            fontWeight: 600,
                            color: "text.primary",
                            fontSize: "1.1rem",
                          }}
                        >
                          {thread.title}
                        </Typography>
                      }
                      secondary={
                        <Box
                          component="span"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 1,
                            gap: 2,
                            color: "text.secondary",
                            fontSize: "0.875rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              src={thread.author?.avatar_url}
                              alt={thread.author?.username}
                              sx={{ width: 24, height: 24 }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "bold",
                                color: "secondary.main",
                              }}
                            >
                              {thread.author?.username ||
                                thread.author?.full_name ||
                                "Desconocido"}
                            </Typography>
                            {thread.author?.title && (
                              <Chip
                                label={thread.author.title}
                                size="small"
                                variant="outlined"
                                sx={{
                                  height: 20,
                                  fontSize: "0.65rem",
                                  borderColor: alpha(
                                    theme.palette.secondary.main,
                                    0.3,
                                  ),
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption">
                            • {formatDate(thread.created_at)}
                          </Typography>
                        </Box>
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
    </Container>
  );
};

export default Category;
