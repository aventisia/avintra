import { type DialogCrudAction } from "@avplatform/ui/types";

import VaultCredentialDynamicForm from "../../vault-credential-config/components/VaultCredentialDynamicForm";

interface VaultCredentialCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const VaultCredentialCrudDialogContent = ({
  crudAction,
  rowId,
}: VaultCredentialCrudDialogContentProps) => {
  return <VaultCredentialDynamicForm rowId={rowId} crudAction={crudAction} />;
};
