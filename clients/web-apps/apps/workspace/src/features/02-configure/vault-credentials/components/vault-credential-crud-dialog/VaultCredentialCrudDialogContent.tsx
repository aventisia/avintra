import { type DialogCrudAction } from "@avplatform/ui/types";

import VaultCredentialDynamicForm from "../../vault-credential-config/components/VaultCredentialDynamicForm";
import { VaultCredentialView } from "./VaultCredentialView";

interface VaultCredentialCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const VaultCredentialCrudDialogContent = ({
  crudAction,
  rowId,
}: VaultCredentialCrudDialogContentProps) => {
  if (crudAction === "read") return <VaultCredentialView rowId={rowId} />;

  return <VaultCredentialDynamicForm rowId={rowId} crudAction={crudAction} />;
};
