import { type DialogCrudAction } from "@avplatform/ui/types";

import { TriggerCrudForm } from "./TriggerCrudForm";

interface EmailTriggerCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const EmailTriggerCrudDialogContent = ({
  crudAction,
  rowId,
}: EmailTriggerCrudDialogContentProps) => {
  return <TriggerCrudForm rowId={rowId} crudAction={crudAction as "create" | "update" | "read"} />;
};
