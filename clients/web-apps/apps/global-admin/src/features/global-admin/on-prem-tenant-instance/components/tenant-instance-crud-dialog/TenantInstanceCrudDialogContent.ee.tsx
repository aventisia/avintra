import { type DialogCrudAction } from "@avplatform/ui/types";

import { TenantInstanceCrudForm } from "./TenantInstanceCrudForm.ee";
import { TenantInstanceView } from "./TenantInstanceView.ee";

interface TenantInstanceCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const TenantInstanceCrudDialogContent = ({
  crudAction,
  rowId,
}: TenantInstanceCrudDialogContentProps) => {
  if (crudAction === "read") return <TenantInstanceView rowId={rowId} />;

  return <TenantInstanceCrudForm rowId={rowId} crudAction={crudAction} />;
};
