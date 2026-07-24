import { type DialogCrudAction } from "@avplatform/ui/types";

import { KeystoreCrudForm } from "./KeystoreCrudForm";

interface KeystoreCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const KeystoreCrudDialogContent = ({
  crudAction,
  rowId,
}: KeystoreCrudDialogContentProps) => {
  return <KeystoreCrudForm rowId={rowId} crudAction={crudAction} />;
};
