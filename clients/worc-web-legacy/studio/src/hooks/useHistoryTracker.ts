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

    const unsubscribe = useReactFlowExtStore.subscribe(
      (state) => [state.nodes, state.edges],
      () => {
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

          const isDragging = state.nodes.some((n) => n.dragging);
          //Ignore dragging
          if (isDragging || state.nodes.length === 0) return;

          const currentState: HistoryState = {
            nodes: state.nodes,
            edges: state.edges,
            flowVariablesObject: state.flowVariablesObject ?? [],
          };

          const pastStack = state.past;
          const lastHistoryState =
            pastStack.length > 0 ? pastStack[pastStack.length - 1] : null;

          let isDifferentFromLastHistory = false;

          if (lastHistoryState) {
            if (
              state.nodes === lastHistoryState.nodes &&
              state.edges === lastHistoryState.edges &&
              state.flowVariablesObject === lastHistoryState.flowVariablesObject
            ) {
              isDifferentFromLastHistory = false;
            } else {
              isDifferentFromLastHistory = !isHistoryEqual(
                lastHistoryState,
                currentState,
              );
            }
          } else {
            isDifferentFromLastHistory = true;
          }

          if (state.savedSnapshot) {
            let isPending = false;

            if (state.savedSnapshot === lastHistoryState) {
              isPending = isDifferentFromLastHistory;
            } else {
              isPending = !isHistoryEqual(state.savedSnapshot, currentState);
            }

            if (state.isSavePending !== isPending) {
              useReactFlowExtStore.setState({ isSavePending: isPending });
            }
          }

          if (isDifferentFromLastHistory) {
            state.commitSnapshot(currentState);
          }
        }, 300);
      },
    );
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);
};
