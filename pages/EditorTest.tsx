import React, { useState } from "react";
import Layout from "../components/Layout";
import RichTextEditor from "../components/Editor/RichTextEditor";
import { Box, Typography } from "@mui/material";
import { ViewState } from "../types";
import { uploadImage } from "../utils/imageHandler";

const EditorTest = () => {
  const [content, setContent] = useState(
    "<p>Welcome to the <strong>SoulForge</strong> editor!</p>",
  );

  const handleImageUpload = async (file: File) => {
    // For testing, we use a dummy user ID 'test-user'
    // In real app, this should come from auth context
    const url = await uploadImage(file, "test-user");
    return url || "";
  };

  return (
    <Layout
      setView={() => {}}
      currentView={ViewState.EDITOR_TEST}
      onSearch={() => {}}
      onProductSelect={() => {}}
      user={null}
      isAdmin={true}
      onLogout={async () => {}}
      isWarhammer={false}
      onToggleTheme={() => {}}
      products={[]} // Add products prop
    >
      <Box sx={{ p: 4, maxWidth: "800px", margin: "0 auto" }}>
        <Typography
          variant="h4"
          sx={{ color: "#d4af37", mb: 2, fontFamily: "Cinzel, serif" }}
        >
          Editor Test
        </Typography>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Start typing your adventure..."
          onImageUpload={handleImageUpload}
        />

        <Box
          sx={{
            mt: 4,
            p: 2,
            border: "1px dashed #666",
            borderRadius: "4px",
            color: "#aaa",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            HTML Output:
          </Typography>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
            {content}
          </pre>
        </Box>
      </Box>
    </Layout>
  );
};

export default EditorTest;
