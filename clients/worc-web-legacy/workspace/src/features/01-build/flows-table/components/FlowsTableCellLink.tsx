import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { NavLink } from "react-router-dom";

interface FlowsTableCellLinkProps {
  /** The ID of the flow to open. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const FlowsTableCellLink = ({
  rowId,
  cellValue,
}: FlowsTableCellLinkProps) => {
  // Return the component
  return (
    <NavLink
      to={`${window.location.origin}${import.meta.env.VITE_STUDIO_PATH}agent?f=${rowId}`}
      className={cn(
        buttonVariants({ variant: "link" }),
        "h-auto w-auto cursor-pointer truncate inline-block  font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </NavLink>
  );
};
