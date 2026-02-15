import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  alpha,
  useTheme,
} from "@mui/material";
import RichTextEditor from "@/components/Editor/RichTextEditor";

interface NewCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (
    name: string,
    description: string,
    sortOrder: number,
  ) => Promise<void>;
}

export const NewCategoryDialog: React.FC<NewCategoryDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(1);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onCreate(name, description, sortOrder);
    // Reset form
    setName("");
    setDescription("");
    setSortOrder(1);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(10px)",
          border: `1px solid ${theme.palette.secondary.main}`,
          minWidth: 400,
        },
      }}
    >
      <DialogTitle
        sx={{ fontFamily: "Cinzel, serif", color: "secondary.main" }}
      >
        Nueva Categoría
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nombre"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            color="secondary"
            sx={{ mb: 1, display: "block" }}
          >
            Descripción
          </Typography>
          <RichTextEditor
            content={description}
            onChange={setDescription}
            placeholder="Describe esta categoría..."
          />
        </Box>
        <TextField
          margin="dense"
          label="Orden (Sort Order)"
          type="number"
          fullWidth
          variant="outlined"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Typography
          component="p"
          variant="caption"
          sx={{ mr: "auto", ml: 2, color: "text.secondary" }}
        >
          * Icon auto-assigned based on name keywords
        </Typography>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="secondary" variant="contained">
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
};
