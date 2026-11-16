import { type DialogCrudAction } from "@avplatform/ui/types";
import { Navigate } from "react-router-dom";

import { TicketCrudForm } from "./TicketCrudForm";

interface TicketCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const TicketCrudDialogContent = ({ crudAction, rowId }: TicketCrudDialogContentProps) => {
  if (crudAction === "read") return <Navigate replace to={`/tenant/support/tickets/${rowId}`} />;

  return <TicketCrudForm rowId={rowId} crudAction={crudAction} />;
};
