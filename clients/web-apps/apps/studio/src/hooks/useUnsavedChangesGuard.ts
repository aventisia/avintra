import { useShowAlertHandler } from "@avplatform/ui/hooks";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { isCanvasDirty } from "@/features/react-flow/hooks/useSaveFlow";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

/**
 * Wraps actions that replace the canvas (switching flow/version, creating a
 * version) with the "Discard changes?" alert when there is unpersisted work.
 *
 * The dirty state is read synchronously from the stores at call time instead of
 * from the `isSavePending` selector, because that flag is refreshed on a 300ms
 * debounce and would miss an edit made immediately before the action, silently
 * dropping it. Uses the same rule as SaveFlow (`isCanvasDirty(...) || isFormDirty`)
 * which the route blockers miss because these actions keep the `/agent` path
 * and only change the query string.
 *
 * IMPORTANT NOTE: confirming this alert discards all uncommitted canvas and
 * config-form changes. Unlike the flush-based guard it replaces, mid-edit
 * (possibly invalid) config values are NOT preserved.
 */
export const useUnsavedChangesGuard = () => {
  const { showDefaultAlertDialog } = useShowAlertHandler();

  return (proceed: () => void): void => {
    const { isSavePending, savedSnapshot, nodes, edges, flowVariablesObject } =
      useReactFlowExtStore.getState();
    const isFormDirty = useDynamicConfigPanelStore.getState().isFormDirty;

    const isDirty =
      isFormDirty ||
      isCanvasDirty(savedSnapshot, isSavePending, {
        nodes,
        edges,
        flowVariablesObject: flowVariablesObject ?? [],
      });

    if (!isDirty) {
      proceed();
      return;
    }

    showDefaultAlertDialog({
      alertType: "unsaved",
      confirmActionFn: proceed,
    });
  };
};
