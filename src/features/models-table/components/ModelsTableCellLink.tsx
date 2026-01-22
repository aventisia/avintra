import { cn } from "@aventisia/ui/lib";
import { NavLink } from "react-router-dom";

import { useOpenModel } from "../hooks/useOpenModel";

interface ModelTableCellLinkProps {
  /** The ID of the model to open. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const ModelsTableCellLink = ({
  rowId,
  cellValue,
}: ModelTableCellLinkProps) => {
  // Get handle open label data action function
  const handleOpenModelAction = useOpenModel();

  // Return the component
  return (
    <NavLink
      to={handleOpenModelAction(rowId, "View")}
      className={cn(
        "!h-6 w-auto justify-start truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </NavLink>
  );
};
