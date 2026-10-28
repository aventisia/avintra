import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { PROCESSING_STATES } from "@/features/execute-flow";
import { usePreventNavigation } from "@/hooks/usePreventExecutionNavigation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useSaveFlow } from "../../hooks/useSaveFlow";
import useUnsavedChanges from "../../hooks/useUnSavedChanges";

export default function SaveFlow() {
  const { isPending, saveData, isSavePending } = useSaveFlow();

  // Uncommitted config-form edits count as unsaved changes too.
  const isFormDirty = useDynamicConfigPanelStore((state) => state.isFormDirty);
  const isDirty = isSavePending || isFormDirty;

  const [savedAt, setSavedAt] = useState<Date>();
  const wasPendingRef = useRef(isPending);
  useEffect(() => {
    if (wasPendingRef.current && !isPending) setSavedAt(new Date());
    wasPendingRef.current = isPending;
  }, [isPending]);

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

  const saveState = isPending
    ? "Saving…"
    : isDirty
      ? "Not saved"
      : savedAt
        ? `Saved ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`
        : "Saved";

  return (
    <div className="flex items-center gap-1">
      <span
        aria-live="polite"
        className={cn(
          "whitespace-nowrap font-mono text-[12px] text-muted-foreground",
          !isPending && isDirty && "text-bad",
        )}
      >
        {saveState}
      </span>
      <Button disabled={!isDirty} variant="ghost" size="sm" onClick={handleSave}>
        Save
      </Button>
    </div>
  );
}
