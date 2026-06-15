/**
 * tool-call-coordinator.store.ts
 *
 * Zustand replacement for ToolCallCoordinatorContext.
 */
import { create } from "zustand";

// Types

export interface ToolCallEntry {
  /** Matches ToolCallMessagePartComponent props.toolCallId */
  toolCallId: string;
  toolName: string;

  /**
   * Calls cancelTool() inside useToolCallManager
   * triggers addResult + re-run
   */
  cancel: () => void;
}

interface ToolCallCoordinatorStore {
  pendingMap: Map<string, ToolCallEntry>;

  /** Register a pending tool call */
  register: (entry: ToolCallEntry) => void;

  /** Deregister when resolved */
  unregister: (toolCallId: string) => void;

  /** Cancel every still-pending tool call */
  cancelAll: () => void;

  /** Clear everything without calling cancel */
  reset: () => void;
}

// Store
export const useToolCallCoordinatorStore = create<ToolCallCoordinatorStore>(
  (set, get) => ({
    pendingMap: new Map(),

    register: (entry) => {
      set((state) => {
        const existing = state.pendingMap.get(entry.toolCallId);

        // Avoid unnecessary rerenders
        if (existing === entry) {
          return state;
        }

        const next = new Map(state.pendingMap);
        next.set(entry.toolCallId, entry);

        return {
          pendingMap: next,
        };
      });
    },

    unregister: (toolCallId) => {
      const { pendingMap } = get();

      if (!pendingMap.has(toolCallId)) {
        return;
      }

      const next = new Map(pendingMap);
      next.delete(toolCallId);

      set({
        pendingMap: next,
      });
    },

    cancelAll: () => {
      const { pendingMap } = get();

      // Execute cancel handlers
      pendingMap.forEach((entry) => {
        try {
          entry.cancel();
        } catch (error) {
          console.error(`Failed to cancel tool: ${entry.toolName}`, error);
        }
      });

      // Clear in single update
      set({
        pendingMap: new Map(),
      });
    },

    reset: () => {
      set({
        pendingMap: new Map(),
      });
    },
  }),
);

// Selectors
export const useHasPendingToolCalls = () =>
  useToolCallCoordinatorStore((state) => state.pendingMap.size > 0);
