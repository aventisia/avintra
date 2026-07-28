import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook to extract Undo/Redo actions and their availability states for UI components.
 */
export const useUndoRedoControls = () => {
  const { undo, redo, past, future } = useReactFlowExtStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      past: state.past,
      future: state.future,
    })),
  );

  return {
    undo,
    redo,
    canUndo: past.length > 1,
    canRedo: future.length > 0,
  };
};
