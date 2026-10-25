import { type KeyboardEvent, useMemo, useState } from "react";

import { FolderSummary } from "../types/folder-summary.type";
import { MoveTarget } from "../types/move-target.type";
import { buildMoveTargets, getMoveTargetKey } from "../utils/move-targets.util";

type UseMoveTargetPickerOptions = {
  summaries: FolderSummary[];
  currentFolderId: string | null;
  onSubmit: (target: MoveTarget) => void;
};

/**
 * Search, highlight and selection for the Move agent destinations. Typing selects the first
 * match, arrows move the selection, hovering only highlights, and Enter submits the highlight.
 */
export const useMoveTargetPicker = ({
  summaries,
  currentFolderId,
  onSubmit,
}: UseMoveTargetPickerOptions) => {
  const [query, setQueryState] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const targets = useMemo(
    () => buildMoveTargets({ summaries, query, currentFolderId }),
    [summaries, query, currentFolderId],
  );

  const selectedTarget = targets.find((target) => getMoveTargetKey(target) === selectedKey) ?? null;

  const choose = (index: number) => {
    setHighlightIndex(index);
    setSelectedKey(getMoveTargetKey(targets[index]));
  };

  const setQuery = (nextQuery: string) => {
    const [firstTarget] = buildMoveTargets({ summaries, query: nextQuery, currentFolderId });
    setQueryState(nextQuery);
    setHighlightIndex(firstTarget && nextQuery.trim() ? 0 : -1);
    setSelectedKey(firstTarget && nextQuery.trim() ? getMoveTargetKey(firstTarget) : null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (targets.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      const startIndex = highlightIndex < 0 && step < 0 ? 0 : highlightIndex;
      choose((startIndex + step + targets.length) % targets.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const highlightedTarget = targets[highlightIndex];
      if (highlightedTarget) onSubmit(highlightedTarget);
    }
  };

  return {
    query,
    setQuery,
    targets,
    highlightIndex,
    setHighlightIndex,
    selectedTarget,
    choose,
    handleKeyDown,
  };
};
