import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import Image from "@tiptap/extension-image"; // Replaced by ResizableImage
import { ResizableImage } from "./extensions/ResizableImageExtension";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Mention from "@tiptap/extension-mention";
import { Spoiler } from "./extensions/SpoilerExtension";
import { Box, Paper, GlobalStyles } from "@mui/material";
import MenuBar from "./MenuBar";
import { suggestion } from "./extensions/suggestion"; // We'll create this later

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

const RichTextEditor = ({
  content = "",
  onChange,
  editable = true,
  placeholder = "Escribe algo épico...",
  onImageUpload,
}: RichTextEditorProps) => {
  const handleImageUpload = async () => {
    if (!onImageUpload) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const url = await onImageUpload(file);
        if (url && editor) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }
    };
    input.click();
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      ResizableImage, // Replaces Image
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
      Placeholder.configure({
        placeholder,
      }),
      Spoiler,
      // We'll enable Mention when we have the suggestion logic ready
      // Mention.configure({
      //   HTMLAttributes: {
      //     class: 'mention',
      //   },
      //   suggestion,
      // }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert focus:outline-none min-h-[150px] p-4",
      },
      handleDrop: (view, event, slice, moved) => {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files.length > 0
        ) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/") && onImageUpload) {
            event.preventDefault();
            onImageUpload(file).then((url) => {
              if (url) {
                const { schema } = view.state;
                const coordinates = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });
                if (coordinates) {
                  const node = schema.nodes.image.create({ src: url });
                  const transaction = view.state.tr.insert(
                    coordinates.pos,
                    node,
                  );
                  view.dispatch(transaction);
                }
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        if (
          event.clipboardData &&
          event.clipboardData.files &&
          event.clipboardData.files.length > 0
        ) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith("image/") && onImageUpload) {
            event.preventDefault();
            onImageUpload(file).then((url) => {
              if (url) {
                editor?.chain().focus().setImage({ src: url }).run();
              }
            });
            return true;
          }
        }
        return false;
      },
    },
  });

  // Sync content updates from parent (e.g. clearing after submit)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <Paper
      elevation={3}
      sx={{
        overflow: "hidden",
        borderRadius: "8px",
        border: "1px solid rgba(212, 175, 55, 0.5)",
        backgroundColor: "rgba(20, 20, 20, 0.9)",
        color: "#e0e0e0",
        "& .ProseMirror": {
          minHeight: "150px",
          maxHeight: "500px", // Limit height
          overflowY: "auto", // Enable scrolling
          padding: "1rem",
          outline: "none",
          "& p.is-editor-empty:first-of-type::before": {
            color: "#666",
            content: "attr(data-placeholder)",
            float: "left",
            height: 0,
            pointerEvents: "none",
          },
          "& blockquote": {
            borderLeft: "3px solid #d4af37",
            paddingLeft: "1rem",
            fontStyle: "italic",
            color: "#aaa",
          },
          "& img": {
            maxWidth: "100%",
            borderRadius: "4px",
            border: "1px solid #444",
          },
        },
      }}
    >
      <GlobalStyles
        styles={{
          ".spoiler": {
            backgroundColor: "#000",
            color: "#000",
            cursor: "pointer",
            borderRadius: "4px",
            padding: "0 4px",
            transition: "color 0.2s",
          },
          ".spoiler:hover": {
            color: "#fff",
          },
        }}
      />
      {editable && (
        <MenuBar
          editor={editor}
          addImage={onImageUpload ? handleImageUpload : undefined}
        />
      )}
      <EditorContent editor={editor} />
    </Paper>
  );
};

export default RichTextEditor;
