import { type DialogCrudAction } from "@avplatform/ui/types";

import { TriggerCrudForm } from "./TriggerCrudForm";

interface WebhookTriggerCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const WebhookTriggerCrudDialogContent = ({
  crudAction,
  rowId,
}: WebhookTriggerCrudDialogContentProps) => {
  return <TriggerCrudForm rowId={rowId} crudAction={crudAction as "create" | "update" | "read"} />;
};
