import { useEffect } from "react";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

/**
 * Attaches global keyboard listeners for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z).
 */
export const useUndoRedoShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Determine OS to support both Command and Control keys
      const ctrlOrCmd = event.ctrlKey || event.metaKey;

      //  Prevent intercepting shortcuts while typing in inputs or textareas
      const activeElement = document.activeElement as HTMLElement;
      if (
        activeElement &&
        ["INPUT", "TEXTAREA"].includes(activeElement.tagName)
      )
        return;
      if (activeElement && activeElement.isContentEditable) return;

      // Undo / Redo (Shift variant) logic
      if (ctrlOrCmd && event.key.toLowerCase() === "z") {
        event.preventDefault();
        const { undo, redo, past, future } = useReactFlowExtStore.getState();

        if (event.shiftKey) {
          if (future.length > 0) redo();
        } else {
          if (past.length > 1) undo();
        }
      }

      if (ctrlOrCmd && event.key.toLowerCase() === "y") {
        event.preventDefault();
        const { redo, future } = useReactFlowExtStore.getState();
        if (future.length > 0) redo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
};
