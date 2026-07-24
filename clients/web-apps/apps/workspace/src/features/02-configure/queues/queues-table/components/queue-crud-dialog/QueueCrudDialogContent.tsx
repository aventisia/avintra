import { type DialogCrudAction } from "@avplatform/ui/types";

import { QueueCrudForm } from "./QueueCrudForm";

interface QueueCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const QueueCrudDialogContent = ({ crudAction, rowId }: QueueCrudDialogContentProps) => {
  return <QueueCrudForm rowId={rowId} crudAction={crudAction as "create" | "update" | "read"} />;
};
