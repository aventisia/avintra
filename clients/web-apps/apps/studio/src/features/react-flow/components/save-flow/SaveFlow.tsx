import { Button } from "@avplatform/ui/buttons";
import { Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { PROCESSING_STATES } from "@/features/execute-flow";
import { usePreventNavigation } from "@/hooks/usePreventExecutionNavigation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useSaveFlow } from "../../hooks/useSaveFlow";
import useUnsavedChanges from "../../hooks/useUnSavedChanges";

export default function SaveFlow() {
  const { isPending, saveData, isSavePending } = useSaveFlow();

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
    isDirty: isSavePending,
  });

  usePreventNavigation({
    enabled: import.meta.env.MODE !== "production",
    basePath: import.meta.env.VITE_STUDIO_PATH,
    isDirty: isSavePending,
    isExecuting: PROCESSING_STATES.includes(executionState),
  });

  return (
    <Button
      disabled={!isSavePending}
      size={"xs"}
      className="mr-2.5 min-w-16 text-xs"
      onClick={() => saveData()}
    >
      {isPending ? (
        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
      ) : (
        "Save"
      )}
    </Button>
  );
}
