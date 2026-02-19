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
  Search as SearchIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  PushPin as PinIcon,
} from "@mui/icons-material";
import { Breadcrumbs, Link, Pagination } from "@mui/material";
import { supabase } from "@/src/supabase";
import RichTextEditor from "@/components/Editor/RichTextEditor";
import DOMPurify from "isomorphic-dompurify";
import { uploadImage } from "@/utils/imageHandler";
import { ForumThread, ForumPost as ForumPostType } from "@/types";
import ForumPost from "../components/ForumPost";
import { useToast } from "@/context/ToastContext";
import SEO from "@/components/SEO";

interface ThreadProps {
  threadId: string;
  onBack: () => void;
  user: any;
  isAdmin?: boolean;
  onProfileClick: (userId: string) => void;
  onGoHome: () => void;
}

const Thread: React.FC<ThreadProps> = ({
  threadId,
  onBack,
  onGoHome,
  user,
  isAdmin = false,
  onProfileClick,
}) => {
  const theme = useTheme();
  const { showToast } = useToast();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPostType[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryName, setCategoryName] = useState("");
  const ITEMS_PER_PAGE = 20;
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const postsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    incrementViewCount();
  }, [threadId]);

  const fetchThreadAndPosts = async () => {
    setLoading(true);
    try {
      // 1. Fetch Thread Details
      const { data: threadData, error: threadError } = await supabase
        .from("forum_threads")
        .select("*, author:profiles(username, avatar_url, title, faction, id)")
        .eq("id", threadId)
        .single();

      if (threadError) throw threadError;
      setThread(threadData);

      // Fetch Category Name
      if (threadData?.category_id) {
        const { data: catData } = await supabase
          .from("forum_categories")
          .select("name")
          .eq("id", threadData.category_id)
          .single();
        if (catData) setCategoryName(catData.name);
      }

      // 2. Fetch Posts (Paginated)
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const {
        data: postsData,
        error: postsError,
        count,
      } = await supabase
        .from("forum_posts")
        .select(
          "*, author:profiles(username, avatar_url, title, faction, id)",
          {
            count: "exact",
          },
        )
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })
        .range(from, to);

      if (postsError) throw postsError;
      setPosts(postsData || []);
      if (count) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }

      // Fetch User Likes
      if (user && threadData) {
        const postIds = (postsData || []).map((p) => p.id);
        // Build query for likes: user_id AND (thread_id OR post_id IN list)
        let query = supabase
          .from("forum_likes")
          .select("thread_id, post_id")
          .eq("user_id", user.id);

        if (postIds.length > 0) {
          query = query.or(
            `thread_id.eq.${threadId},post_id.in.(${postIds.join(",")})`,
          );
        } else {
          query = query.eq("thread_id", threadId);
        }

        const { data: likesData } = await query;

        const newSet = new Set<string>();
        likesData?.forEach((like) => {
          if (like.thread_id) newSet.add(`thread:${like.thread_id}`);
          if (like.post_id) newSet.add(`post:${like.post_id}`);
        });
        setLikedItems(newSet);
      }
    } catch (error) {
      console.error("Error fetching thread data:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    await supabase.rpc("increment_thread_view", { thread_id: threadId });
  };

  const handleLike = async (id: string, isThread: boolean) => {
    if (!user) {
      showToast("Debes iniciar sesión para dar Me Gusta.", "warning");
      return;
    }

    const key = isThread ? `thread:${id}` : `post:${id}`;
    const isLiked = likedItems.has(key);

    // Optimistic Update
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(key);
      else next.add(key);
      return next;
    });

    if (isThread) {
      setThread((prev) =>
        prev
          ? {
              ...prev,
              likes_count: (prev.likes_count || 0) + (isLiked ? -1 : 1),
            }
          : null,
      );
    } else {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, likes_count: (p.likes_count || 0) + (isLiked ? -1 : 1) }
            : p,
        ),
      );
    }

    try {
      if (isLiked) {
        // Unlike
        const query = isThread
          ? { thread_id: id, user_id: user.id }
          : { post_id: id, user_id: user.id };

        await supabase.from("forum_likes").delete().match(query);
      } else {
        // Like
        const payload = isThread
          ? { thread_id: id, user_id: user.id }
          : { post_id: id, user_id: user.id };

        await supabase.from("forum_likes").insert(payload);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert would be complex, let's assume success or refresh on error
      fetchThreadAndPosts();
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
      showToast("Error al borrar el mensaje.", "error");
    }
  };

  const handlePostReply = async () => {
    if (!replyContent.trim() || !user) return;

    // Check suspension
    const { data: profile } = await supabase
      .from("profiles")
      .select("forum_suspended_until")
      .eq("id", user.id)
      .single();

    if (profile?.forum_suspended_until) {
      const suspendedUntil = new Date(profile.forum_suspended_until);
      if (suspendedUntil > new Date()) {
        const dateStr = suspendedUntil.toLocaleDateString();
        const timeStr = suspendedUntil.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        showToast(
          `Tu cuenta está suspendida de participar en el foro hasta el ${dateStr} a las ${timeStr}.`,
          "error",
        );
        return;
      }
    }

    // Sanitize content
    const sanitizedContent = DOMPurify.sanitize(replyContent);

    // Validate length (strip HTML for length check)
    const textOnly = sanitizedContent.replace(/<[^>]*>/g, "").trim();
    if (textOnly.length < 10) {
      showToast("El mensaje debe tener al menos 10 caracteres.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .insert({
          thread_id: threadId,
          content: sanitizedContent,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Refetch for full data incl profile
      const { data: newPostData } = await supabase
        .from("forum_posts")
        .select(
          "*, author:profiles(username, avatar_url, title, guild_members(guild:guilds(name, id)))",
        )
        .eq("id", data.id)
        .single();

      if (newPostData) {
        setPosts([...posts, newPostData]);
        setReplyContent("");

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
      showToast("Error al enviar la respuesta. Inténtalo de nuevo.", "error");
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
    const sanitizedQuote = DOMPurify.sanitize(content);
    const quoteHtml = `<blockquote><strong>${author} escribió:</strong><br/>${sanitizedQuote}</blockquote><p></p>`;
    setReplyContent((prev) => prev + quoteHtml);
    // Focus would be nice here
  };

  const handleEditPost = async (postId: string, newContent: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        showToast("Debes estar conectado para editar mensajes.", "warning");
        return;
      }

      const { error } = await supabase
        .from("forum_posts")
        .update({ content: newContent, is_edited: true })
        .eq("id", postId);

      if (error) throw error;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, content: newContent, is_edited: true } : p,
        ),
      );
      // For OP, maybe update Thread title if we allowed title editing? No, just content.
      // If OP content is edited, we should update thread view too?
      // But thread view uses `posts[0]`.
    } catch (error: any) {
      console.error("Error editing post:", error);
      const errorMessage = error?.message || "Error desconocido";
      if (error?.status === 401 || error?.code === "PGRST301") {
        showToast(
          "Tu sesión ha expirado o no tienes permisos. Por favor, intenta cerrar sesión e iniciarla de nuevo.",
          "error",
        );
      } else {
        showToast(`Error al editar el mensaje: ${errorMessage}`, "error");
      }
    }
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
      showToast("Error al borrar el hilo.", "error");
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
      showToast("Error al fijar el hilo.", "error");
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
      {thread && (
        <SEO
          title={`${thread.title} | La Taberna`}
          description={`Hilo iniciado por ${thread.author?.username || "un usuario"}`}
        />
      )}
      {/* Navigation & Header */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onGoHome();
            }}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            La Taberna
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
          >
            {categoryName || "Categoría"}
          </Link>
          <Typography color="text.primary">
            {thread?.title || "Hilo"}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          {/* Empty box to keep layout if needed or remove if Breadcrumbs is enough */}
        </Box>
        {/* ... Admin actions ... */}

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
          likesCount={post.likes_count}
          isLiked={likedItems.has(`post:${post.id}`)}
          onLike={() => handleLike(post.id, false)}
          currentUserId={user?.id}
          onEdit={handleEditPost}
          onProfileClick={onProfileClick}
          isEdited={post.is_edited}
        />
      ))}

      <div ref={postsEndRef} />

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, mb: 4, display: "flex", justifyContent: "center" }}>
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
                content={replyContent}
                onChange={setReplyContent}
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
                disabled={submitting || !replyContent.trim()}
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
            Debes iniciar sesión para comunicarte con los espíritus (publicar
            una respuesta).
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Thread;
