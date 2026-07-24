import { type DialogCrudAction } from "@avplatform/ui/types";

import { KBCrudForm } from "./KBCrudForm";

interface KBCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const KBCrudDialogContent = ({ crudAction, rowId }: KBCrudDialogContentProps) => {
  return <KBCrudForm rowId={rowId} crudAction={crudAction} />;
};
