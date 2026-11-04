import { type DialogCrudAction } from "@avplatform/ui/types";

import { CreditPlanView } from "./CreditPlanView.ee";
import { CreditPlansCrudForm } from "./CreditPlansCrudForm.ee";

interface CreditPlanCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const CreditPlanCrudDialogContent = ({
  crudAction,
  rowId,
}: CreditPlanCrudDialogContentProps) => {
  if (crudAction === "read") return <CreditPlanView rowId={rowId} />;

  return <CreditPlansCrudForm rowId={rowId} crudAction={crudAction} />;
};
