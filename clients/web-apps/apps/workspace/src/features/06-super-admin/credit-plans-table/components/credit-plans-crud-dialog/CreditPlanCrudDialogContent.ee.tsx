import { type DialogCrudAction } from "@avplatform/ui/types";

import { CreditPlansCrudForm } from "./CreditPlansCrudForm.ee";

interface CreditPlanCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const CreditPlanCrudDialogContent = ({
  crudAction,
  rowId,
}: CreditPlanCrudDialogContentProps) => {
  return (
    <CreditPlansCrudForm rowId={rowId} crudAction={crudAction as "create" | "update" | "read"} />
  );
};
