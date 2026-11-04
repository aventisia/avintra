import { type DialogCrudAction } from "@avplatform/ui/types";
import { Navigate } from "react-router-dom";

import { SaTicketCrudForm } from "./SaTicketCrudForm.ee";

interface SaTicketCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const SaTicketCrudDialogContent = ({
  crudAction,
  rowId,
}: SaTicketCrudDialogContentProps) => {
  if (crudAction === "read") return <Navigate replace to={`/sa/support/tickets/${rowId}`} />;

  return <SaTicketCrudForm rowId={rowId} crudAction={crudAction} />;
};
