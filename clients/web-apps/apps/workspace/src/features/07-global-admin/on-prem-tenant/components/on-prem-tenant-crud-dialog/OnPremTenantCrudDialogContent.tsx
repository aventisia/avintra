import { type DialogCrudAction } from "@avplatform/ui/types";

import { OnPremTenantCrudForm } from "./OnPremTenantCrudForm";

interface OnPremTenantCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const OnPremTenantCrudDialogContent = ({
  crudAction,
  rowId,
}: OnPremTenantCrudDialogContentProps) => {
  return <OnPremTenantCrudForm rowId={rowId} crudAction={crudAction} />;
};
