import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { NavLink } from "react-router-dom";

interface QueuesTableCellLinkProps {
  /** The ID of the queue to open. */
  rowId: string;

  /** The cell value to display. */
  children: React.ReactNode;
}

export const QueuesTableCellLink = ({
  rowId,
  children,
}: QueuesTableCellLinkProps) => {
  // Return the component
  return (
    <NavLink
      to={`/configure/queues/work-items/${rowId}`}
      className={cn(
        buttonVariants({ variant: "link" }),
        "!h-8 w-auto cursor-pointer truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {children}
    </NavLink>
  );
};
