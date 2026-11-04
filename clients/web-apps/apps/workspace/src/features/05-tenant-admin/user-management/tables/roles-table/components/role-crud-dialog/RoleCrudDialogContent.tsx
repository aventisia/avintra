import { type DialogCrudAction } from "@avplatform/ui/types";

import { RoleCrudForm } from "./RoleCrudForm";
import { RoleView } from "./RoleView";

interface RoleCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const RoleCrudDialogContent = ({ crudAction, rowId }: RoleCrudDialogContentProps) => {
  if (crudAction === "read") return <RoleView rowId={rowId} />;

  return <RoleCrudForm rowId={rowId} crudAction={crudAction} />;
};
