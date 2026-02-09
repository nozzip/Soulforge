import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  TextField,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  FormatQuote as QuoteIcon,
  Flag as FlagIcon,
  FavoriteBorder as LikeIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { supabase } from "../../src/supabase";
import { ForumThread, ForumPost } from "../../types";

interface ThreadProps {
  threadId: string;
  onBack: () => void;
  user: any;
  isAdmin?: boolean;
}

const Thread: React.FC<ThreadProps> = ({
  threadId,
  onBack,
  user,
  isAdmin = false,
}) => {
  const theme = useTheme();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const postsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchThreadAndPosts();
    incrementViewCount();
  }, [threadId]);

  const fetchThreadAndPosts = async () => {
    setLoading(true);
    try {
      // Fetch Thread (OP)
      const { data: threadData, error: threadError } = await supabase
        .from("forum_threads")
        .select("*, author:profiles(username, avatar_url, title, faction)")
        .eq("id", threadId)
        .single();

      if (threadError) throw threadError;
      setThread(threadData);

      // Fetch Replies
      const { data: postData, error: postError } = await supabase
        .from("forum_posts")
        .select("*, author:profiles(username, avatar_url, title, faction)")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (postError) throw postError;
      setPosts(postData || []);
    } catch (error) {
      console.error("Error fetching thread data:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    await supabase.rpc("increment_thread_view", { thread_id: threadId });
  };

  const handleDeleteThread = async () => {
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
      onBack(); // Return to previous screen
    } catch (error) {
      console.error("Error deleting thread:", error);
      alert("Error al borrar el hilo.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas borrar este mensaje? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error al borrar el mensaje.");
    }
  };

  const handlePostReply = async () => {
    if (!newReply.trim() || !user) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .insert({
          thread_id: threadId,
          content: newReply,
          author_id: user.id, // Assuming profiles.id matches auth.users.id
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistic update or refetch
      // For simplicity, refetch or append manually if we had full profile data
      // I'll just refetch posts to be safe and get the joined profile data
      const { data: newPostData } = await supabase
        .from("forum_posts")
        .select("*, author:profiles(username, avatar_url, title, faction)")
        .eq("id", data.id)
        .single();

      if (newPostData) {
        setPosts([...posts, newPostData]);
        setNewReply("");
        // Scroll to bottom
        setTimeout(() => {
          postsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Error sending reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const PostView = ({
    content,
    author,
    date,
    isOp = false,
    postId,
  }: {
    content: string;
    author: any;
    date: string;
    isOp?: boolean;
    postId?: string;
  }) => (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        bgcolor: isOp
          ? alpha(theme.palette.secondary.main, 0.05)
          : alpha(theme.palette.background.paper, 0.6),
        border: isOp
          ? `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
          : `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        backdropFilter: "blur(5px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        {/* Author Sidebar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", sm: "column" },
            alignItems: "center",
            gap: 1,
            minWidth: { sm: 120 },
            borderRight: {
              sm: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            },
            pr: { sm: 2 },
            pb: { xs: 2, sm: 0 },
            borderBottom: {
              xs: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              sm: "none",
            },
          }}
        >
          <Avatar
            src={author?.avatar_url}
            alt={author?.username}
            sx={{ width: 64, height: 64, border: "2px solid #aaa" }}
          />
          <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", color: "secondary.main" }}
            >
              {author?.username || "Desconocido"}
            </Typography>
            {author?.title && (
              <Chip
                label={author.title}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            )}
            {author?.faction && (
              <Typography
                variant="caption"
                display="block"
                sx={{ mt: 0.5, fontStyle: "italic", opacity: 0.7 }}
              >
                {author.faction}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Publicado el {formatDate(date)}
            </Typography>
            <Box>
              <IconButton size="small">
                <QuoteIcon fontSize="small" />
              </IconButton>
              {!isOp && (
                <IconButton size="small">
                  <LikeIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton size="small" color="error">
                <FlagIcon fontSize="small" />
              </IconButton>
              {isAdmin && !isOp && postId && (
                <Tooltip title="Borrar Comentario (Admin)">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeletePost(postId)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
          <Typography
            variant="body1"
            sx={{
              fontFamily: '"Newsreader", serif',
              fontSize: "1.05rem",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {content}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

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

  if (!thread) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 14, mb: 10 }}>
      {/* Header */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ mb: 3, color: "text.secondary" }}
      >
        Volver a la Lista
      </Button>

      <Typography
        variant="h4"
        sx={{
          fontFamily: "Cinzel, serif",
          fontWeight: "bold",
          color: "secondary.main",
          mb: 4,
          borderBottom: "1px solid",
          borderColor: "secondary.main",
          pb: 2,
        }}
      >
        {thread.title}
      </Typography>

      {/* OP */}
      <PostView
        content={thread.content}
        author={thread.author}
        date={thread.created_at}
        isOp={true}
      />

      {/* Replies */}
      {posts.map((post) => (
        <PostView
          key={post.id}
          content={post.content}
          author={post.author}
          date={post.created_at}
        />
      ))}

      <div ref={postsEndRef} />

      {/* Reply Box */}
      {user ? (
        <Paper
          sx={{
            p: 3,
            mt: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontFamily: "Cinzel, serif" }}>
            Escribe tu respuesta
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Comparte tu sabiduría..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            disabled={submitting}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="secondary"
              endIcon={
                submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon />
                )
              }
              onClick={handlePostReply}
              disabled={submitting || !newReply.trim()}
            >
              Publicar Respuesta
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 3,
            mt: 4,
            textAlign: "center",
            bgcolor: alpha(theme.palette.action.disabledBackground, 0.1),
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Debes iniciar sesión para unirte a la conversación.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Thread;
