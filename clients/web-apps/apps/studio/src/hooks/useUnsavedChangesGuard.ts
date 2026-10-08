import { useShowAlertHandler } from "@avplatform/ui/hooks";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

/**
 * Wraps actions that replace the canvas (switching flow/version, creating a
 * version) with the "Discard changes?" alert when there is unpersisted work.
 * Uses the same dirty rule as SaveFlow / usePreventNavigation
 * (`isSavePending || isFormDirty`), which those route blockers miss because
 * these actions keep the `/agent` path and only change the query string.
 */
export const useUnsavedChangesGuard = () => {
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const isSavePending = useReactFlowExtStore((state) => state.isSavePending);
  const isFormDirty = useDynamicConfigPanelStore((state) => state.isFormDirty);

  return (proceed: () => void): void => {
    if (!isSavePending && !isFormDirty) {
      proceed();
      return;
    }

    showDefaultAlertDialog({
      alertType: "unsaved",
      confirmActionFn: proceed,
    });
  };
};
