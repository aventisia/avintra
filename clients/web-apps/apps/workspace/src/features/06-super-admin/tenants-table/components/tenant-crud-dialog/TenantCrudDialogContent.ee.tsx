import { type DialogCrudAction } from "@avplatform/ui/types";

import { TenantCrudForm } from "./TenantCrudForm.ee";
import { TenantView } from "./TenantView.ee";

interface TenantCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const TenantCrudDialogContent = ({ crudAction, rowId }: TenantCrudDialogContentProps) => {
  if (crudAction === "read") return <TenantView rowId={rowId} />;

  return <TenantCrudForm rowId={rowId} crudAction={crudAction} />;
};
