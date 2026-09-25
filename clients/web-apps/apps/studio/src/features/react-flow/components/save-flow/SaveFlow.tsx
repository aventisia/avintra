import { Button } from "@avplatform/ui/buttons";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
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

  return (
    <Button
      disabled={!isSavePending && !isFormDirty}
      size={"xs"}
      className="mr-2.5 min-w-16 text-xs"
      onClick={handleSave}
    >
      {isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : "Save"}
    </Button>
  );
}
