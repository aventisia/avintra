import { type DialogCrudAction } from "@avplatform/ui/types";

import { ToolCrudForm } from "./ToolCrudForm";

interface ToolCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const ToolCrudDialogContent = ({ crudAction, rowId }: ToolCrudDialogContentProps) => {
  return <ToolCrudForm rowId={rowId} crudAction={crudAction} />;
};
