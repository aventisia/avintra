import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { NavLink } from "react-router-dom";

import { useTenantRoute } from "../hooks/useTenantRoute";

interface TenantInstanceLinkProps {
  /** The ID of the job to open TenantInstance. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const TenantInstanceLink = ({
  rowId,
  cellValue,
}: TenantInstanceLinkProps) => {
  const { tname } = useTenantRoute();

  // Return the component
  return (
    <NavLink
      to={{
        pathname: rowId,
        search: `?tname=${encodeURIComponent(tname)}&iname=${encodeURIComponent(
          cellValue,
        )}`,
      }}
      className={cn(
        buttonVariants({ variant: "link" }),
        "!h-8 w-auto cursor-pointer truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </NavLink>
  );
};
