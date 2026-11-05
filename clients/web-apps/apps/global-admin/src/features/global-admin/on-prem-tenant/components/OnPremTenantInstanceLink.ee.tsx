import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { NavLink } from "react-router-dom";

interface OnPremTenantInstanceLinkProps {
  /** The ID of the job to open TenantInstance. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const OnPremTenantInstanceLink = ({ rowId, cellValue }: OnPremTenantInstanceLinkProps) => {
  // Return the component
  return (
    <NavLink
      to={{
        pathname: `/on-prem-tenants/${rowId}`,
        search: `?tname=${encodeURIComponent(cellValue)}`,
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
