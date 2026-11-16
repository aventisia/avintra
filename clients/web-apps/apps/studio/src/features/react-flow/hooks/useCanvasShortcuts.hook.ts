import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";

import { useClipboardStore } from "../stores/useClipboardStore";
import { isEditableContextActive } from "../utils/keyboard-shortcut.util";
import { useFlowOperations } from "./useFlowOperations";

/**
 * Global canvas keyboard shortcuts: Copy/Cut/Paste and enable/disable (Ctrl+D).
 */
export const useCanvasShortcuts = () => {
  const { copyNodes, cutNodes, pasteNodes, toggleDisableSelected, nodes } = useFlowOperations();
  const { selectedNode } = useContextMenuActionsStore(
    useShallow((state) => ({ selectedNode: state.selectedNode })),
  );

  const hasNodeTargets = Boolean(selectedNode) || nodes.some((node) => node.selected);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const ctrlOrCmd = event.ctrlKey || event.metaKey;
      if (!ctrlOrCmd) return;

      const key = event.key.toLowerCase();
      if (!["c", "x", "v", "d"].includes(key)) return;
      if (isEditableContextActive()) return;

      if (key === "d") {
        if (event.shiftKey) return;
        event.preventDefault();
        if (!event.repeat) toggleDisableSelected();
        return;
      }

      if (key === "c" || key === "x") {
        if (!hasNodeTargets) return;

        event.preventDefault();
        if (key === "c") {
          copyNodes();
        } else {
          cutNodes();
        }
        return;
      }

      const clipboard = useClipboardStore.getState().clipboard;
      if (!selectedNode || !clipboard || clipboard.nodes.length === 0) return;

      event.preventDefault();
      const isBranchNode = selectedNode.type === "branchNode1";

      if (event.shiftKey) {
        pasteNodes(selectedNode.id, isBranchNode ? "branch-above" : "before");
      } else {
        pasteNodes(selectedNode.id, isBranchNode ? "branch-below" : "after");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [copyNodes, cutNodes, pasteNodes, toggleDisableSelected, selectedNode, hasNodeTargets]);
};
