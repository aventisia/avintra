import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useShallow } from "zustand/react/shallow";

/**
 * Hook to extract Undo/Redo actions and their availability states for UI components.
 * Automatically triggers re-renders when the history stack indexes change.
 */
export const useUndoRedoControls = () => {
  const { undo, redo, historyStep, historyMax } = useReactFlowExtStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      historyStep: state.historyStep,
      historyMax: state.historyMax,
    })),
  );

  return {
    /** Function to asynchronously revert the flow to the previous state */
    undo,

    /** Function to asynchronously advance the flow to the next state */
    redo,

    /** Flag to indicate if there are past states available to undo */
    canUndo: historyStep > 0,

    /** Flag to indicate if there are future states available to redo */
    canRedo: historyStep < historyMax,
  };
};
