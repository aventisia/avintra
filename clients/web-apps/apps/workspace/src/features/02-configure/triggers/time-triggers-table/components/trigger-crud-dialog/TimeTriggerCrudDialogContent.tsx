import { type DialogCrudAction } from "@avplatform/ui/types";

import { TimeTriggerView } from "./TimeTriggerView";
import { TriggerCrudForm } from "./TriggerCrudForm";

interface TimeTriggerCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const TimeTriggerCrudDialogContent = ({
  crudAction,
  rowId,
}: TimeTriggerCrudDialogContentProps) => {
  if (crudAction === "read") return <TimeTriggerView rowId={rowId} />;

  return <TriggerCrudForm rowId={rowId} crudAction={crudAction as "create" | "update"} />;
};
