import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";

import { useHotkeys } from "react-hotkeys-hook";

import { useFlowOperations } from "./useFlowOperations";

/**
 * Global keyboard shortcuts for Copy/Cut/Paste.
 */
export const useCopyPasteShortcuts = () => {
  const { copyNodes, cutNodes, pasteNodes } = useFlowOperations();
  const { selectedNode } = useContextMenuActionsStore();
  //  Prevent intercepting shortcuts while typing in inputs or textarea
  const activeElement = document.activeElement as HTMLElement;

  const isInsideDialog = activeElement.closest('[role="dialog"]');

  const options = {
    enableOnFormTags: false,
    preventDefault: true,
    enabled: !isInsideDialog,
  };

  //  Copy
  useHotkeys(
    ["meta+c", "ctrl+c"],
    () => {
      if (
        activeElement &&
        ["INPUT", "TEXTAREA"].includes(activeElement.tagName)
      ) {
        return;
      }
      copyNodes();
    },
    options,
    [copyNodes],
  );

  //  Cut
  useHotkeys(
    ["meta+x", "ctrl+x"],
    () => {
      if (
        activeElement &&
        ["INPUT", "TEXTAREA"].includes(activeElement.tagName)
      ) {
        return;
      }
      cutNodes();
    },
    options,
    [cutNodes],
  );

  //  Normal Paste (below / branch-after)
  useHotkeys(
    ["meta+v", "ctrl+v"],
    () => {
      if (!selectedNode) return;
      if (
        activeElement &&
        ["INPUT", "TEXTAREA"].includes(activeElement.tagName)
      ) {
        return;
      }

      // const selectedNode = selectedNodes[0];
      const isBranchNode = selectedNode.type === "branchNode1";

      pasteNodes(selectedNode.id, isBranchNode ? "branch-below" : "after");
    },
    options,
    [pasteNodes, selectedNode],
  );

  //  Special Paste (above / branch-before)
  useHotkeys(
    ["meta+shift+v", "ctrl+shift+v"],
    () => {
      if (!selectedNode) return;
      if (
        (activeElement &&
          ["INPUT", "TEXTAREA"].includes(activeElement.tagName)) ||
        isInsideDialog
      ) {
        return;
      }

      // const firstNode = selectedNodes[0];
      const isBranchNode = selectedNode.type === "branchNode1";

      pasteNodes(selectedNode.id, isBranchNode ? "branch-above" : "before");
    },
    options,
    [pasteNodes, selectedNode],
  );
};
