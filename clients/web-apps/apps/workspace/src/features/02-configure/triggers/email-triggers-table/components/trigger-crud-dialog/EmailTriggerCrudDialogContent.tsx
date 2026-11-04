import { type DialogCrudAction } from "@avplatform/ui/types";

import { EmailTriggerView } from "./EmailTriggerView";
import { TriggerCrudForm } from "./TriggerCrudForm";

interface EmailTriggerCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const EmailTriggerCrudDialogContent = ({
  crudAction,
  rowId,
}: EmailTriggerCrudDialogContentProps) => {
  if (crudAction === "read") return <EmailTriggerView rowId={rowId} />;

  return <TriggerCrudForm rowId={rowId} crudAction={crudAction as "create" | "update"} />;
};
