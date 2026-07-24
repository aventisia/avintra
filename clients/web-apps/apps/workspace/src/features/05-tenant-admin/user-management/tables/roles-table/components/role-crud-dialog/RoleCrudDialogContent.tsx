import { type DialogCrudAction } from "@avplatform/ui/types";

import { RoleCrudForm } from "./RoleCrudForm";

interface RoleCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const RoleCrudDialogContent = ({ crudAction, rowId }: RoleCrudDialogContentProps) => {
  return <RoleCrudForm rowId={rowId} crudAction={crudAction} />;
};
