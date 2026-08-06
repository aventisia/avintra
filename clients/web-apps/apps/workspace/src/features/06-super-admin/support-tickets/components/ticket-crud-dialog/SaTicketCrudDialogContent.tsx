import { type DialogCrudAction } from "@avplatform/ui/types";
import { SaTicketCrudForm } from "./SaTicketCrudForm";

interface SaTicketCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const SaTicketCrudDialogContent = ({ crudAction, rowId }: SaTicketCrudDialogContentProps) => {
  return <SaTicketCrudForm rowId={rowId} crudAction={crudAction} />;
};
