import { type DialogCrudAction } from "@avplatform/ui/types";

import { FlowCrudForm } from "./FlowCrudForm";

interface FlowCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const FlowCrudDialogContent = ({ crudAction, rowId }: FlowCrudDialogContentProps) => {
  return <FlowCrudForm rowId={rowId} crudAction={crudAction} />;
};
