import React from "react";
import { Box, alpha, useTheme } from "@mui/material";
import parse, { Element } from "html-react-parser";

interface RichTextDisplayProps {
  content: string;
  sx?: any;
}

const RichTextDisplay = ({ content, sx }: RichTextDisplayProps) => {
  const theme = useTheme();

  const parsedContent = parse(content || "", {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        if (domNode.name === "img") {
          let {
            src,
            alt,
            width,
            height,
            style: styleAttr,
            "data-align": dataAlign,
          } = domNode.attribs;

          if (styleAttr && (!width || !height)) {
            const widthMatch = styleAttr.match(/width:\s*([^;]+)/);
            const heightMatch = styleAttr.match(/height:\s*([^;]+)/);
            if (widthMatch && !width) width = widthMatch[1];
            if (heightMatch && !height) height = heightMatch[1];
          }

          if (width && !isNaN(Number(width))) width = `${width}px`;
          if (height && !isNaN(Number(height))) height = `${height}px`;

          const style: React.CSSProperties = {
            maxWidth: "100%",
            borderRadius: "4px",
            objectFit: "contain",
            display: "block",
          };

          if (dataAlign === "left") {
            style.float = "left";
            style.marginRight = "1rem";
            style.marginBottom = "0.5rem";
            style.display = "inline-block";
            style.clear = "both";
          } else if (dataAlign === "right") {
            style.float = "right";
            style.marginLeft = "1rem";
            style.marginBottom = "0.5rem";
            style.display = "inline-block";
            style.clear = "both";
          } else {
            style.margin = "0 auto";
            style.display = "block";
          }

          if (width) style.width = width;
          if (height) style.height = height;

          return <img src={src} alt={alt} style={style} />;
        }
      }
      return domNode;
    },
  });

  return (
    <Box
      sx={{
        "& p": { margin: "0 0 1em 0" },
        "& blockquote": {
          borderLeft: `3px solid ${theme.palette.secondary.main}`,
          paddingLeft: "1rem",
          fontStyle: "italic",
          color: "text.secondary",
          margin: "1em 0",
        },
        "& .spoiler": {
          backgroundColor: "#000",
          color: "#000",
          cursor: "pointer",
          borderRadius: "4px",
          padding: "0 4px",
          transition: "color 0.2s",
          "&:hover": {
            color: "#fff",
          },
        },
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          fontFamily: "Cinzel, serif",
          color: "secondary.main",
          margin: "1.5em 0 0.5em 0",
        },
        "& ul, & ol": {
          paddingLeft: "1.5rem",
          margin: "1em 0",
        },
        "& li": {
          marginBottom: "0.5em",
        },
        ...sx,
      }}
    >
      {parsedContent}
    </Box>
  );
};

export default RichTextDisplay;
