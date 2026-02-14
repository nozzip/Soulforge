import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  useTheme,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import RichTextEditor from "@/components/Editor/RichTextEditor";
import { uploadImage } from "@/utils/imageHandler";

interface CreateThreadProps {
  categoryId: string;
  onCancel: () => void;
  onThreadCreated: (threadId: string) => void;
  user: any;
}

const CreateThread: React.FC<CreateThreadProps> = ({
  categoryId,
  onCancel,
  onThreadCreated,
  user,
}) => {
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Create Thread
      // Note: is_pinned and is_locked default to false in DB or we let them be null/default
      const { data: threadData, error: threadError } = await supabase
        .from("forum_threads")
        .insert({
          category_id: categoryId,
          author_id: user.id,
          title: title.trim(),
          view_count: 0,
        })
        .select()
        .single();

      if (threadError) throw threadError;
      if (!threadData) throw new Error("No data returned from thread creation");

      // 2. Create Initial Post
      const { error: postError } = await supabase.from("forum_posts").insert({
        thread_id: threadData.id,
        author_id: user.id,
        content: content.trim(),
      });

      if (postError) throw postError;

      // Success! Redirect to the new thread
      onThreadCreated(threadData.id);
    } catch (err: any) {
      console.error("Error creating thread:", err);
      setError(err.message || "Error al crear el hilo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 14, mb: 10 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onCancel}
          sx={{ mb: 2, color: "text.secondary" }}
        >
          Cancelar
        </Button>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "Cinzel, serif",
            fontWeight: "bold",
            color: "secondary.main",
          }}
        >
          Nuevo Pergamino
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Inicia una nueva discusión en la Taberna.
        </Typography>
      </Box>

      {/* Form */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          backdropFilter: "blur(8px)",
          border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          borderRadius: 2,
        }}
      >
        {error && (
          <Typography color="error" sx={{ mb: 3 }}>
            {error}
          </Typography>
        )}

        <TextField
          label="Título del Hilo"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
          sx={{ mb: 4 }}
          inputProps={{ maxLength: 100 }}
          placeholder="Ej: Busco grupo para campaña de Curse of Strahd"
        />

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="caption"
            sx={{ mb: 1, display: "block", color: "text.secondary" }}
          >
            Contenido
          </Typography>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Escribe aquí tu mensaje... (Soporta Markdown, Dados, Spoilers)"
            onImageUpload={(file) => uploadImage(file, user.id)}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={loading || !title.trim() || !content.trim()}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
          >
            Publicar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateThread;
