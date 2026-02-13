import React, { useState, useEffect } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { NodeViewProps } from "@tiptap/core";
import { Resizable } from "re-resizable";
import { Box, IconButton, Paper } from "@mui/material";
import {
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
} from "@mui/icons-material";

// ...

interface ResizableImageComponentProps extends NodeViewProps {
  node: {
    attrs: {
      src: string;
      alt?: string;
      title?: string;
      width?: string | number;
      height?: string | number;
      align?: "left" | "center" | "right";
    };
  } & NodeViewProps["node"]; // Ensure node compatibility
  updateAttributes: (attrs: Record<string, any>) => void;
  selected: boolean;
}

const ResizableImageComponent: React.FC<ResizableImageComponentProps> = (
  props,
) => {
  const { src, alt, title, width, height, align } = props.node.attrs;
  const [size, setSize] = useState({
    width: width || "100%",
    height: height || "auto",
  });
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  // Sync state with props if they change externally
  useEffect(() => {
    setSize({
      width: width || "100%",
      height: height || "auto",
    });
  }, [width, height]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    setAspectRatio(ratio);

    // If no explicit size is set, or if it's set to "100%", snap to natural size
    // so that floating works correctly (wraps text) instead of taking full width.
    if (!width || width === "100%") {
      const newWidth = img.naturalWidth;
      const newHeight = img.naturalHeight;

      // Cap at editor width if possible - simplified max 800px or similar to avoid overflow
      // For now just use natural.

      setSize({
        width: newWidth,
        height: newHeight,
      });

      // We don't necessarily want to save this to attributes immediately unless user resizes,
      // but for consistent rendering we probably should, OR just rely on state.
      // Let's update attributes so it persists.
      if (!width) {
        props.updateAttributes({
          width: newWidth,
          height: newHeight,
        });
      }
    }
  };

  const getStyle = () => {
    const baseStyle: React.CSSProperties = {
      maxWidth: "100%",
      position: "relative",
      display: "inline-block", // Default to avoid full width block
    };

    if (align === "left") {
      baseStyle.float = "left";
      baseStyle.marginRight = "1rem";
      baseStyle.marginBottom = "0.5rem";
    } else if (align === "right") {
      baseStyle.float = "right";
      baseStyle.marginLeft = "1rem";
      baseStyle.marginBottom = "0.5rem";
    } else {
      // Center (default)
      baseStyle.display = "flex";
      baseStyle.justifyContent = "center";
      baseStyle.margin = "0 auto";
    }
    return baseStyle;
  };

  return (
    <NodeViewWrapper style={getStyle()}>
      <Resizable
        size={{ width: size.width, height: size.height }}
        lockAspectRatio={aspectRatio || true}
        minWidth={50}
        minHeight={50}
        onResizeStop={(e, direction, ref, d) => {
          const newWidth = ref.style.width;
          const newHeight = ref.style.height;

          setSize({ width: newWidth, height: newHeight });

          props.updateAttributes({
            width: newWidth,
            height: newHeight,
          });
        }}
        enable={{
          top: false,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        }}
        handleStyles={{
          bottomRight: { bottom: 0, right: 0 },
        }}
        style={{
          border: props.selected
            ? "2px solid #d4af37"
            : "2px solid transparent",
          transition: "border-color 0.2s",
          position: "relative",
          margin: align === "center" ? "0 auto" : undefined,
          display: "inline-block",
          verticalAlign: "top",
        }}
        maxWidth="100%"
      >
        <img
          src={src}
          alt={alt}
          title={title}
          onLoad={onImageLoad}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "fill",
            display: "block",
          }}
        />
        {props.selected && (
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              top: 10, // Move inside
              right: 10, // Move to right
              zIndex: 20,
              display: "flex",
              gap: 0.5,
              p: 0.5,
              bgcolor: "rgba(0,0,0,0.8)",
              borderRadius: 1,
              whiteSpace: "nowrap",
            }}
          >
            <IconButton
              size="small"
              onClick={() => props.updateAttributes({ align: "left" })}
              sx={{ color: align === "left" ? "#d4af37" : "#fff" }}
            >
              <FormatAlignLeft fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => props.updateAttributes({ align: "center" })}
              sx={{ color: !align || align === "center" ? "#d4af37" : "#fff" }}
            >
              <FormatAlignCenter fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => props.updateAttributes({ align: "right" })}
              sx={{ color: align === "right" ? "#d4af37" : "#fff" }}
            >
              <FormatAlignRight fontSize="small" />
            </IconButton>
          </Paper>
        )}
      </Resizable>
    </NodeViewWrapper>
  );
};

export default ResizableImageComponent;
