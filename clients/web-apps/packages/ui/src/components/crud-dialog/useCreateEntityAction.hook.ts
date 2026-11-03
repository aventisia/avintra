import { useHotkeys } from "react-hotkeys-hook";

import { useActionLock } from "@/ui/components/action-lock";
import { type CrudEntityKey } from "@/ui/types";

import { useCrudDialogUrlState } from "./useCrudDialogUrlState";

/**
 * Opens an entity's create dialog; Ctrl+Alt+N opens the one of `hotkeyEntity`.
 */
export const useCreateEntityAction = (hotkeyEntity: CrudEntityKey) => {
  const { openCrudDialog } = useCrudDialogUrlState();
  const { locked } = useActionLock();

  const openCreateDialog = (entity: CrudEntityKey) => {
    openCrudDialog({
      entity,
      crudAction: "create",
      rowId: window.crypto.randomUUID(),
    });
  };

  useHotkeys("ctrl+alt+n", () => openCreateDialog(hotkeyEntity), {
    preventDefault: true,
    enabled: !locked,
  });

  return { locked, openCreateDialog };
};
