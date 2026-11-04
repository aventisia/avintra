import { type DialogCrudAction } from "@avplatform/ui/types";

import { TriggerCrudForm } from "./TriggerCrudForm";
import { WebhookTriggerView } from "./WebhookTriggerView";

interface WebhookTriggerCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const WebhookTriggerCrudDialogContent = ({
  crudAction,
  rowId,
}: WebhookTriggerCrudDialogContentProps) => {
  if (crudAction === "read") return <WebhookTriggerView rowId={rowId} />;

  return <TriggerCrudForm rowId={rowId} crudAction={crudAction as "create" | "update"} />;
};
