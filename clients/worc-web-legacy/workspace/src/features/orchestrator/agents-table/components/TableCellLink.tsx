import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { NavLink } from "react-router-dom";

interface TableCellLinkProps {
  /** The agent ID to open. */
  rowId: string;

  /** The version ID */
  versionId: string;

  /** The cell value to display. */
  cellValue: string;

  /** Type of row (Agent/AIProject). */
  type: string;
}

export const TableCellLink = ({
  rowId,
  cellValue,

  versionId,
}: TableCellLinkProps) => {
  // Return the component
  return (
    <NavLink
      to={`${window.location.origin}${import.meta.env.VITE_AGENTBUILDER_PATH}agent?f=${rowId}&v=${versionId}`}
      target="_blank"
      className={cn(
        buttonVariants({ variant: "link" }),
        "!h-8 w-auto cursor-pointer truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </NavLink>
  );
};
