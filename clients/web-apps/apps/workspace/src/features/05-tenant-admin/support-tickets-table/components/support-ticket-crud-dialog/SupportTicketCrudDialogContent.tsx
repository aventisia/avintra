import { type DialogCrudAction } from "@avplatform/ui/types";

import { SupportTicketCrudForm } from "./SupportTicketCrudForm";

interface SupportTicketCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const SupportTicketCrudDialogContent = ({
  crudAction,
  rowId,
}: SupportTicketCrudDialogContentProps) => {
  return <SupportTicketCrudForm rowId={rowId} crudAction={crudAction} />;
};
