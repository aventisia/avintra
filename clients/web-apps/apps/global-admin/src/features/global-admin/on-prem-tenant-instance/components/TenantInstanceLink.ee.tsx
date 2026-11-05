import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { NavLink } from "react-router-dom";

import { useTenantRoute } from "../hooks/useTenantRoute.ee";

interface TenantInstanceLinkProps {
  /** The ID of the job to open TenantInstance. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const TenantInstanceLink = ({ rowId, cellValue }: TenantInstanceLinkProps) => {
  const { tname } = useTenantRoute();

  // Return the component
  return (
    <NavLink
      to={{
        pathname: rowId,
        search: `?tname=${encodeURIComponent(tname)}&iname=${encodeURIComponent(cellValue)}`,
      }}
      className={cn(
        buttonVariants({ variant: "link" }),
        "!h-8 w-auto cursor-pointer truncate font-medium text-ink hover:text-primary-text",
      )}
    >
      {cellValue}
    </NavLink>
  );
};
