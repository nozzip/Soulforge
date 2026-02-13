import { NodeViewWrapper } from "@tiptap/react";
import { Box, Typography, IconButton } from "@mui/material";
import { Casino } from "@mui/icons-material";
import React, { useState, useEffect } from "react";

// Props are injected by Tiptap
interface DiceComponentProps {
  // Tiptap props
  node?: {
    attrs: {
      formula: string;
      result: number;
    };
  };
  updateAttributes?: (attrs: { result: number }) => void;
  // Standalone props
  formula?: string;
  result?: number;
}

const DiceComponent = (props: DiceComponentProps) => {
  const formula = props.node?.attrs.formula || props.formula || "1d20";
  const result = props.node?.attrs.result ?? props.result ?? 0;

  const [displayResult, setDisplayResult] = useState(result || 0);
  const [isRolling, setIsRolling] = useState(false);

  // If result is 0 (new roll), trigger a roll animation
  useEffect(() => {
    if (result === 0) {
      roll();
    }
  }, []);

  const roll = () => {
    setIsRolling(true);
    let duration = 0;
    const interval = setInterval(() => {
      setDisplayResult(Math.floor(Math.random() * 20) + 1);
      duration += 50;
      if (duration > 500) {
        clearInterval(interval);
        const newResult = Math.floor(Math.random() * 20) + 1;
        setDisplayResult(newResult);
        if (props.updateAttributes) {
          props.updateAttributes({ result: newResult });
        }
        setIsRolling(false);
      }
    }, 50);
  };

  const content = (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        border: "1px solid #d4af37",
        borderRadius: "16px",
        padding: "2px 8px",
        color: "#d4af37",
        gap: 0.5,
        cursor: "default",
        userSelect: "none",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        transition: "transform 0.2s",
        "&:hover": {
          borderColor: "#fff",
        },
      }}
    >
      <Casino sx={{ fontSize: 16 }} />
      <Typography
        variant="caption"
        sx={{ fontWeight: "bold", fontFamily: "monospace" }}
      >
        {formula}:
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: "bold",
          color: result === 20 ? "#4caf50" : result === 1 ? "#f44336" : "#fff",
          minWidth: "20px",
          textAlign: "center",
        }}
      >
        {displayResult}
      </Typography>
    </Box>
  );

  if (props.node) {
    return (
      <NodeViewWrapper
        className="dice-roll-component"
        style={{ display: "inline-block", margin: "0 4px" }}
      >
        {content}
      </NodeViewWrapper>
    );
  }

  return (
    <span
      style={{
        display: "inline-block",
        margin: "0 4px",
        verticalAlign: "middle",
      }}
    >
      {content}
    </span>
  );
};

export default DiceComponent;
