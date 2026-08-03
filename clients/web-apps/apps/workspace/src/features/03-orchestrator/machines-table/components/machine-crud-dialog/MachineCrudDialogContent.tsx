import { useCrudDialogUrlState } from "@avplatform/ui/data-table";
import { toast } from "@avplatform/ui/sonner";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { useEffect } from "react";

import { MachineCrudForm } from "./MachineCrudForm";
import { MachineView } from "./MachineView";

interface MachineCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const MachineCrudDialogContent = ({ crudAction, rowId }: MachineCrudDialogContentProps) => {
  const { closeCrudDialog } = useCrudDialogUrlState();

  // Machines are registered through the desktop app, not from the web frontend.
  // Notify and close the dialog instead of rendering a create form.
  useEffect(() => {
    if (crudAction !== "create") return;
    toast.info("Invalid action.");
    closeCrudDialog();
  }, [crudAction, closeCrudDialog]);

  if (crudAction === "read") {
    return <MachineView rowId={rowId} />;
  }

  if (crudAction === "update") {
    return <MachineCrudForm rowId={rowId} />;
  }

  return null;
};
