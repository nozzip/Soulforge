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
} from "@mui/icons-material";
import { supabase } from "../../src/supabase";
import { ForumThread, ForumPost as ForumPostType } from "../../types";
import ForumPost from "./components/ForumPost";

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

  const handleQuote = (content: string, author: string) => {
    setNewReply(
      (prev) => `${prev}[quote author="${author}"]\n${content}\n[/quote]\n\n`,
    );
    // Focus would be nice here
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
          Back to Tavern
        </Button>
        <Typography variant="overline" color="text.secondary">
          Dungeon Master's Guide / Encounters
        </Typography>
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
          Started by{" "}
          <span style={{ color: theme.palette.secondary.main }}>
            {thread.author?.username || "Unknown"}
          </span>{" "}
          • {new Date(thread.created_at).toLocaleDateString()}
        </Typography>
      </Box>

      {/* OP */}
      <ForumPost
        content={thread.content}
        author={thread.author}
        date={thread.created_at}
        isOp={true}
        onQuote={handleQuote}
      />

      {/* Replies */}
      {posts.map((post) => (
        <ForumPost
          key={post.id}
          postId={post.id}
          content={post.content}
          author={post.author}
          date={post.created_at}
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
              CAST SENDING
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Roll for Charisma... or just type here..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              disabled={submitting}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Draconic Runes supported (Markdown)
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
                Cast Sending
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
            The Spirits of the Ancestors are Quiet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You must be logged in to commune with the spirits (post a reply).
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Thread;
