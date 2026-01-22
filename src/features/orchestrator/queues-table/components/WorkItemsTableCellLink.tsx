import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { NavLink } from "react-router-dom";

interface WorkItemsTableCellLinkProps {
  /** The ID of the work items to open. */
  rowId: string;

  /** The cell value to display. */
  children: React.ReactNode;
}

export const WorkItemsTableCellLink = ({
  rowId,
  children,
}: WorkItemsTableCellLinkProps) => {
  // Return the component
  return (
    <NavLink
      to={`/orchestrator/queues/work-items/${rowId}`}
      className={cn(
        buttonVariants({ variant: "link" }),
        "!h-8 w-auto cursor-pointer truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {children}
    </NavLink>
  );
};
