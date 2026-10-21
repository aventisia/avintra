import { type DialogCrudAction } from "@avplatform/ui/types";

import { ConfigStoreCrudForm } from "./ConfigStoreCrudForm";

interface ConfigStoreCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const ConfigStoreCrudDialogContent = ({
  crudAction,
  rowId,
}: ConfigStoreCrudDialogContentProps) => {
  return <ConfigStoreCrudForm rowId={rowId} crudAction={crudAction} />;
};
