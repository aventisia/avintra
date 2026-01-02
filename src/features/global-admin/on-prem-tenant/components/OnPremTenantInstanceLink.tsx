import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

import { useNavigateToTenant } from "../hooks/useNavigateToTenant";

interface OnPremTenantInstanceLinkProps {
  /** The ID of the job to open TenantInstance. */
  rowId: string;

  /** The cell value to display. */
  cellValue: string;
}

export const OnPremTenantInstanceLink = ({
  rowId,
  cellValue,
}: OnPremTenantInstanceLinkProps) => {
  const { handleOpenTenant } = useNavigateToTenant();
  // Return the component
  return (
    <Button
      onClick={() => handleOpenTenant(rowId, cellValue)}
      variant={"link"}
      className={cn(
        "!h-8 w-auto truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};
