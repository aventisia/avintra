import { useEffect } from "react";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { HistoryDB } from "@/utils/idb-history-manager";
import { isHistoryEqual, HistoryState } from "@/utils/history-equality-checker";

/**
 * Global hook that listens to Zustand store changes and asynchronously saves snapshots to IndexedDB.
 * @param {string} versionId - The ID of the current flow version from the URL
 */
export const useIDBHistoryTracker = (versionId: string) => {
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let lastSavedState: HistoryState | null = null;

    // 1. Sync the active session ID to the store for Undo/Redo actions to read
    useReactFlowExtStore.setState({ versionId });

    // 2. Initialization: Clear only THIS session's DB and save the starting blank canvas
    HistoryDB.clearSession(versionId).then(() => {
      const initialState = useReactFlowExtStore.getState();
      lastSavedState = {
        nodes: initialState.nodes,
        edges: initialState.edges,
        flowVariablesObject: initialState.flowVariablesObject,
      };
      HistoryDB.saveSnapshot(versionId, 0, lastSavedState);
      useReactFlowExtStore.setState({ historyStep: 0, historyMax: 0 });
    });

    const unsubscribe = useReactFlowExtStore.subscribe((state) => {
      if (state.isRestoringHistory) {
        lastSavedState = {
          nodes: state.nodes,
          edges: state.edges,
          flowVariablesObject: state.flowVariablesObject,
        };
        useReactFlowExtStore.setState({ isRestoringHistory: false });
        return;
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const currentState: HistoryState = {
          nodes: state.nodes,
          edges: state.edges,
          flowVariablesObject: state.flowVariablesObject,
        };

        if (lastSavedState && !isHistoryEqual(lastSavedState, currentState)) {
          // Domain Logic Guard: Handle API Hydration
          if (
            lastSavedState.nodes.length === 0 &&
            currentState.nodes.length > 0
          ) {
            HistoryDB.saveSnapshot(versionId, 0, currentState);
            lastSavedState = currentState;
            return;
          }

          // Standard User Action
          const newStep = state.historyStep + 1;

          HistoryDB.saveSnapshot(versionId, newStep, currentState);

          useReactFlowExtStore.setState({
            historyStep: newStep,
            historyMax: newStep,
          });

          lastSavedState = currentState;
        }
      }, 300);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [versionId]); // Important: Re-run hook if the URL parameters change
};
