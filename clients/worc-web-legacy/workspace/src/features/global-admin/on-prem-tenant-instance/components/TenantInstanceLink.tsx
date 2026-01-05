import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";

import { useNavigateToInstance } from "../hooks/useNavigateToInstance";

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
  const { handleOpenInstance } = useNavigateToInstance();

  // Return the component
  return (
    <Button
      onClick={() => handleOpenInstance(rowId, cellValue)}
      variant={"link"}
      className={cn(
        "!h-8 w-auto truncate font-medium text-foreground hover:text-primary",
      )}
    >
      {cellValue}
    </Button>
  );
};
