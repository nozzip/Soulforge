import { mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import ResizableImageComponent from "./ResizableImageComponent";

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
      align: {
        default: "center",
        renderHTML: (attributes) => {
          if (!attributes.align) return {};
          return { "data-align": attributes.align }; // Use data attribute for parsing
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
