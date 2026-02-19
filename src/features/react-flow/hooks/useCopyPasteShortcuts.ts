import { useHotkeys } from "react-hotkeys-hook";
import { useFlowOperations } from "./useFlowOperations";

/**
 * Global keyboard shortcuts for Copy/Cut/Paste.
 * Uses react-hotkeys-hook for robust key handling.
 */
export const useCopyPasteShortcuts = () => {
  const { copyNodes, cutNodes, pasteNodes, nodes } = useFlowOperations();
  const options = {
    enableOnFormTags: false, // Don't trigger inside inputs
    preventDefault: true,
  };

  useHotkeys(["meta+c", "ctrl+c"], () => copyNodes(), options, [copyNodes]);

  useHotkeys(["meta+x", "ctrl+x"], () => cutNodes(), options, [cutNodes]);

  useHotkeys(
    ["meta+v", "ctrl+v"],
    () => {
      const selectedNodes = nodes.filter((node) => node.selected); // Only paste if a node is selected to determine position
      if (selectedNodes && selectedNodes.length > 0) {
        // Enforce specific default positions based on node type
        const isBranchNode = selectedNodes[0].type === "branchNode1";
        pasteNodes(
          selectedNodes[0].id,
          isBranchNode ? "branch-after" : "below",
        );
      }
    },
    options,
    [pasteNodes],
  );
};
