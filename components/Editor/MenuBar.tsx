import { Editor } from "@tiptap/react";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  StrikethroughS,
  Code,
  FormatClear,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  HorizontalRule,
  Undo,
  Redo,
  Title,
  Image as ImageIcon,
  Visibility,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
} from "@mui/icons-material";
import { IconButton, Tooltip, Divider, Box } from "@mui/material";

interface MenuBarProps {
  editor: Editor | null;
  addImage?: () => void;
}

const MenuBar = ({ editor, addImage }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  const ButtonStyle = {
    color: "#d4af37", // Gold color
    "&.is-active": {
      backgroundColor: "rgba(212, 175, 55, 0.2)",
      color: "#fff",
    },
    "&:hover": {
      backgroundColor: "rgba(212, 175, 55, 0.1)",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0.5,
        padding: "0.5rem",
        borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: "8px 8px 0 0",
      }}
    >
      <Tooltip title="Negrita">
        <span>
          <IconButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "is-active" : ""}
            sx={ButtonStyle}
            size="small"
          >
            <FormatBold fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Cursiva">
        <span>
          <IconButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "is-active" : ""}
            sx={ButtonStyle}
            size="small"
          >
            <FormatItalic fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Subrayado">
        <IconButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
          sx={ButtonStyle}
          size="small"
        >
          <FormatUnderlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Tachado">
        <span>
          <IconButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "is-active" : ""}
            sx={ButtonStyle}
            size="small"
          >
            <StrikethroughS fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Código">
        <span>
          <IconButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={editor.isActive("code") ? "is-active" : ""}
            sx={ButtonStyle}
            size="small"
          >
            <Code fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ borderColor: "rgba(212, 175, 55, 0.3)", mx: 0.5 }}
      />

      <Tooltip title="Título 1">
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
          sx={ButtonStyle}
          size="small"
        >
          <Title fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Título 2">
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
          sx={ButtonStyle}
          size="small"
        >
          <Title fontSize="small" sx={{ transform: "scale(0.8)" }} />
        </IconButton>
      </Tooltip>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ borderColor: "rgba(212, 175, 55, 0.3)", mx: 0.5 }}
      />

      <Tooltip title="Alinear a la Izquierda">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
          sx={ButtonStyle}
          size="small"
        >
          <FormatAlignLeft fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Centrar">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
          sx={ButtonStyle}
          size="small"
        >
          <FormatAlignCenter fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Alinear a la Derecha">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
          sx={ButtonStyle}
          size="small"
        >
          <FormatAlignRight fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Justificar">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={
            editor.isActive({ textAlign: "justify" }) ? "is-active" : ""
          }
          sx={ButtonStyle}
          size="small"
        >
          <FormatAlignJustify fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ borderColor: "rgba(212, 175, 55, 0.3)", mx: 0.5 }}
      />

      <Tooltip title="Lista con viñetas">
        <IconButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
          sx={ButtonStyle}
          size="small"
        >
          <FormatListBulleted fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Lista Numerada">
        <IconButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
          sx={ButtonStyle}
          size="small"
        >
          <FormatListNumbered fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ borderColor: "rgba(212, 175, 55, 0.3)", mx: 0.5 }}
      />

      <Tooltip title="Cita">
        <IconButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
          sx={ButtonStyle}
          size="small"
        >
          <FormatQuote fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Línea Horizontal">
        <IconButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          sx={ButtonStyle}
          size="small"
        >
          <HorizontalRule fontSize="small" />
        </IconButton>
      </Tooltip>

      {addImage && (
        <>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "rgba(212, 175, 55, 0.3)", mx: 0.5 }}
          />
          <Tooltip title="Subir Imagen">
            <IconButton onClick={addImage} sx={ButtonStyle} size="small">
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}


      <Tooltip title="Spoiler">
        <IconButton
          onClick={() => (editor.chain().focus() as any).toggleSpoiler().run()}
          className={editor.isActive("spoiler") ? "is-active" : ""}
          sx={ButtonStyle}
          size="small"
        >
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ borderColor: "rgba(212, 175, 55, 0.3)", mx: 0.5 }}
      />

      <Tooltip title="Deshacer">
        <span>
          <IconButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            sx={ButtonStyle}
            size="small"
          >
            <Undo fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Rehacer">
        <span>
          <IconButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            sx={ButtonStyle}
            size="small"
          >
            <Redo fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ borderColor: "rgba(212, 175, 55, 0.3)", mx: 0.5 }}
      />

      <Tooltip title="Limpiar Formato">
        <IconButton
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          sx={{ ...ButtonStyle, color: "#d32f2f" }} // Red for clear
          size="small"
        >
          <FormatClear fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default MenuBar;
