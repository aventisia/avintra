import { type DialogCrudAction } from "@avplatform/ui/types";
import { Navigate } from "react-router-dom";

import { getToolDetailsPath } from "../../utils/tool-details-path.util";
import { ToolWizard } from "../tool-wizard/ToolWizard";

type ToolCrudDialogContentProps = {
  crudAction: DialogCrudAction;
  rowId: string;
};

export const ToolCrudDialogContent = ({ crudAction, rowId }: ToolCrudDialogContentProps) => {
  if (crudAction === "read") {
    return <Navigate to={getToolDetailsPath(rowId)} replace />;
  }
  return <ToolWizard crudAction={crudAction} rowId={rowId} />;
};
