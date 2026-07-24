import { type DialogCrudAction } from "@avplatform/ui/types";

import { OnPremCrudForm } from "./OnPremCrudForm";

interface OnPremCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const OnPremCrudDialogContent = ({ crudAction, rowId }: OnPremCrudDialogContentProps) => {
  return <OnPremCrudForm rowId={rowId} crudAction={crudAction} />;
};
