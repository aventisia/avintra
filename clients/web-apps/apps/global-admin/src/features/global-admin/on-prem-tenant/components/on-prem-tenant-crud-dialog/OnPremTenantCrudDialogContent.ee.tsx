import { type DialogCrudAction } from "@avplatform/ui/types";

import { OnPremTenantCrudForm } from "./OnPremTenantCrudForm.ee";
import { OnPremTenantView } from "./OnPremTenantView.ee";

interface OnPremTenantCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const OnPremTenantCrudDialogContent = ({
  crudAction,
  rowId,
}: OnPremTenantCrudDialogContentProps) => {
  if (crudAction === "read") return <OnPremTenantView rowId={rowId} />;

  return <OnPremTenantCrudForm rowId={rowId} crudAction={crudAction} />;
};
