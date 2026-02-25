import { useEffect } from "react";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

/**
 * Attaches global keyboard listeners for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z).
 */
export const useUndoRedoShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      // Determine OS to support both Command and Control keys
      const ctrlOrCmd = event.ctrlKey;

      // Guard: Prevent intercepting shortcuts while typing in inputs or textareas
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

        const { undo, redo, historyStep, historyMax } =
          useReactFlowExtStore.getState();

        if (event.shiftKey) {
          if (historyStep < historyMax) {
            await redo();
          }
        } else {
          if (historyStep > 0) {
            await undo();
          }
        }
      }

      // Standard Windows Redo logic
      if (ctrlOrCmd && event.key.toLowerCase() === "y") {
        event.preventDefault();
        const { redo, historyStep, historyMax } =
          useReactFlowExtStore.getState();
        if (historyStep < historyMax) {
          await redo();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
};
