import { type DialogCrudAction } from "@avplatform/ui/types";

import { MessageTriggerView } from "./MessageTriggerView";
import { TriggerCrudForm } from "./TriggerCrudForm";

interface MessageTriggerCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const MessageTriggerCrudDialogContent = ({
  crudAction,
  rowId,
}: MessageTriggerCrudDialogContentProps) => {
  if (crudAction === "read") return <MessageTriggerView rowId={rowId} />;

  return <TriggerCrudForm rowId={rowId} crudAction={crudAction as "create" | "update"} />;
};
