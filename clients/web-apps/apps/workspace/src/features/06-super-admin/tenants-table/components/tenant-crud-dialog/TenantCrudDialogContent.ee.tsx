import { type DialogCrudAction } from "@avplatform/ui/types";

import { TenantCrudForm } from "./TenantCrudForm.ee";

interface TenantCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const TenantCrudDialogContent = ({ crudAction, rowId }: TenantCrudDialogContentProps) => {
  return <TenantCrudForm rowId={rowId} crudAction={crudAction} />;
};
