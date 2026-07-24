import { type DialogCrudAction } from "@avplatform/ui/types";

import { TriggerCrudForm } from "./TriggerCrudForm";

interface TimeTriggerCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const TimeTriggerCrudDialogContent = ({
  crudAction,
  rowId,
}: TimeTriggerCrudDialogContentProps) => {
  return <TriggerCrudForm rowId={rowId} crudAction={crudAction as "create" | "update" | "read"} />;
};
