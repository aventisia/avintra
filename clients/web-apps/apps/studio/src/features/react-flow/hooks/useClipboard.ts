import { Edge, Node } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";

// Key to store clipboard data in localStorage
const CLIPBOARD_KEY = "react-flow-clipboard";

export interface FlowClipboard {
  nodes: Node[];
  edges: Edge[];
  operation: "cut" | "copy";
  flowId?: string;
}
// Custom hook to manage clipboard data
export const useClipboard = () => {
  const [clipboardState, setClipboardState] = useState<FlowClipboard | null>(null);

  // Sync with local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CLIPBOARD_KEY);
    if (stored) {
      try {
        setClipboardState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse clipboard data", e);
      }
    }
  }, []);

  const getClipboard = useCallback((): FlowClipboard => {
    const stored = localStorage.getItem(CLIPBOARD_KEY);
    return stored ? JSON.parse(stored) : { nodes: [], edges: [], operation: "copy" };
  }, []);

  // Store clipboard data in localStorage
  const setClipboard = useCallback((data: FlowClipboard) => {
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(data));
    setClipboardState(data);
  }, []);

  // Clear clipboard data from localStorage
  const clearClipboard = useCallback(() => {
    localStorage.removeItem(CLIPBOARD_KEY);
    setClipboardState(null);
  }, []);

  return {
    getClipboard,
    setClipboard,
    clearClipboard,
    hasClipboardData: !!clipboardState?.nodes?.length,
  };
};
