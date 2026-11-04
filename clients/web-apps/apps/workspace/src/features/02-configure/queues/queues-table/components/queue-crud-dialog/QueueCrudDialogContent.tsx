import { type DialogCrudAction } from "@avplatform/ui/types";

import { QueueCrudForm } from "./QueueCrudForm";
import { QueueView } from "./QueueView";

interface QueueCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const QueueCrudDialogContent = ({ crudAction, rowId }: QueueCrudDialogContentProps) => {
  if (crudAction === "read") return <QueueView rowId={rowId} />;

  return <QueueCrudForm rowId={rowId} crudAction={crudAction} />;
};
