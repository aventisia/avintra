import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { NavLink } from "react-router-dom";

interface JobsTableCellLinkProps {
  /** The ID of the job to open execution log. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const JobsTableCellLink = ({
  rowId,
  cellValue,
}: JobsTableCellLinkProps) => {
  // Return the component
  return (
    <NavLink
      to={rowId}
      className={cn(
        buttonVariants({ variant: "link" }),
        "!h-8 w-auto cursor-pointer truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </NavLink>
  );
};
