import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { useAlertDialogStore } from "@avplatform/ui/stores";
import { useCallback } from "react";

import { useDynamicConfigPanelStore } from "../stores/dcp-store";

/**
 * Guards DCP panel navigation (X close, Escape, node switch) behind the
 * form-dirty flag. Runs proceed() immediately when the form is clean,
 * otherwise shows the shared "Discard changes?" confirm first. Reads state
 * via getState() so event handlers never capture a stale dirty value.
 */
export const useDCPNavigationGuard = () => {
  const { showDefaultAlertDialog } = useShowAlertHandler();

  return useCallback(
    (proceed: () => void) => {
      // A confirm is already open — ignore stacked requests.
      if (useAlertDialogStore.getState().isAlertDialogOpen) return;

      if (!useDynamicConfigPanelStore.getState().isFormDirty) {
        proceed();
        return;
      }

      showDefaultAlertDialog({
        confirmActionFn: proceed,
        alertType: "unsaved",
      });
    },
    [showDefaultAlertDialog],
  );
};
