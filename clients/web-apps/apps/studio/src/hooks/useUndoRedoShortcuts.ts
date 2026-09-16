import { FlowTypesEnum } from "@avplatform/ui/enums";
import { useEffect } from "react";

import { notifyChatAgentActionNotAllowed } from "@/features/react-flow/utils/chat-agent-action.util";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

/**
 * Attaches global keyboard listeners for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z).
 */
export const useUndoRedoShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Determine OS to support both Command and Control keys
      const ctrlOrCmd = event.ctrlKey || event.metaKey;

      //  Prevent intercepting shortcuts while typing in inputs or textarea
      const activeElement = document.activeElement as HTMLElement;
      const isInsideDialog = activeElement.closest('[role="dialog"]');
      if (
        (activeElement && ["INPUT", "TEXTAREA"].includes(activeElement.tagName)) ||
        isInsideDialog
      )
        return;
      if (activeElement && activeElement.isContentEditable) return;

      // Undo / Redo (Shift variant) logic
      if (ctrlOrCmd && event.key.toLowerCase() === "z") {
        event.preventDefault();
        const { undo, redo, past, future, flowType } = useReactFlowExtStore.getState();
        if (flowType === FlowTypesEnum.ChatAgent) {
          notifyChatAgentActionNotAllowed();
          return;
        }

        if (event.shiftKey) {
          if (future.length > 0) redo();
        } else {
          if (past.length > 1) undo();
        }
      }

      if (ctrlOrCmd && event.key.toLowerCase() === "y") {
        event.preventDefault();
        const { redo, future, flowType } = useReactFlowExtStore.getState();
        if (flowType === FlowTypesEnum.ChatAgent) {
          notifyChatAgentActionNotAllowed();
          return;
        }
        if (future.length > 0) redo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
};
