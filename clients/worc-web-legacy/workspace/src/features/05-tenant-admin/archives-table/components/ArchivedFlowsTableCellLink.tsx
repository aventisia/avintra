import { buttonVariants } from "@aventisia/ui/buttons";
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
      to={`${window.location.origin}${import.meta.env.VITE_AGENTBUILDER_PATH}agent?f=${refId}&v=${rowId}`}
      className={cn(
        buttonVariants({ variant: "link" }),
        "!h-8 w-auto cursor-pointer truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </NavLink>
  );
};
