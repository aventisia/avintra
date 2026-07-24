import { type DialogCrudAction } from "@avplatform/ui/types";

import { UserCrudForm } from "./UserCrudForm";

interface UserCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const UserCrudDialogContent = ({ crudAction, rowId }: UserCrudDialogContentProps) => {
  return <UserCrudForm rowId={rowId} crudAction={crudAction} />;
};
