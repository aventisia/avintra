import { type DialogCrudAction } from "@avplatform/ui/types";

import { ToolWizard } from "../tool-wizard/ToolWizard";
import { ToolCrudForm } from "./ToolCrudForm";

interface ToolCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const ToolCrudDialogContent = ({ crudAction, rowId }: ToolCrudDialogContentProps) => {
  if (crudAction === "read") {
    return <ToolCrudForm rowId={rowId} crudAction={crudAction} />;
  }
  return <ToolWizard crudAction={crudAction} rowId={rowId} />;
};
