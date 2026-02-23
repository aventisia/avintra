import { useHotkeys } from "react-hotkeys-hook";
import { useFlowOperations } from "./useFlowOperations";

import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";

/**
 * Global keyboard shortcuts for Copy/Cut/Paste.
 */
export const useCopyPasteShortcuts = () => {
  const { copyNodes, cutNodes, pasteNodes } = useFlowOperations();
  const { selectedNode } = useContextMenuActionsStore();

  const options = {
    enableOnFormTags: false,
    preventDefault: true,
  };

  //  Copy
  useHotkeys(["meta+c", "ctrl+c"], copyNodes, options, [copyNodes]);

  //  Cut
  useHotkeys(["meta+x", "ctrl+x"], cutNodes, options, [cutNodes]);

  //  Normal Paste (below / branch-after)
  useHotkeys(
    ["meta+v", "ctrl+v"],
    () => {
      if (!selectedNode) return;

      // const selectedNode = selectedNodes[0];
      const isBranchNode = selectedNode.type === "branchNode1";

      pasteNodes(selectedNode.id, isBranchNode ? "branch-after" : "below");
    },
    options,
    [pasteNodes, selectedNode],
  );

  //  Special Paste (above / branch-before)
  useHotkeys(
    ["meta+shift+v", "ctrl+shift+v"],
    () => {
      console.log("Selected Nodes", selectedNode);
      if (!selectedNode) return;

      // const firstNode = selectedNodes[0];
      const isBranchNode = selectedNode.type === "branchNode1";

      pasteNodes(selectedNode.id, isBranchNode ? "branch-before" : "above");
    },
    options,
    [pasteNodes, selectedNode],
  );
};
