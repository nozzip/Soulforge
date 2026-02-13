import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import DiceComponent from "./DiceComponent";

export default Node.create({
  name: "dice",

  group: "inline",

  inline: true,

  atom: true,

  addAttributes() {
    return {
      formula: {
        default: "1d20",
      },
      result: {
        default: 0,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "dice-roll",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["dice-roll", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiceComponent);
  },

  addCommands() {
    return {
      setDice:
        (formula = "1d20") =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              formula,
              result: 0, // 0 triggers the roll in the component
            },
          });
        },
    };
  },

  // Optional: functionality to type "/roll" -> converts to dice
  // addInputRules() { ... }
});
