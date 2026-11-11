import { type KeyboardEvent, useState } from "react";

import type { AccessMode } from "../../resource-access-shared/types/access-mode.type";
import type { ResourceFlowDraft } from "./useResourceFlowDraft.hook";

/**
 * Tracks the open/restricted mode choice and the stashed allow-list around it.
 */
export const useFlowAccessMode = (draft: ResourceFlowDraft) => {
  const [modeIntent, setModeIntent] = useState<AccessMode | null>(null);
  const [stashedIds, setStashedIds] = useState<string[]>([]);

  // IMPORTANT NOTE: the dialog must start restricted so an untouched save can never leave a resource open to every agent.
  const mode: AccessMode = modeIntent ?? "restricted";
  const canSave =
    (draft.isDirty || (draft.wasRestrictedEmpty && mode === "open")) &&
    !(mode === "restricted" && draft.isOpenAccess) &&
    !draft.isSaving;

  const chooseMode = (next: AccessMode) => {
    if (next === mode) return;
    if (next === "open") {
      setStashedIds(draft.selectedIds);
      draft.replace([]);
    } else if (stashedIds.length > 0) {
      draft.replace(stashedIds);
    }
    setModeIntent(next);
  };

  const handleModeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next: AccessMode = mode === "open" ? "restricted" : "open";
    chooseMode(next);
    event.currentTarget.querySelector<HTMLElement>(`[data-mode="${next}"]`)?.focus();
  };

  return { mode, chooseMode, canSave, handleModeKeyDown };
};
