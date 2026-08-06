import { type DialogCrudAction } from "@avplatform/ui/types";
import { TicketCrudForm } from "./TicketCrudForm";

interface TicketCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const TicketCrudDialogContent = ({ crudAction, rowId }: TicketCrudDialogContentProps) => {
  return <TicketCrudForm rowId={rowId} crudAction={crudAction} />;
};
