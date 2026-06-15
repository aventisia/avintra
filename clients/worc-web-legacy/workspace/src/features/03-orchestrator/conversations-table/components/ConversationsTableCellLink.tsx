import { useCarryParams } from "@/hooks/useForwardQueryParams";

import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { NavLink } from "react-router-dom";

interface ConversationsTableCellLinkProps {
  /** The ID of the job to open execution log. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const ConversationsTableCellLink = ({
  rowId,
  cellValue,
}: ConversationsTableCellLinkProps) => {
  // forward query params
  const withQueryParams = useCarryParams(["from", "to"]);

  // Return the component
  return (
    <NavLink
      to={withQueryParams(rowId)}
      className={cn(
        buttonVariants({ variant: "link" }),
        "h-auto max-w-80 cursor-pointer  truncate  inline-block  font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </NavLink>
  );
};
