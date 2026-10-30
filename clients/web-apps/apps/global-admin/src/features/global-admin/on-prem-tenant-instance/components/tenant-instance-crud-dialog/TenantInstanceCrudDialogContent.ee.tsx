import { type DialogCrudAction } from "@avplatform/ui/types";

import { TenantInstanceCrudForm } from "./TenantInstanceCrudForm.ee";

interface TenantInstanceCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const TenantInstanceCrudDialogContent = ({
  crudAction,
  rowId,
}: TenantInstanceCrudDialogContentProps) => {
  return <TenantInstanceCrudForm rowId={rowId} crudAction={crudAction} />;
};
