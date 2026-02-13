export const suggestion = {
  items: ({ query }: { query: string }) => {
    return ["Nozzip", "Aikoz", "DungeonMaster"]
      .filter((item) => item.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5);
  },
  render: () => {
    return {
      onStart: () => {},
      onUpdate: () => {},
      onExit: () => {},
      onKeyDown: () => false,
    };
  },
};
