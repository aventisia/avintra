import { type DialogCrudAction } from "@avplatform/ui/types";

import VaultDynamicForm from "../../vault-config/components/VaultDynamicForm";

interface VaultCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const VaultCrudDialogContent = ({ crudAction, rowId }: VaultCrudDialogContentProps) => {
  return <VaultDynamicForm rowId={rowId} crudAction={crudAction} />;
};
