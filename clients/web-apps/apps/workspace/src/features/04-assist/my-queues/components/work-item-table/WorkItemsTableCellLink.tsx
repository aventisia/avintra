import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { NavLink } from "react-router-dom";

import { useOpenWorkItem } from "../../hooks/useOpenWorkItem";

interface WorkItemsTableCellLinkProps {
  /** The ID of the work items to open. */
  rowId: string;

  /** When true, the work item is shown as plain text (not a clickable link). */
  viewOnly?: boolean;

  /** The cell value to display. */
  children: React.ReactNode;
}

export const WorkItemsTableCellLink = ({ rowId, viewOnly = false, children }: WorkItemsTableCellLinkProps) => {
  const { getWorkItemUrl } = useOpenWorkItem();

  if (viewOnly) {
    return <div className="w-40 truncate font-medium text-foreground">{children}</div>;
  }

  // Return the component
  return (
    <NavLink
      to={getWorkItemUrl(rowId)}
      className={cn(
        buttonVariants({ variant: "link" }),
        "!h-8 w-auto cursor-pointer truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {children}
    </NavLink>
  );
};
