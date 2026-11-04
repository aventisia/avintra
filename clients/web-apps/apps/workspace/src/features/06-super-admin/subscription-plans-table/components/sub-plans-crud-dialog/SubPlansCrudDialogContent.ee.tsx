import { type DialogCrudAction } from "@avplatform/ui/types";

import { SubPlanView } from "./SubPlanView.ee";
import { SubPlansCrudForm } from "./SubPlansCrudForm.ee";

interface SubPlansCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const SubPlansCrudDialogContent = ({
  crudAction,
  rowId,
}: SubPlansCrudDialogContentProps) => {
  if (crudAction === "read") return <SubPlanView rowId={rowId} />;

  return <SubPlansCrudForm rowId={rowId} crudAction={crudAction} />;
};
