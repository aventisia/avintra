import { type DialogCrudAction } from "@avplatform/ui/types";

import { SubPlansCrudForm } from "./SubPlansCrudForm";

interface SubPlansCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const SubPlansCrudDialogContent = ({
  crudAction,
  rowId,
}: SubPlansCrudDialogContentProps) => {
  return <SubPlansCrudForm rowId={rowId} crudAction={crudAction as "create" | "update" | "read"} />;
};
