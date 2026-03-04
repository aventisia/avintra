import { useEffect } from "react";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { isHistoryEqual, HistoryState } from "@/utils/history-equality-checker";

/**
 * Global hook that monitors the canvas.
 * Manages the Undo/Redo RAM stack and the isSavePending flag dynamically.
 */
export const useHistoryTracker = () => {
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const unsubscribe = useReactFlowExtStore.subscribe(() => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        // Retrieve the freshest state after the 300ms debounce completes
        const state = useReactFlowExtStore.getState();

        // 1. UNDO/REDO RACE CONDITION GUARD
        // Wait until all cascading React Flow updates settle before clearing the flag.
        if (state.isRestoringHistory) {
          useReactFlowExtStore.setState({ isRestoringHistory: false });
          return;
        }

        const currentState: HistoryState = {
          nodes: state.nodes,
          edges: state.edges,
          flowVariablesObject: state.flowVariablesObject ?? [],
        };

        // 2. DYNAMIC SAVE TRACKING
        if (state.savedSnapshot) {
          const isPending = !isHistoryEqual(state.savedSnapshot, currentState);
          if (state.isSavePending !== isPending) {
            useReactFlowExtStore.setState({ isSavePending: isPending });
          }
        }

        // 3. HISTORY STACK TRACKING
        const pastStack = state.past;
        const lastHistoryState =
          pastStack.length > 0 ? pastStack[pastStack.length - 1] : null;

        if (
          lastHistoryState &&
          !isHistoryEqual(lastHistoryState, currentState)
        ) {
          // Ignore state if the canvas is completely blank (before API data loads)
          if (currentState.nodes.length === 0) return;
          state.commitSnapshot(currentState);
        }
      }, 300);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);
};
