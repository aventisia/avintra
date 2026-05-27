import { Node } from "@xyflow/react";
import { useEffect, useState } from "react";

/**
 * Tracks the chronological order in which a user selects nodes.
 * React Flow mutates the nodes array order when a user right-clicks a node (to handle z-index).
 * This hook uses a stable string hash to prevent that mutation from wiping the selection sequence.
 */
export const useOrderedSelection = (nodes: Node[]) => {
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  // Create a stable string hash of selected IDs sorted alphabetically.
  // This completely ignores the physical array order, preventing the
  // right-click array scramble bug from triggering a sequence reset.
  const selectedSetHash = nodes
    .filter((n) => n.selected)
    .map((n) => n.id)
    .sort()
    .join(",");

  useEffect(() => {
    setOrderedIds((prev) => {
      const currentlySelected = nodes
        .filter((n) => n.selected)
        .map((n) => n.id);

      // Keep existing ordered IDs that are still selected
      const maintained = prev.filter((id) => currentlySelected.includes(id));

      // Append newly selected IDs to the end of the sequence
      const added = currentlySelected.filter((id) => !prev.includes(id));

      // Prevent unnecessary state updates if nothing actually changed
      if (maintained.length === prev.length && added.length === 0) return prev;

      return [...maintained, ...added];
    });
    // We intentionally only depend on the stable hash to avoid infinite re-renders
  }, [selectedSetHash]);

  return orderedIds;
};
