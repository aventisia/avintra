import { type DialogCrudAction } from "@avplatform/ui/types";

import { SpaceCrudForm } from "./SpaceCrudForm";
import { SpaceView } from "./SpaceView";

interface SpaceCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const SpaceCrudDialogContent = ({ crudAction, rowId }: SpaceCrudDialogContentProps) => {
  if (crudAction === "read") return <SpaceView rowId={rowId} />;

  return <SpaceCrudForm rowId={rowId} crudAction={crudAction} />;
};
