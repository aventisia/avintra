import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { CheckIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { PROCESSING_STATES } from "@/features/execute-flow";
import { usePreventNavigation } from "@/hooks/usePreventExecutionNavigation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useSaveFlow } from "../../hooks/useSaveFlow";
import useUnsavedChanges from "../../hooks/useUnSavedChanges";

const SAVED_FEEDBACK_MS = 2500;
const SAVED_FADE_OUT_CLASS =
  "duration-300 animate-out fade-out-0 fill-mode-forwards [animation-delay:2200ms] motion-reduce:animate-none";

type SaveFlowStatus = "hidden" | "saving" | "unsaved" | "saved";

/**
 * Canvas save status beside the agent type in the header. Unsaved changes show with a Save
 * action; a finished save shows "Saved" briefly, then the status hides.
 */
export default function SaveFlow() {
  const { saveData, isSavePending } = useSaveFlow();
  const isSaving = useCurrentFlowStore((state) => state.isFlowSaving);

  // Uncommitted config-form edits count as unsaved changes too.
  const isFormDirty = useDynamicConfigPanelStore((state) => state.isFormDirty);
  const isDirty = isSavePending || isFormDirty;

  const [isSavedVisible, setIsSavedVisible] = useState(false);
  const wasSavingRef = useRef(isSaving);
  useEffect(() => {
    const hasFinishedSaving = wasSavingRef.current && !isSaving;
    wasSavingRef.current = isSaving;
    if (!hasFinishedSaving) return;
    setIsSavedVisible(true);
    const hideTimer = window.setTimeout(() => setIsSavedVisible(false), SAVED_FEEDBACK_MS);
    return () => window.clearTimeout(hideTimer);
  }, [isSaving]);

  // Get setExecutionState action from current flow store
  const { executionState } = useCurrentFlowStore(
    useShallow((state) => ({
      executionState: state.executionState,
      setExecutionState: state.setExecutionState,
    })),
  );

  // TODO: use useUnsavedChanges in prod until usePreventNavigation is tested and removed enabled property form both hooks
  useUnsavedChanges({
    enabled: import.meta.env.MODE == "production",
    isDirty: isSavePending || isFormDirty,
  });

  usePreventNavigation({
    enabled: import.meta.env.MODE !== "production",
    basePath: import.meta.env.VITE_STUDIO_PATH,
    isDirty: isSavePending || isFormDirty,
    isExecuting: PROCESSING_STATES.includes(executionState),
  });

  // Commit pending config-form edits before serializing the canvas to the
  // server. The flush always persists, including incomplete/invalid edits —
  // that mid-edit state is intentional and saved for later completion.
  const handleSave = useCallback(async () => {
    await useDynamicConfigPanelStore.getState().flushForm?.();
    await saveData();
  }, [saveData]);

  useHotkeys(
    "mod+s",
    (e) => {
      e.preventDefault();
      handleSave();
    },
    { preventDefault: true, enableOnFormTags: true },
    [handleSave],
  );

  const status: SaveFlowStatus = isSaving
    ? "saving"
    : isDirty
      ? "unsaved"
      : isSavedVisible
        ? "saved"
        : "hidden";

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span
        aria-live="polite"
        className={cn(
          "inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] leading-3 text-muted-foreground",
          status === "saved" && SAVED_FADE_OUT_CLASS,
        )}
      >
        {status !== "hidden" ? (
          <span aria-hidden="true" className="size-0.5 shrink-0 rounded-full bg-muted-foreground" />
        ) : null}
        {status === "saving" ? (
          <span className="inline-flex items-center gap-1">
            <LoadingSpinner className="size-2.5" />
            Saving…
          </span>
        ) : null}
        {status === "unsaved" ? (
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-warn" />
            Not saved
          </span>
        ) : null}
        {status === "saved" ? (
          <span className="inline-flex items-center gap-1">
            <CheckIcon
              aria-hidden="true"
              weight="bold"
              className="size-3 text-ok duration-200 animate-in fade-in-0 zoom-in-50 motion-reduce:animate-none"
            />
            Saved
          </span>
        ) : null}
      </span>
      {status === "unsaved" ? (
        <Button variant="link" className="text-[11px] leading-3" onClick={handleSave}>
          Save
        </Button>
      ) : null}
    </div>
  );
}
