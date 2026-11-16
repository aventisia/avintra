import { type DialogCrudAction } from "@avplatform/ui/types";

import { UserCrudForm } from "./UserCrudForm";
import { UserView } from "./UserView";

interface UserCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const UserCrudDialogContent = ({ crudAction, rowId }: UserCrudDialogContentProps) => {
  if (crudAction === "read") return <UserView rowId={rowId} />;

  return <UserCrudForm rowId={rowId} crudAction={crudAction} />;
};
