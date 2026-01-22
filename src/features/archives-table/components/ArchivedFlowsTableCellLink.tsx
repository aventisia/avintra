import { cn } from "@aventisia/ui/lib";
import { NavLink } from "react-router-dom";

interface ArchivedFlowsTableCellLinkProps {
  /** The version ID of the Archived flow to open. */
  rowId: string;

  /** The ID of the Archived flow to open. */
  refId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const ArchivedFlowsTableCellLink = ({
  rowId,
  refId,
  cellValue,
}: ArchivedFlowsTableCellLinkProps) => {
  // Return the component
  return (
    <NavLink
      to={`${import.meta.env.VITE_AGENTBUILDER_PATH}agent?f=${refId}&v=${rowId}`}
      className={cn(
        "!h-8 w-auto truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </NavLink>
  );
};
