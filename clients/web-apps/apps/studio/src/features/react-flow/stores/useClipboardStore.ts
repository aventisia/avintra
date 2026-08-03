import { Edge, Node } from "@xyflow/react";
import { create } from "zustand";

export interface FlowClipboard {
  nodes: Node[];
  edges: Edge[];
  operation: "cut" | "copy";
  originalEntryId: string;
  originalExitId: string;
}

interface ClipboardState {
  clipboard: FlowClipboard | null;
  setClipboard: (data: FlowClipboard) => void;
  clearClipboard: () => void;
}

// Exported so other files can reference the exact key if needed
export const CLIPBOARD_KEY = "react-flow-clipboard";

// Safely hydrate the clipboard from LocalStorage on initial load
const getInitialClipboard = (): FlowClipboard | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CLIPBOARD_KEY);
  return stored ? JSON.parse(stored) : null;
};

/**
 * Global Zustand store for managing cross-component clipboard state.
 * Automatically syncs with localStorage so copied data persists across page reloads.
 */
export const useClipboardStore = create<ClipboardState>((set) => ({
  clipboard: getInitialClipboard(),
  setClipboard: (data) => {
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(data));
    set({ clipboard: data });
  },
  clearClipboard: () => {
    localStorage.removeItem(CLIPBOARD_KEY);
    set({ clipboard: null });
  },
}));

// Cross-tab Synchronization
// This instantly updates Zustand in Tab B when Tab A copies something to localStorage
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CLIPBOARD_KEY) {
      const newValue = e.newValue ? JSON.parse(e.newValue) : null;
      useClipboardStore.setState({ clipboard: newValue });
    }
  });
}
