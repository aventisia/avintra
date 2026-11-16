import { type DialogCrudAction } from "@avplatform/ui/types";

import { UiBuilderCrudForm } from "./UiBuilderCrudForm";

interface UiBuilderCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const UiBuilderCrudDialogContent = ({
  crudAction,
  rowId,
}: UiBuilderCrudDialogContentProps) => {
  return <UiBuilderCrudForm rowId={rowId} crudAction={crudAction} />;
};
