import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { NavLink } from "react-router-dom";

import { useOpenWorkItem } from "../../hooks/useOpenWorkItem";

interface WorkItemsTableCellLinkProps {
  /** The ID of the work items to open. */
  rowId: string;

  /** The cell value to display. */
  children: React.ReactNode;
}

export const WorkItemsTableCellLink = ({ rowId, children }: WorkItemsTableCellLinkProps) => {
  const { getWorkItemUrl } = useOpenWorkItem();

  // Return the component
  return (
    <NavLink
      to={getWorkItemUrl(rowId)}
      title={typeof children === "string" ? children : rowId}
      className={cn(
        buttonVariants({ variant: "link" }),
        "!h-8 w-auto cursor-pointer truncate font-mono font-medium tabular-nums text-foreground hover:text-primary-text",
      )}
    >
      {children}
    </NavLink>
  );
};
