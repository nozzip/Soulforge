import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
  TextField,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  PushPin as PinIcon,
} from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import RichTextEditor from "@/components/Editor/RichTextEditor";
import { uploadImage } from "@/utils/imageHandler";
import { ForumThread, ForumPost as ForumPostType } from "@/types";
import ForumPost from "../components/ForumPost";

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
  const [posts, setPosts] = useState<ForumPostType[]>([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const postsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        .order("is_pinned", { ascending: false })
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
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Refetch for full data incl profile
      const { data: newPostData } = await supabase
        .from("forum_posts")
        .select("*, author:profiles(username, avatar_url, title, faction)")
        .eq("id", data.id)
        .single();

      if (newPostData) {
        setPosts([...posts, newPostData]);
        setNewReply("");

        // Update thread updated_at to bump it in Category list
        await supabase
          .from("forum_threads")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", threadId);

        setTimeout(() => {
          postsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Error al enviar la respuesta. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchThreadAndPosts();

    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_posts",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          // If we receive an INSERT event for a post we just created, ignore it
          // to avoid duplicate optimistic updates/race conditions.
          // However, simpler to just refetch to get author data.
          // Or check user ID if payload includes it.
          // For simplicity and correctness (joins), refetching is safest.
          fetchThreadAndPosts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  const handleQuote = (content: string, author: string) => {
    const quoteHtml = `<blockquote><strong>${author} escribió:</strong><br/>${content}</blockquote><p></p>`;
    setNewReply((prev) => prev + quoteHtml);
    // Focus would be nice here
  };

  const handleDeleteThread = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas borrar este hilo completo? Esta acción no se puede deshacer.",
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
      onBack();
    } catch (error) {
      console.error("Error deleting thread:", error);
      alert("Error al borrar el hilo.");
    }
  };

  const handlePinThread = async (pinned: boolean) => {
    if (!thread) return;
    try {
      const { error } = await supabase
        .from("forum_threads")
        .update({ is_pinned: pinned })
        .eq("id", threadId);

      if (error) throw error;
      setThread({ ...thread, is_pinned: pinned });
    } catch (error) {
      console.error("Error pinning thread:", error);
      alert("Error al fijar el hilo.");
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

  if (!thread) return null;

  return (
    <Container maxWidth="xl" sx={{ mt: 14, mb: 10 }}>
      {/* Navigation & Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{ color: "text.secondary" }}
        >
          Volver a la Taberna
        </Button>
        <Typography variant="overline" color="text.secondary">
          Guía del Dungeon Master / Encuentros
        </Typography>
        {isAdmin && (
          <Box>
            <Button
              startIcon={<PinIcon />}
              color={thread.is_pinned ? "secondary" : "inherit"}
              onClick={() => handlePinThread(!thread.is_pinned)}
              sx={{ mr: 2 }}
            >
              {thread.is_pinned ? "Desfijar Hilo" : "Fijar Hilo"}
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={handleDeleteThread}
            >
              Borrar Hilo
            </Button>
          </Box>
        )}
      </Box>

      <Typography
        variant="h3"
        sx={{
          fontFamily: "Cinzel, serif",
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
          textShadow: `0 0 10px ${alpha(theme.palette.secondary.main, 0.3)}`,
        }}
      >
        {thread.title}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 6, alignItems: "center" }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: "secondary.main",
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Iniciado por{" "}
          <span style={{ color: theme.palette.secondary.main }}>
            {thread.author?.username || "Desconocido"}
          </span>{" "}
          • {new Date(thread.created_at).toLocaleDateString()}
        </Typography>
      </Box>

      {/* Posts List (OP + Replies) */}
      {posts.map((post, index) => (
        <ForumPost
          key={post.id}
          postId={post.id}
          content={post.content}
          author={post.author}
          date={post.created_at}
          isOp={index === 0}
          isAdmin={isAdmin}
          onDelete={handleDeletePost}
          onQuote={handleQuote}
        />
      ))}

      <div ref={postsEndRef} />

      {/* Reply Box - Cast Sending */}
      {user ? (
        <Paper
          sx={{
            p: 0,
            mt: 6,
            bgcolor: alpha(theme.palette.background.paper, 0.3),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              p: 1.5,
              px: 3,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: "Cinzel, serif",
                fontWeight: 700,
                color: "text.secondary",
              }}
            >
              ENVIAR MENSAJE
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
              <RichTextEditor
                content={newReply}
                onChange={setNewReply}
                placeholder="Tira por Carisma... o simplemente escribe aquí..."
                onImageUpload={(file) => uploadImage(file, user.id)}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Runas dracónicas soportadas (Markdown)
              </Typography>
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
                sx={{
                  fontFamily: "Cinzel, serif",
                  fontWeight: 700,
                  px: 4,
                }}
              >
                Enviar
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 4,
            mt: 6,
            textAlign: "center",
            bgcolor: alpha(theme.palette.background.paper, 0.2),
            border: `1px dashed ${alpha(theme.palette.text.secondary, 0.3)}`,
          }}
        >
          <Typography
            variant="h6"
            fontFamily="Cinzel, serif"
            gutterBottom
            color="secondary"
          >
            Los Espíritus Ancestrales Guardan Silencio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Debes iniciar sesión para comunicarte con los espíritus (publicar una respuesta).
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Thread;
