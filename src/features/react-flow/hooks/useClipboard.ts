import { Node } from "@xyflow/react";
import { useCallback } from "react";

// Key to store clipboard data in localStorage
const CLIPBOARD_KEY = "flow-clipboard";

// Define the structure of clipboard data
type Clipboard = {
  node: Node | null;
  operation: "cut" | "copy" | null;
};

// Custom hook to manage clipboard operations
export const useClipboard = () => {
  // Retrieve clipboard data from localStorage
  const getClipboard = useCallback((): Clipboard => {
    const data = localStorage.getItem(CLIPBOARD_KEY);
    return data ? JSON.parse(data) : { node: null, operation: null };
  }, []);

  // Store clipboard data in localStorage
  const setClipboard = useCallback((clipboard: Clipboard) => {
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(clipboard));
  }, []);

  // Clear clipboard data from localStorage
  const clearClipboard = useCallback(() => {
    localStorage.removeItem(CLIPBOARD_KEY);
  }, []);

  // Return clipboard management functions
  return {
    getClipboard,
    setClipboard,
    clearClipboard,
  };
};
