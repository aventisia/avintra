import { type DialogCrudAction } from "@avplatform/ui/types";

import { ApiKeyCrudForm } from "./ApiKeyCrudForm";
import { ApiKeyView } from "./ApiKeyView";

interface ApiKeyCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const ApiKeyCrudDialogContent = ({
  crudAction,
  rowId,
}: ApiKeyCrudDialogContentProps) => {
  if (crudAction === "read") {
    return <ApiKeyView rowId={rowId} />;
  }

  return <ApiKeyCrudForm rowId={rowId} crudAction={crudAction} />;
};
