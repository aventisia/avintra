import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useContextMenuActionsStore } from "@/stores/context-menu-actions-store";

import { useClipboardStore } from "../stores/useClipboardStore";
import { useFlowOperations } from "./useFlowOperations";

/**
 * Global keyboard shortcuts for Copy/Cut/Paste.
 */
export const useCopyPasteShortcuts = () => {
  const { copyNodes, cutNodes, pasteNodes, nodes } = useFlowOperations();
  const { selectedNode } = useContextMenuActionsStore(
    useShallow((state) => ({ selectedNode: state.selectedNode })),
  );

  const hasNodeTargets = Boolean(selectedNode) || nodes.some((node) => node.selected);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const ctrlOrCmd = event.ctrlKey || event.metaKey;
      if (!ctrlOrCmd) return;

      const key = event.key.toLowerCase();
      if (!["c", "x", "v"].includes(key)) return;

      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement?.closest('[role="dialog"]')) return;
      if (activeElement && ["INPUT", "TEXTAREA"].includes(activeElement.tagName)) return;
      if (activeElement?.isContentEditable) return;

      const textSelection = window.getSelection();
      if (textSelection && !textSelection.isCollapsed) return;

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
  }, [copyNodes, cutNodes, pasteNodes, selectedNode, hasNodeTargets]);
};
