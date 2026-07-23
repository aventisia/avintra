import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { NavLink } from "react-router-dom";

import { TABLE_TAB_QUERY_PARAM } from "../constants";
import { useTableTab } from "../hooks/useTableTab";

interface QueuesTableCellLinkProps {
  /** The ID of the queue to open. */
  rowId: string;

  name: string;

  /** The cell value to display. */
  children: React.ReactNode;
}

export const QueuesTableCellLink = ({ rowId, name, children }: QueuesTableCellLinkProps) => {
  // Use to handle Personal/Shared tabs list
  const { currentTab } = useTableTab();

  // Return the component
  return (
    <NavLink
      to={`/configure/queues/work-items/${rowId}?${TABLE_TAB_QUERY_PARAM}=${currentTab}&name=${name}`}
      className={cn(
        buttonVariants({ variant: "link" }),
        "h-auto w-auto cursor-pointer truncate inline-block  font-medium text-foreground hover:text-primary",
      )}
    >
      {children}
    </NavLink>
  );
};
