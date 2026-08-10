import { type DialogCrudAction } from "@avplatform/ui/types";

import { SpaceCrudForm } from "./SpaceCrudForm";

interface SpaceCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const SpaceCrudDialogContent = ({ crudAction, rowId }: SpaceCrudDialogContentProps) => {
  return <SpaceCrudForm rowId={rowId} crudAction={crudAction} />;
};
