import { type DialogCrudAction } from "@avplatform/ui/types";

import { TriggerCrudForm } from "./TriggerCrudForm";

interface MessageTriggerCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const MessageTriggerCrudDialogContent = ({
  crudAction,
  rowId,
}: MessageTriggerCrudDialogContentProps) => {
  return <TriggerCrudForm rowId={rowId} crudAction={crudAction as "create" | "update" | "read"} />;
};
