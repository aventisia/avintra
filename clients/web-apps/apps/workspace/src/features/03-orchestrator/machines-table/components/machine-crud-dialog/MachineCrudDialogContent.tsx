import { type DialogCrudAction } from "@avplatform/ui/types";

import { MachineCrudForm } from "./MachineCrudForm";
import { MachineView } from "./MachineView";

interface MachineCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const MachineCrudDialogContent = ({ crudAction, rowId }: MachineCrudDialogContentProps) => {
  if (crudAction === "read") {
    return <MachineView rowId={rowId} />;
  }

  return <MachineCrudForm rowId={rowId} crudAction={crudAction} />;
};
